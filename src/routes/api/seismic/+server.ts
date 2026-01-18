/**
 * Seismic Activity Server Route
 * Fetches earthquake data from USGS
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout } from '$lib/server';
import type { EarthquakeResponse } from '$lib/types/intel';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Predefined feeds from USGS
const FEED_RANGES = ['hour', 'day', 'week', 'month'] as const;
const FEED_MAGNITUDES = ['significant', 'all', '4.5', '2.5', '1.0'] as const;

type FeedRange = (typeof FEED_RANGES)[number];
type FeedMagnitude = (typeof FEED_MAGNITUDES)[number];

export const GET: RequestHandler = async ({ url }) => {
	const range = (url.searchParams.get('range') || 'day') as FeedRange;
	const magnitude = (url.searchParams.get('magnitude') || 'all') as FeedMagnitude;

	// Validate parameters
	if (!FEED_RANGES.includes(range)) {
		return json(
			{
				error: `Invalid range parameter. Must be one of: ${FEED_RANGES.join(', ')}`
			},
			{ status: 400 }
		);
	}

	if (!FEED_MAGNITUDES.includes(magnitude)) {
		return json(
			{
				error: `Invalid magnitude parameter. Must be one of: ${FEED_MAGNITUDES.join(', ')}`
			},
			{ status: 400 }
		);
	}

	// Check cache
	const cacheKey = `seismic:${range}:${magnitude}`;
	const cached = serverCache.get<EarthquakeResponse>(cacheKey);
	if (cached) {
		return json({
			earthquakes: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Build USGS feed URL
	const feedUrl = `${USGS_BASE_URL}/summary/${magnitude}_${range}.geojson`;

	const result = await fetchWithTimeout<EarthquakeResponse>(feedUrl, {
		timeout: 15000,
		headers: {
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to fetch earthquake data'
			},
			{ status: result.status }
		);
	}

	// Cache result
	serverCache.set(cacheKey, result.data, CACHE_TTL);

	return json({
		earthquakes: result.data,
		cached: false,
		timestamp: Date.now(),
		count: result.data.metadata.count
	});
};
