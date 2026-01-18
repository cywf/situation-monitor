/**
 * Satellites TLE Server Route
 * Fetches Two-Line Element sets from CelesTrak
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout } from '$lib/server';
import type { SatelliteTLE, SatelliteGroup } from '$lib/types/intel';

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (TLE data updates slowly)

// CelesTrak group names
const GROUP_URLS: Record<SatelliteGroup, string> = {
	starlink: 'starlink',
	gps: 'gps-ops',
	glonass: 'glonass-ops',
	galileo: 'galileo',
	iridium: 'iridium-NEXT',
	weather: 'weather',
	military: 'military',
	science: 'science',
	amateur: 'amateur',
	other: 'stations'
};

/**
 * Parse TLE text format into structured data
 */
function parseTLE(text: string): SatelliteTLE[] {
	const lines = text.trim().split('\n');
	const tles: SatelliteTLE[] = [];

	for (let i = 0; i < lines.length; i += 3) {
		if (i + 2 >= lines.length) break;

		const name = lines[i].trim();
		const line1 = lines[i + 1].trim();
		const line2 = lines[i + 2].trim();

		if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
			tles.push({
				name,
				line1,
				line2,
				catalogNumber: line1.substring(2, 7).trim()
			});
		}
	}

	return tles;
}

export const GET: RequestHandler = async ({ url }) => {
	const group = (url.searchParams.get('group') || 'starlink') as SatelliteGroup;
	const limit = parseInt(url.searchParams.get('limit') || '100', 10);

	// Validate group
	if (!GROUP_URLS[group]) {
		return json(
			{
				error: `Invalid satellite group: ${group}`,
				validGroups: Object.keys(GROUP_URLS)
			},
			{ status: 400 }
		);
	}

	// Check cache
	const cacheKey = `satellites:${group}`;
	const cached = serverCache.get<SatelliteTLE[]>(cacheKey);
	if (cached) {
		return json({
			group,
			satellites: cached.slice(0, limit),
			total: cached.length,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Fetch TLE data from CelesTrak
	const celestrakGroup = GROUP_URLS[group];
	const apiUrl = `${CELESTRAK_BASE}?GROUP=${celestrakGroup}&FORMAT=TLE`;

	const result = await fetchWithTimeout<string>(apiUrl, {
		timeout: 15000,
		headers: {
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to fetch satellite TLE data',
				satellites: []
			},
			{ status: result.status }
		);
	}

	// Parse TLE data
	const satellites = parseTLE(result.data);

	// Cache result
	serverCache.set(cacheKey, satellites, CACHE_TTL);

	return json({
		group,
		satellites: satellites.slice(0, limit),
		total: satellites.length,
		cached: false,
		timestamp: Date.now()
	});
};
