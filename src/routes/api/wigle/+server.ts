/**
 * WiGLE WiFi Search Server Route
 * Searches WiGLE database for WiFi networks
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout, buildUrl } from '$lib/server';
import { env as privateEnv } from '$env/dynamic/private';
import type { WigleResult } from '$lib/types/intel';

const WIGLE_BASE_URL = 'https://api.wigle.net/api/v2';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface WigleResponse {
	success: boolean;
	totalResults: number;
	results: WigleResult[];
	message?: string;
}

export const GET: RequestHandler = async ({ url }) => {
	// Check if API credentials are configured
	const WIGLE_API_NAME = privateEnv.WIGLE_API_NAME;
	const WIGLE_API_TOKEN = privateEnv.WIGLE_API_TOKEN;
	if (!WIGLE_API_NAME || !WIGLE_API_TOKEN) {
		return json(
			{
				error:
					'WiGLE API credentials not configured. Set WIGLE_API_NAME and WIGLE_API_TOKEN environment variables.'
			},
			{ status: 503 }
		);
	}

	// Get search parameters
	const ssid = url.searchParams.get('ssid');
	const bssid = url.searchParams.get('bssid');
	const latrange1 = url.searchParams.get('latrange1');
	const latrange2 = url.searchParams.get('latrange2');
	const longrange1 = url.searchParams.get('longrange1');
	const longrange2 = url.searchParams.get('longrange2');

	// At least one search parameter is required
	if (!ssid && !bssid && !latrange1) {
		return json(
			{
				error: 'At least one search parameter required (ssid, bssid, or lat/long ranges)'
			},
			{ status: 400 }
		);
	}

	// Build cache key
	const cacheKey = `wigle:${ssid}:${bssid}:${latrange1}:${latrange2}:${longrange1}:${longrange2}`;

	// Check cache
	const cached = serverCache.get<WigleResult[]>(cacheKey);
	if (cached) {
		return json({
			results: cached,
			total: cached.length,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Build API URL with parameters
	const params: Record<string, string> = {};
	if (ssid) params.ssid = ssid;
	if (bssid) params.netid = bssid;
	if (latrange1) params.latrange1 = latrange1;
	if (latrange2) params.latrange2 = latrange2;
	if (longrange1) params.longrange1 = longrange1;
	if (longrange2) params.longrange2 = longrange2;

	const apiUrl = buildUrl(`${WIGLE_BASE_URL}/network/search`, params);

	// Encode credentials for Basic Auth
	const authToken = Buffer.from(`${WIGLE_API_NAME}:${WIGLE_API_TOKEN}`).toString('base64');

	const result = await fetchWithTimeout<WigleResponse>(apiUrl, {
		timeout: 15000,
		headers: {
			Authorization: `Basic ${authToken}`,
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to search WiGLE'
			},
			{ status: result.status }
		);
	}

	if (!result.data.success) {
		return json(
			{
				error: result.data.message || 'WiGLE API returned error'
			},
			{ status: 500 }
		);
	}

	const results = result.data.results || [];

	// Cache result
	serverCache.set(cacheKey, results, CACHE_TTL);

	return json({
		results,
		total: result.data.totalResults,
		cached: false,
		timestamp: Date.now()
	});
};
