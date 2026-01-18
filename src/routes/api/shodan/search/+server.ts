/**
 * Shodan Search Server Route
 * Searches Shodan for devices matching a query
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout, buildUrl, validateParams } from '$lib/server';
import { env as privateEnv } from '$env/dynamic/private';
import type { ShodanSearchResult } from '$lib/types/intel';

const SHODAN_BASE_URL = 'https://api.shodan.io';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const GET: RequestHandler = async ({ url }) => {
	// Check if API key is configured
	const SHODAN_API_KEY = privateEnv.SHODAN_API_KEY;
	if (!SHODAN_API_KEY) {
		return json(
			{
				error: 'Shodan API key not configured. Set SHODAN_API_KEY environment variable.'
			},
			{ status: 503 }
		);
	}

	// Validate required params
	const validation = validateParams(url.searchParams, ['query']);
	if (!validation.valid) {
		return json(
			{
				error: 'Missing required parameter',
				missing: validation.missing
			},
			{ status: 400 }
		);
	}

	const query = url.searchParams.get('query')!;
	const page = parseInt(url.searchParams.get('page') || '1', 10);

	// Check cache
	const cacheKey = `shodan:search:${query}:${page}`;
	const cached = serverCache.get<ShodanSearchResult>(cacheKey);
	if (cached) {
		return json({
			result: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Fetch from Shodan API
	const apiUrl = buildUrl(`${SHODAN_BASE_URL}/shodan/host/search`, {
		key: SHODAN_API_KEY,
		query,
		page
	});

	const result = await fetchWithTimeout<ShodanSearchResult>(apiUrl, {
		timeout: 20000,
		headers: {
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to search Shodan'
			},
			{ status: result.status }
		);
	}

	// Cache result
	serverCache.set(cacheKey, result.data, CACHE_TTL);

	return json({
		result: result.data,
		cached: false,
		timestamp: Date.now()
	});
};
