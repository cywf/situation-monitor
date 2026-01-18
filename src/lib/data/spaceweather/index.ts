/**
 * Space weather data adapter - client-side
 */

import type { HFConditions } from '$lib/types/intel';

export interface SpaceWeatherResponse {
	conditions?: HFConditions;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

/**
 * Fetch space weather and HF propagation conditions
 */
export async function getSpaceWeather(): Promise<SpaceWeatherResponse> {
	const url = '/api/spaceweather';
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: 'Failed to fetch space weather data' }));
		return {
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
