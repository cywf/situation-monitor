/**
 * ADS-B data adapter - client-side
 */

import type { AircraftState } from '$lib/types/intel';

export interface AdsbParams {
	lamin?: number;
	lomin?: number;
	lamax?: number;
	lomax?: number;
}

export interface AdsbResponse {
	states: AircraftState[];
	cached?: boolean;
	timestamp: number;
	count?: number;
	error?: string;
}

/**
 * Fetch aircraft states from ADS-B API
 */
export async function getAdsbStates(params: AdsbParams = {}): Promise<AdsbResponse> {
	const queryParams = new URLSearchParams();
	if (params.lamin) queryParams.append('lamin', params.lamin.toString());
	if (params.lomin) queryParams.append('lomin', params.lomin.toString());
	if (params.lamax) queryParams.append('lamax', params.lamax.toString());
	if (params.lomax) queryParams.append('lomax', params.lomax.toString());

	const url = `/api/adsb?${queryParams.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch ADS-B data' }));
		return {
			states: [],
			timestamp: Date.now(),
			error: error.error || `HTTP ${response.status}`
		};
	}

	return await response.json();
}
