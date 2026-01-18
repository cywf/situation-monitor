/**
 * Shodan data adapter - client-side
 */

import type { ShodanHost, ShodanSearchResult } from '$lib/types/intel';

export interface ShodanHostResponse {
	host?: ShodanHost;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

export interface ShodanSearchResponse {
	result?: ShodanSearchResult;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

/**
 * Look up a host by IP address
 */
export async function shodanHostLookup(ip: string): Promise<ShodanHostResponse> {
	const url = `/api/shodan/host?ip=${encodeURIComponent(ip)}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch Shodan host data' }));
		return {
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}

/**
 * Search Shodan for devices
 */
export async function shodanSearch(query: string, page = 1): Promise<ShodanSearchResponse> {
	const url = `/api/shodan/search?query=${encodeURIComponent(query)}&page=${page}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to search Shodan' }));
		return {
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
