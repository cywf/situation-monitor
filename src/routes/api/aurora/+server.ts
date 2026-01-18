/**
 * Aurora Activity Server Route
 * Fetches aurora forecast data based on Kp index from NOAA/SWPC
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout } from '$lib/server';
import type { AuroraStatus, AuroraVisibility } from '$lib/types/intel';

const SWPC_BASE_URL = 'https://services.swpc.noaa.gov';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface KpForecastData {
	time_tag: string;
	kp?: number;
	observed?: string;
	noaa_scale?: string;
}

/**
 * Calculate aurora visibility latitude based on Kp index
 * Kp 0-1: Arctic only (>70°)
 * Kp 2-3: Northern Scandinavia (>65°)
 * Kp 4-5: Northern Canada, Scotland (>60°)
 * Kp 6-7: Northern US, Central Europe (>50°)
 * Kp 8-9: Most of US and Europe (>40°)
 */
function getVisibilityFromKp(kp: number): { latitude: number; probability: AuroraVisibility } {
	if (kp >= 8) return { latitude: 40, probability: 'very-high' };
	if (kp >= 6) return { latitude: 50, probability: 'high' };
	if (kp >= 4) return { latitude: 60, probability: 'moderate' };
	if (kp >= 2) return { latitude: 65, probability: 'low' };
	return { latitude: 70, probability: 'none' };
}

/**
 * Determine trend from recent Kp values
 */
function calculateTrend(values: number[]): 'rising' | 'stable' | 'falling' {
	if (values.length < 3) return 'stable';

	const recent = values.slice(-3);
	const avg1 = recent[0];
	const avg2 = (recent[1] + recent[2]) / 2;

	if (avg2 > avg1 + 0.5) return 'rising';
	if (avg2 < avg1 - 0.5) return 'falling';
	return 'stable';
}

export const GET: RequestHandler = async () => {
	// Check cache
	const cacheKey = 'aurora:status';
	const cached = serverCache.get<AuroraStatus>(cacheKey);
	if (cached) {
		return json({
			status: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	try {
		// Fetch Kp index forecast
		const result = await fetchWithTimeout<KpForecastData[]>(
			`${SWPC_BASE_URL}/json/planetary_k_index_1m.json`,
			{ timeout: 10000 }
		);

		if (result.error || !result.data || result.data.length === 0) {
			throw new Error(result.error || 'No Kp data available');
		}

		// Get recent Kp values
		const recentData = result.data.slice(-12); // Last 12 data points
		const kpValues = recentData
			.filter((d) => d.kp !== undefined && d.kp !== null)
			.map((d) => d.kp!);

		if (kpValues.length === 0) {
			throw new Error('No valid Kp values found');
		}

		// Current Kp
		const currentKp = kpValues[kpValues.length - 1];

		// Calculate trend
		const trend = calculateTrend(kpValues);

		// Get visibility info
		const visibility = getVisibilityFromKp(currentKp);

		// Build forecast (use recent values as proxy for short-term forecast)
		const forecast = recentData.slice(-6).map((d) => ({
			time: new Date(d.time_tag).getTime(),
			kp: d.kp || currentKp
		}));

		// Generate alert if high activity
		let alert: string | undefined;
		if (currentKp >= 7) {
			alert = `Strong geomagnetic storm (Kp ${currentKp}) - Aurora visible at mid-latitudes`;
		} else if (currentKp >= 5) {
			alert = `Moderate geomagnetic storm (Kp ${currentKp}) - Aurora possible at high latitudes`;
		}

		const status: AuroraStatus = {
			timestamp: Date.now(),
			kpIndex: currentKp,
			kpTrend: trend,
			visibility,
			forecast,
			alert
		};

		// Cache result
		serverCache.set(cacheKey, status, CACHE_TTL);

		return json({
			status,
			cached: false,
			timestamp: Date.now()
		});
	} catch (error) {
		return json(
			{
				error: `Failed to fetch aurora data: ${(error as Error).message}`
			},
			{ status: 500 }
		);
	}
};
