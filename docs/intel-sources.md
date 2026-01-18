# Intel Sources Documentation

## Overview

The Intel Sources feature set adds 8 optional, feature-flagged panels for advanced intelligence gathering and monitoring capabilities. All features are **OFF by default** and must be explicitly enabled via environment variables.

## Features

### 1. ADS-B Aircraft Tracking

**Panel ID:** `adsb`
**Data Source:** OpenSky Network API (open data)
**Update Frequency:** 10 seconds cache

Displays real-time aircraft positions, callsigns, altitudes, speeds, and origin countries. Useful for monitoring air traffic patterns, private jet movements, and military aircraft activity.

**No API key required** - uses public OpenSky Network API.

### 2. Satellite Tracking

**Panel ID:** `satellites`
**Data Source:** CelesTrak TLE data
**Update Frequency:** 1 hour cache

Shows satellite positions based on Two-Line Element (TLE) data. Supports multiple satellite groups:

- Starlink
- GPS (US)
- GLONASS (Russia)
- Galileo (EU)
- Iridium
- Weather satellites
- Military satellites
- Science satellites
- Amateur radio satellites

**No API key required** - uses public CelesTrak data.

### 3. Spectrum Analyzer

**Panel ID:** `spectrum`
**Data Sources:**

- WebAudio API (microphone)
- WebSocket (optional external sensor)

Real-time FFT spectrum analyzer with two modes:

1. **Microphone Mode**: Uses browser WebAudio API to analyze audio from microphone input (requires user permission)
2. **WebSocket Mode**: Connects to external FFT data source via WebSocket for RF spectrum monitoring

**No API key required** - uses browser APIs or user-provided WebSocket endpoint.

**Privacy Note**: Microphone mode only processes audio locally in the browser. No audio data is transmitted to servers.

### 4. Shodan IoT Device Search

**Panel ID:** `shodan`
**Data Source:** Shodan API
**Update Frequency:** 1 hour cache (search), 24 hours (host lookup)

Search for internet-connected devices (IoT, industrial control systems, webcams, etc.). Provides:

- IP address lookup
- Open ports and services
- Geographic location
- Organization/ISP
- Detected vulnerabilities

**API key required**: `SHODAN_API_KEY`

- Free tier: 100 results/month, 1 query credit
- Get your key at: https://account.shodan.io/

**Rate Limits**: API enforces rate limits. Server-side caching reduces API calls.

### 5. WiGLE WiFi Network Mapping

**Panel ID:** `wigle`
**Data Source:** WiGLE API
**Update Frequency:** 1 hour cache

Search for WiFi networks by SSID, BSSID (MAC address), or geographic bounding box. Shows:

- SSID and BSSID
- Encryption type
- Signal strength
- Geographic location
- Last seen date

**API credentials required**: `WIGLE_API_NAME` and `WIGLE_API_TOKEN`

- Free tier: Unlimited queries with rate limits
- Get your credentials at: https://wigle.net/account

**Privacy Note**: WiGLE data is crowdsourced from wardriving. Location data may not be current.

### 6. Seismic Activity Monitoring

**Panel ID:** `seismic`
**Data Source:** USGS Earthquake API
**Update Frequency:** 5 minutes cache

Displays recent earthquakes with magnitude, location, depth, and time. Filterable by:

- **Time Range**: Hour, Day, Week, Month
- **Magnitude**: Significant, All, 4.5+, 2.5+, 1.0+

Color-coded by alert level (green/yellow/orange/red) for quick threat assessment.

**No API key required** - uses public USGS GeoJSON feeds.

### 7. HF Radio Propagation

**Panel ID:** `rf-propagation`
**Data Source:** NOAA Space Weather Prediction Center (SWPC)
**Update Frequency:** 15 minutes cache

Shows HF radio propagation conditions for day/night with ratings:

- Excellent
- Good
- Fair
- Poor
- Very Poor

Includes key space weather indices:

- Solar Flux Index (SFI)
- A-Index (geomagnetic activity)
- K-Index (geomagnetic storm indicator)
- Sunspot number

**No API key required** - uses public NOAA/SWPC data.

### 8. Aurora Activity

**Panel ID:** `aurora`
**Data Source:** NOAA SWPC Kp Index
**Update Frequency:** 15 minutes cache

Forecasts aurora visibility based on planetary K-index (Kp). Shows:

- Current Kp index (0-9 scale)
- Trend (rising/stable/falling)
- Visibility latitude threshold
- Probability rating
- 3-hour forecast
- Storm alerts

**No API key required** - uses public NOAA/SWPC data.

## Installation & Configuration

### Step 1: Enable Feature Flags

Edit your `.env` file (or set environment variables):

