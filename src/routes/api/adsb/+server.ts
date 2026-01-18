/**
 * ADS-B Data Server Route
 * Proxies OpenSky Network API for aircraft tracking
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverCache, fetchWithTimeout, buildUrl } from '$lib/server';
import type { AircraftState } from '$lib/types/intel';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
const CACHE_TTL = 10 * 1000; // 10 seconds (ADS-B updates frequently)

interface OpenSkyResponse {
	time: number;
	states: Array<Array<string | number | boolean | null>>;
}

/**
 * Convert OpenSky API format to our AircraftState format
 */
function parseAircraftState(state: Array<string | number | boolean | null>): AircraftState {
	return {
		icao24: String(state[0]),
		callsign: state[1] ? String(state[1]).trim() : undefined,
		origin_country: String(state[2]),
		time_position: state[3] ? Number(state[3]) : undefined,
		last_contact: Number(state[4]),
		longitude: state[5] ? Number(state[5]) : undefined,
		latitude: state[6] ? Number(state[6]) : undefined,
		baro_altitude: state[7] ? Number(state[7]) : undefined,
		on_ground: Boolean(state[8]),
		velocity: state[9] ? Number(state[9]) : undefined,
		true_track: state[10] ? Number(state[10]) : undefined,
		vertical_rate: state[11] ? Number(state[11]) : undefined,
		geo_altitude: state[13] ? Number(state[13]) : undefined,
		squawk: state[14] ? String(state[14]) : undefined,
		spi: Boolean(state[15]),
		position_source: state[16] ? Number(state[16]) : undefined
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const lamin = url.searchParams.get('lamin');
	const lomin = url.searchParams.get('lomin');
	const lamax = url.searchParams.get('lamax');
	const lomax = url.searchParams.get('lomax');

	// Build cache key
	const cacheKey = `adsb:${lamin}:${lomin}:${lamax}:${lomax}`;

	// Check cache first
	const cached = serverCache.get<AircraftState[]>(cacheKey);
	if (cached) {
		return json({
			states: cached,
			cached: true,
			timestamp: Date.now()
		});
	}

	// Build OpenSky URL
	const params: Record<string, string | number> = {};
	if (lamin) params.lamin = lamin;
	if (lomin) params.lomin = lomin;
	if (lamax) params.lamax = lamax;
	if (lomax) params.lomax = lomax;

	const apiUrl = buildUrl(`${OPENSKY_BASE_URL}/states/all`, params);

	// Fetch from OpenSky
	const result = await fetchWithTimeout<OpenSkyResponse>(apiUrl, {
		timeout: 15000,
		headers: {
			'User-Agent': 'SituationMonitor/2.0'
		}
	});

	if (result.error || !result.data) {
		return json(
			{
				error: result.error || 'Failed to fetch ADS-B data',
				states: []
			},
			{ status: result.status }
		);
	}

	// Parse and filter states
	const states = (result.data.states || [])
		.filter((s) => s && s[5] !== null && s[6] !== null) // Must have position
		.map(parseAircraftState);

	// Cache result
	serverCache.set(cacheKey, states, CACHE_TTL);

	return json({
		states,
		cached: false,
		timestamp: Date.now(),
		count: states.length
	});
};
