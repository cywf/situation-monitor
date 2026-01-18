/**
 * Space Weather Server Route
 * Fetches solar and geomagnetic activity data from NOAA/SWPC
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout } from '$lib/server';
import type { HFConditions } from '$lib/types/intel';

const SWPC_BASE_URL = 'https://services.swpc.noaa.gov';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface SolarFluxData {
	time_tag: string;
	flux: number;
}

interface GeomagneticData {
	time_tag: string;
	a_index?: number;
	estimated_kp?: number;
}

/**
 * Determine HF condition rating from indices
 */
function getConditionRating(sfi: number, aIndex: number): HFConditions['day'] {
	// Solar Flux Index: higher is better (70-300 typical)
	// A-index: lower is better (0-400, <20 is quiet)

	if (sfi > 150 && aIndex < 15) return 'excellent';
	if (sfi > 120 && aIndex < 30) return 'good';
	if (sfi > 90 && aIndex < 50) return 'fair';
	if (sfi > 70 && aIndex < 100) return 'poor';
	return 'very-poor';
}

export const GET: RequestHandler = async () => {
	// Check cache
	const cacheKey = 'spaceweather:conditions';
	const cached = serverCache.get<HFConditions>(cacheKey);
	if (cached) {
		return json({
			conditions: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	try {
		// Fetch multiple data sources in parallel
		const [solarFluxResult, geomagResult, sunspotResult] = await Promise.all([
			fetchWithTimeout<SolarFluxData[]>(
				`${SWPC_BASE_URL}/json/f107_cm_flux.json`,
				{ timeout: 10000 }
			),
			fetchWithTimeout<GeomagneticData[]>(
				`${SWPC_BASE_URL}/json/planetary_k_index_1m.json`,
				{ timeout: 10000 }
			),
			fetchWithTimeout<Array<[string, number]>>(
				`${SWPC_BASE_URL}/json/solar-cycle/observed-solar-cycle-indices.json`,
				{ timeout: 10000 }
			)
		]);

		// Parse solar flux (most recent)
		const solarFlux =
			solarFluxResult.data && solarFluxResult.data.length > 0
				? solarFluxResult.data[solarFluxResult.data.length - 1].flux
				: 100;

		// Parse geomagnetic data (most recent)
		const latestGeo =
			geomagResult.data && geomagResult.data.length > 0
				? geomagResult.data[geomagResult.data.length - 1]
				: null;
		const aIndex = latestGeo?.a_index || 15;
		const kIndex = latestGeo?.estimated_kp || 2;

		// Parse sunspot number (most recent)
		const sunspots =
			sunspotResult.data && sunspotResult.data.length > 0
				? sunspotResult.data[sunspotResult.data.length - 1][1]
				: 50;

		// Calculate conditions
		const dayCondition = getConditionRating(solarFlux, aIndex);
		const nightCondition = getConditionRating(solarFlux * 0.8, aIndex * 1.2); // Night is typically worse

		// Generate summary
		const summaryParts = [];
		if (solarFlux > 150) summaryParts.push('High solar activity');
		else if (solarFlux < 80) summaryParts.push('Low solar activity');
		if (aIndex > 50) summaryParts.push('geomagnetic storm');
		else if (aIndex < 10) summaryParts.push('quiet conditions');
		const summary = summaryParts.join(', ') || 'Normal propagation';

		const conditions: HFConditions = {
			timestamp: Date.now(),
			day: dayCondition,
			night: nightCondition,
			solarFlux,
			aIndex,
			kIndex,
			sunspots,
			summary
		};

		// Cache result
		serverCache.set(cacheKey, conditions, CACHE_TTL);

		return json({
			conditions,
			cached: false,
			timestamp: Date.now()
		});
	} catch (error) {
		return json(
			{
				error: `Failed to fetch space weather data: ${(error as Error).message}`
			},
			{ status: 500 }
		);
	}
};
