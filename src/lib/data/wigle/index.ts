/**
 * WiGLE data adapter - client-side
 */

import type { WigleResult, WigleSearchFilters } from '$lib/types/intel';

export interface WigleResponse {
	results: WigleResult[];
	total: number;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

/**
 * Search WiGLE for WiFi networks
 */
export async function wigleSearch(filters: WigleSearchFilters): Promise<WigleResponse> {
	const params = new URLSearchParams();

	if (filters.ssid) params.append('ssid', filters.ssid);
	if (filters.bssid) params.append('bssid', filters.bssid);
	if (filters.latrange1) params.append('latrange1', filters.latrange1.toString());
	if (filters.latrange2) params.append('latrange2', filters.latrange2.toString());
	if (filters.longrange1) params.append('longrange1', filters.longrange1.toString());
	if (filters.longrange2) params.append('longrange2', filters.longrange2.toString());

	const url = `/api/wigle?${params.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to search WiGLE' }));
		return {
			results: [],
			total: 0,
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
