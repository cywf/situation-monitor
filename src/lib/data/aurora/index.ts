/**
 * Aurora activity data adapter - client-side
 */

import type { AuroraStatus } from '$lib/types/intel';

export interface AuroraResponse {
	status?: AuroraStatus;
	cached?: boolean;
	timestamp: number;
	error?: string;
}

/**
 * Fetch aurora activity status and forecast
 */
export async function getAuroraStatus(): Promise<AuroraResponse> {
	const url = '/api/aurora';
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch aurora data' }));
		return {
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
