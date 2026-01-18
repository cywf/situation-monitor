/**
 * Satellite data adapter - client-side
 */

import type { SatelliteTLE, SatelliteGroup } from '$lib/types/intel';

export interface SatelliteResponse {
	group: SatelliteGroup;
	satellites: SatelliteTLE[];
	total: number;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

/**
 * Fetch satellite TLE data
 */
export async function getSatellites(
	group: SatelliteGroup = 'starlink',
	limit = 100
): Promise<SatelliteResponse> {
	const url = `/api/satellites?group=${group}&limit=${limit}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch satellite data' }));
		return {
			group,
			satellites: [],
			total: 0,
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