```bash
# Master flag - must be true to enable any Intel Sources
PUBLIC_FEATURE_INTEL_SOURCES=true

# Enable individual panels (set to true as needed)
PUBLIC_FEATURE_ADSB=true
PUBLIC_FEATURE_SATELLITES=true
PUBLIC_FEATURE_SPECTRUM=true
PUBLIC_FEATURE_SHODAN=true
PUBLIC_FEATURE_WIGLE=true
PUBLIC_FEATURE_SEISMIC=true
PUBLIC_FEATURE_RF_PROP=true
PUBLIC_FEATURE_AURORA=true
```

### Step 2: Add API Keys (if needed)

For Shodan and WiGLE panels, add your API credentials:

```bash
# Shodan API Key
SHODAN_API_KEY=your_shodan_api_key_here

# WiGLE API Credentials
WIGLE_API_NAME=your_wigle_username
WIGLE_API_TOKEN=your_wigle_api_token
```

### Step 3: Rebuild Application

```bash
npm run build
```

### Step 4: Configure Panel Visibility

In the Settings modal, enable/disable specific Intel Sources panels based on your needs.

## Security & Privacy

### API Keys

- **Never commit API keys to source control**
- API keys are stored as server-side environment variables
- Keys are accessed only in SvelteKit server routes (`+server.ts`)
- Keys are **never exposed** to the client-side bundle

### Data Privacy

- **Microphone**: Audio processed locally in browser, never transmitted
- **Geolocation**: No automatic geolocation - user must provide coordinates
- **Caching**: Server-side cache reduces external API calls
- **Rate Limiting**: Built-in caching prevents abuse of free-tier APIs

### CORS & Proxying

All external API calls are proxied through SvelteKit server routes to:

1. Protect API keys from client exposure
2. Implement server-side caching
3. Handle CORS restrictions
4. Add rate limiting and error handling

## Rate Limits & Quotas

### Shodan

- **Free tier**: 100 results/month, 1 query credit
- **Cached**: Host lookups cached 24 hours, searches 1 hour
- **Recommendation**: Use sparingly, cache is your friend

### WiGLE

- **Free tier**: Unlimited with rate limits (~10 queries/minute)
- **Cached**: Results cached 1 hour
- **Recommendation**: Search by area (bbox) rather than individual SSIDs

### OpenSky Network

- **Free tier**: Anonymous access with reduced update rate
- **Cached**: States cached 10 seconds
- **Recommendation**: Limit geographic bounds for better performance

### USGS/NOAA

- **No rate limits**: Public government data
- **Cached**: 5-15 minutes depending on data source
- **Recommendation**: No restrictions

## Troubleshooting

### Panel Not Appearing

1. Check `PUBLIC_FEATURE_INTEL_SOURCES=true` in `.env`
2. Check individual panel flag (e.g., `PUBLIC_FEATURE_ADSB=true`)
3. Rebuild application: `npm run build`
4. Check browser console for errors

### API Key Errors

1. Verify API key is set in `.env` (not `.env.example`)
2. Check key format (no quotes, no spaces)
3. Verify key is valid at provider's dashboard
4. Check server logs for authentication errors

### Microphone Access Denied

1. Browser requires HTTPS for microphone access (except localhost)
2. Click "Allow" when browser prompts for microphone permission
3. Check browser settings → Site permissions → Microphone

### WebSocket Connection Fails

1. Verify WebSocket URL format: `ws://` or `wss://`
2. Check server is running and accessible
3. Ensure WebSocket sends JSON with `SpectrumFrame` format
4. Check browser console for connection errors

### No Data Returned

1. Check network tab for failed API requests
2. Verify external service is online (e.g., OpenSky, CelesTrak)
3. Check server logs for proxy errors
4. Try clearing cache and refreshing

## Development

### Adding New Data Sources

1. Create server route in `src/routes/api/[source]/+server.ts`
2. Use server-side cache and HTTP helpers from `$lib/server`
3. Create data adapter in `src/lib/data/[source]/index.ts`
4. Create panel component in `src/lib/components/panels/[Source]Panel.svelte`
5. Add panel ID to `src/lib/config/panels.ts`
6. Export panel in `src/lib/components/panels/index.ts`
7. Add feature flag to `src/lib/config/features.ts`
8. Integrate panel in `src/routes/+page.svelte` with flag check
9. Update this documentation

### Testing

```bash
# Type checking
npm run check

# Linting
npm run lint

# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Build test
npm run build
```

## Future Enhancements

Potential additions (not yet implemented):

- Map overlays for ADS-B, satellites, WiGLE, and seismic data
- Historical data charting
- Alert/notification system for threshold events
- Export functionality (CSV/JSON)
- Dark web monitoring (Tor hidden services)
- Maritime vessel tracking (AIS data)
- OSINT social media monitoring
- Blockchain/crypto address tracking

## Credits

- **OpenSky Network**: Open aircraft tracking data
- **CelesTrak**: Satellite TLE data by Dr. T.S. Kelso
- **Shodan**: John Matherly's IoT search engine
- **WiGLE**: WiFi wardriving database
- **USGS**: U.S. Geological Survey earthquake data
- **NOAA/SWPC**: Space weather and propagation data
