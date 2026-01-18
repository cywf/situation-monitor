/**
 * Shodan Host Lookup Server Route
 * Looks up information about a specific IP address
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout, validateParams } from '$lib/server';
import { env as privateEnv } from '$env/dynamic/private';
import type { ShodanHost } from '$lib/types/intel';

const SHODAN_BASE_URL = 'https://api.shodan.io';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (host data changes slowly)

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
	const validation = validateParams(url.searchParams, ['ip']);
	if (!validation.valid) {
		return json(
			{
				error: 'Missing required parameter',
				missing: validation.missing
			},
			{ status: 400 }
		);
	}

	const ip = url.searchParams.get('ip')!;

	// Validate IP format
	const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
	if (!ipRegex.test(ip)) {
		return json(
			{
				error: 'Invalid IP address format'
			},
			{ status: 400 }
		);
	}

	// Check cache
	const cacheKey = `shodan:host:${ip}`;
	const cached = serverCache.get<ShodanHost>(cacheKey);
	if (cached) {
		return json({
			host: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Fetch from Shodan API
	const apiUrl = `${SHODAN_BASE_URL}/shodan/host/${ip}?key=${SHODAN_API_KEY}`;

	const result = await fetchWithTimeout<ShodanHost>(apiUrl, {
		timeout: 15000,
		headers: {
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to fetch Shodan host data'
			},
			{ status: result.status }
		);
	}

	// Cache result
	serverCache.set(cacheKey, result.data, CACHE_TTL);

	return json({
		host: result.data,
		cached: false,
		timestamp: Date.now()
	});
};
