# API Documentation

This document describes the public API of SA-DASH modules for developers.

## Module: constants.js

### Exports

#### `PANELS`
Panel configuration object with display names and priorities.

```javascript
{
    map: { name: 'Global Map', priority: 1 },
    politics: { name: 'World / Geopolitical', priority: 1 },
    // ... more panels
}
```

#### `FEEDS`
RSS feed URLs organized by category.

```javascript
{
    politics: [{ name: 'Source Name', url: 'https://...' }, ...],
    tech: [...],
    // ... more categories
}
```

#### `ALERT_KEYWORDS`
Array of keywords that trigger alert highlighting.

```javascript
['war', 'invasion', 'nuclear', ...]
```

---

## Module: utils.js

### Functions

#### `getTimeAgo(date: Date): string`
Convert a Date object to relative time string.

**Parameters:**
- `date` - JavaScript Date object

**Returns:** String like "2 hours ago", "just now", etc.

**Example:**
```javascript
const timeStr = getTimeAgo(new Date(Date.now() - 3600000));
// Returns: "1 hour ago"
```

#### `timeAgo(dateStr: string): string`
Parse ISO date string and convert to relative time.

**Parameters:**
- `dateStr` - ISO 8601 date string

**Returns:** Relative time string

#### `escapeHtml(text: string): string`
Sanitize HTML to prevent XSS attacks.

**Parameters:**
- `text` - Unsanitized string

**Returns:** HTML-safe string

