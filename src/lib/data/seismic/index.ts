/**
 * Seismic activity data adapter - client-side
 */

import type { EarthquakeResponse } from '$lib/types/intel';

export interface SeismicResponse {
	earthquakes?: EarthquakeResponse;
	cached?: boolean;
	timestamp: number;
	count?: number;
	error?: string;
}

/**
 * Fetch earthquake data from USGS
 */
export async function getEarthquakes(
	range: 'hour' | 'day' | 'week' | 'month' = 'day',
	magnitude: 'significant' | 'all' | '4.5' | '2.5' | '1.0' = 'all'
): Promise<SeismicResponse> {
	const url = `/api/seismic?range=${range}&magnitude=${magnitude}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch earthquake data' }));
		return {
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