**Example:**
```javascript
const safe = escapeHtml('<script>alert("xss")</script>');
// Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

#### `setStatus(msg: string, loading: boolean = false): void`
Update application status indicator.

**Parameters:**
- `msg` - Status message to display
- `loading` - Whether to show loading state

---

## Module: data.js

### Functions

#### `fetchWithProxy(url: string): Promise<string>`
Fetch URL with CORS proxy fallback.

**Parameters:**
- `url` - URL to fetch

**Returns:** Promise resolving to response text

**Throws:** Error if all proxies fail

#### `fetchFeed(source: Object): Promise<Array>`
Fetch and parse RSS feed.

**Parameters:**
- `source` - Object with `{ name: string, url: string }`

**Returns:** Promise resolving to array of news items

**Example:**
```javascript
const items = await fetchFeed({
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/worldNews'
});
// Returns: [{ source, title, link, pubDate, isAlert }, ...]
```

#### `fetchCategory(feeds: Array): Promise<Array>`
Fetch all feeds in a category and aggregate results.

**Parameters:**
- `feeds` - Array of feed source objects

**Returns:** Promise resolving to sorted, deduplicated items

#### `fetchMarkets(): Promise<Array>`
Get current market data for indices and stocks.

**Returns:** Promise resolving to market data array

**Example:**
```javascript
const markets = await fetchMarkets();
// Returns: [{ symbol, name, price, change, changePercent }, ...]
```

#### `hasAlertKeyword(title: string): boolean`
Check if title contains alert keywords.

**Parameters:**
- `title` - News headline text

**Returns:** Boolean indicating if contains alert keyword

---

## Module: map.js

### Functions

#### `renderGlobalMap(activity, quakes, news, layers, getMonitors, fetchFlights, classifyAircraft, getArrow): Promise<void>`
Main map rendering function.

**Parameters:**
- `activity` - Activity hotspot data
- `quakes` - Earthquake data array
- `news` - All news items
- `layers` - Layer visibility state
- `getMonitors` - Function to get custom monitors
- `fetchFlights` - Function to fetch flight data
- `classifyAircraft` - Function to classify aircraft
- `getArrow` - Function to get arrow for heading

**Returns:** Promise that resolves when map is rendered

#### `analyzeHotspotActivity(news: Array): Array`
Analyze news for geographic activity hotspots.

**Parameters:**
- `news` - Array of news items

**Returns:** Array of hotspot objects with locations and intensity

#### `mapZoomIn(): void`
Zoom in on the map.

#### `mapZoomOut(): void`
Zoom out on the map.

#### `mapZoomReset(): void`
Reset map zoom to default level.

#### `setMapView(mode: string, callback: Function): void`
Switch between map views.

**Parameters:**
- `mode` - 'global' or 'us'
- `callback` - Function to call after view change

---

## Module: panels.js

### Functions

#### `isPanelEnabled(id: string): boolean`
Check if a panel is currently visible.

**Parameters:**
- `id` - Panel identifier

**Returns:** Boolean indicating visibility

**Example:**
```javascript
if (isPanelEnabled('map')) {
    renderMap();
}
```

#### `togglePanel(id: string, callback: Function): void`
Toggle panel visibility.

**Parameters:**
- `id` - Panel identifier
- `callback` - Function to call after toggle

#### `getPanelSettings(): Object`
Get current panel configuration.

**Returns:** Object with panel states and order

#### `savePanelSettings(settings: Object): void`
Save panel settings to localStorage.

**Parameters:**
- `settings` - Settings object to save

#### `initPanels(callback: Function): void`
Initialize panel system and load saved settings.

**Parameters:**
- `callback` - Function to call after initialization

---

## Module: renderers.js

### Functions

#### `renderNews(items: Array, panelId: string, countId: string): void`
Render news items into a panel.

**Parameters:**
- `items` - Array of news items
- `panelId` - DOM element ID for the panel
- `countId` - DOM element ID for the count badge

**Example:**
```javascript
renderNews(newsItems, 'politicsPanel', 'politicsCount');
```

#### `renderMarkets(data: Array): void`
Render market data.

**Parameters:**
- `data` - Array of market data objects

#### `renderHeatmap(sectors: Array): void`
Render sector performance heatmap.

**Parameters:**
- `sectors` - Array of sector performance data

#### `renderPolymarket(markets: Array): void`
Render Polymarket prediction markets.

**Parameters:**
- `markets` - Array of prediction market data

---

## Module: intelligence.js

### Functions

#### `analyzeCorrelations(news: Array): Object`
Analyze news for correlations and patterns.

**Parameters:**
- `news` - Array of all news items

**Returns:** Object with correlation insights

**Example:**
```javascript
const correlations = analyzeCorrelations(allNews);
// Returns: {
//     emergingPatterns: [...],
//     momentum: [...],
//     crossSource: [...]
// }
```

#### `calculateMainCharacter(news: Array): Array`
Determine trending entities from news.

**Parameters:**
- `news` - Array of news items

**Returns:** Array of ranked entities with scores

#### `detectRegions(text: string): Array`
Extract geographic regions from text.

**Parameters:**
- `text` - Text to analyze

**Returns:** Array of region names

#### `detectTopics(text: string): Array`
Extract topics from text.

**Parameters:**
- `text` - Text to analyze

**Returns:** Array of topic keywords

---

## Module: monitors.js

### Functions

#### `loadMonitors(): Array`
Load custom monitors from localStorage.

**Returns:** Array of monitor objects

#### `saveMonitors(monitors: Array): void`
Save monitors to localStorage.

**Parameters:**
- `monitors` - Array of monitor objects

#### `scanMonitorsForMatches(news: Array): Array`
Find news items matching monitor keywords.

**Parameters:**
- `news` - Array of all news items

**Returns:** Array of monitors with populated matches

**Example:**
```javascript
const monitorsWithMatches = scanMonitorsForMatches(allNews);
// Each monitor has .matches property populated
```

#### `getMonitorHotspots(): Array`
Get monitors that have geographic locations for map display.

**Returns:** Array of monitors with lat/lon coordinates

#### `renderMonitorsPanel(news: Array): void`
Render the custom monitors panel with matches.

**Parameters:**
- `news` - Array of all news items

---

## Module: popups.js

### Functions

#### `showHotspotPopup(data: Object, x: number, y: number): void`
Display popup for map hotspot.

**Parameters:**
- `data` - Hotspot data object
- `x` - Screen X coordinate
- `y` - Screen Y coordinate

#### `hideAllPopups(): void`
Close all open popups.

#### General Pattern for Popup Functions

All popup functions follow this pattern:

```javascript
showXxxPopup(data, x, y): void
```

Where:
- `data` - Data specific to popup type
- `x`, `y` - Screen coordinates for positioning

Available popup functions:
- `showConflictPopup()`
- `showUSCityPopup()`
- `showUSHotspotPopup()`
- `showChokepointPopup()`
- `showQuakePopup()`
- `showCyberPopup()`
- `showCustomHotspotPopup()`
- `showAircraftPopup()`

---

## Module: layers.js

### State

#### `mapLayers`
Object tracking map layer visibility.

```javascript
{
    conflicts: boolean,
    bases: boolean,
    nuclear: boolean,
    cables: boolean,
    flights: boolean,
    density: boolean,
    satellite: boolean
}
```

### Functions

#### `toggleLayer(layer: string, callback: Function): void`
Toggle map layer visibility.

**Parameters:**
- `layer` - Layer name (e.g., 'conflicts', 'bases')
- `callback` - Function to call after toggle

#### `fetchFlightData(): Promise<Array>`
Fetch live flight tracking data.

**Returns:** Promise resolving to array of flight objects

#### `classifyAircraft(callsign: string, country: string): string`
Classify aircraft type based on callsign and country.

**Parameters:**
- `callsign` - Aircraft callsign
- `country` - Country of registration

**Returns:** Classification string ('military', 'cargo', 'helicopter', 'civilian')

#### `getAircraftArrow(heading: number): string`
Convert heading angle to arrow symbol.

**Parameters:**
- `heading` - Heading in degrees (0-360)

**Returns:** Arrow character (→, ↗, ↑, etc.)

---

## Data Structures

### News Item
```javascript
{
    source: string,      // Source name
    title: string,       // Headline
    link: string,        // Article URL
    pubDate: string,     // Publication date (ISO 8601)
    isAlert: boolean     // Whether contains alert keywords
}
```

### Market Data
```javascript
{
    symbol: string,         // Ticker symbol
    name: string,          // Display name
    price: number,         // Current price
    change: number,        // Price change
    changePercent: number  // Percent change
}
```

### Monitor Object
```javascript
{
    id: string,           // Unique identifier
    name: string,         // Monitor name
    keywords: string[],   // Keywords to match
    color: string,        // Hex color code
    lat: number|null,     // Latitude (optional)
    lon: number|null,     // Longitude (optional)
    matches: Object[]     // Populated at runtime
}
```

---

## Events

### Window Functions
These functions are exposed on window for HTML onclick handlers:

- `window.refreshAll()` - Refresh all data
- `window.togglePanel(id)` - Toggle panel visibility
- `window.toggleSettings()` - Open/close settings modal
- `window.setMapView(mode)` - Change map view
- `window.mapZoomIn()` - Zoom in
- `window.mapZoomOut()` - Zoom out
- `window.mapZoomReset()` - Reset zoom
- `window.toggleLayer(layer)` - Toggle map layer
- `window.openMonitorForm()` - Open monitor form
- `window.saveMonitor()` - Save monitor
- `window.deleteMonitor(id)` - Delete monitor

---

## Error Handling

All data fetching functions handle errors gracefully:

1. **Return empty arrays/objects** on failure
2. **Log errors** to console for debugging
3. **Don't throw** - allow app to continue with partial data
4. **Use fallbacks** when available (e.g., CORS proxy fallback chain)

**Example:**
```javascript
try {
    const data = await fetchSomeData();
    return data;
} catch (error) {
    console.error('Failed to fetch:', error);
    return []; // Return empty array instead of throwing
}
```

---

## Best Practices

### When Calling API Functions

1. **Always handle empty results:**
   ```javascript
   const data = await fetchMarkets();
   if (!data || data.length === 0) {
       showNoDataMessage();
       return;
   }
   ```

2. **Use try-catch for critical operations:**
   ```javascript
   try {
       await renderGlobalMap(/* ... */);
   } catch (error) {
       console.error('Map render failed:', error);
       showMapError();
   }
   ```

3. **Sanitize user input:**
   ```javascript
   const safeTitle = escapeHtml(userInput);
   ```

4. **Check panel visibility before rendering:**
   ```javascript
   if (isPanelEnabled('markets')) {
       renderMarkets(data);
   }
   ```

---

**Version:** 1.0.0  
**Last Updated:** January 2026
