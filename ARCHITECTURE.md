# Architecture Documentation

This document provides a detailed overview of the SA-DASH architecture, design patterns, and technical decisions.

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    SA-DASH App                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │  HTML UI   │  │   CSS      │  │   JS Modules │  │  │
│  │  │  (Views)   │◄─┤  (Styles)  │◄─┤   (Logic)    │  │  │
│  │  └────────────┘  └────────────┘  └──────┬───────┘  │  │
│  │                                           │          │  │
│  │  ┌────────────────────────────────────────▼──────┐  │  │
│  │  │         LocalStorage (Persistence)          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌──────────────────────────────────────┐
        │        External Data Sources          │
        │  ┌──────────┐  ┌──────────────────┐ │
        │  │ RSS Feeds│  │ Public APIs       │ │
        │  └──────────┘  └──────────────────┘ │
        │  ┌──────────┐  ┌──────────────────┐ │
        │  │ USGS API │  │ Market Data APIs  │ │
        │  └──────────┘  └──────────────────┘ │
        └──────────────────────────────────────┘
                            ▲
                            │
                  (CORS Proxy if needed)
```

## 📦 Module Structure

### Core Modules

#### 1. main.js (Orchestration Layer)
**Responsibility:** Application entry point and orchestration

- Imports all other modules
- Exposes functions to window for HTML onclick handlers
- Manages application lifecycle (init, refresh)
- Coordinates data loading in stages for perceived performance
- Handles auto-refresh timing

**Key Functions:**
- `refreshAll()` - Staged data refresh (critical → secondary → extras)
- Event listener setup for DOMContentLoaded

#### 2. constants.js (Configuration Layer)
**Responsibility:** Static configuration and data structures

**Exports:**
- `PANELS` - Panel definitions with names and priorities
- `FEEDS` - RSS feed URLs for news sources
- `ALERT_KEYWORDS` - Keywords for highlighting critical news
- `INTEL_HOTSPOTS` - Geographic hotspot definitions
- `US_CITIES` - Major US city coordinates
- `SECTORS` - Market sector definitions
- `CORRELATION_TOPICS` - Topics for correlation analysis
- `NARRATIVE_PATTERNS` - Patterns for narrative tracking
- `CONFLICT_ZONES` - Active conflict zone boundaries
- `MILITARY_BASES` - Global military installation locations
- `NUCLEAR_FACILITIES` - Nuclear facility locations
- `CHOKE_POINTS` - Strategic maritime chokepoints

#### 3. utils.js (Utility Layer)
**Responsibility:** Pure utility functions

**Functions:**
- `getTimeAgo(date)` - Convert date to relative time
- `timeAgo(dateStr)` - Parse and convert date string
- `escapeHtml(text)` - Sanitize HTML to prevent XSS
- `setStatus(msg, loading)` - Update application status indicator
- `generateId()` - Generate unique IDs
- `formatNumber(num)` - Format numbers with commas
- `formatCurrency(amount)` - Format currency values
- `parseCoordinates(lat, lon)` - Validate coordinate inputs

#### 4. data.js (Data Access Layer)
**Responsibility:** Fetch and transform external data

**Architecture Pattern:** Provider pattern with fallback logic

**Key Functions:**
- `fetchWithProxy(url)` - Fetch with CORS proxy fallback
- `fetchFeed(url)` - Fetch and parse RSS feeds
- `fetchCategory(feeds)` - Aggregate multiple feeds
- `fetchMarkets()` - Get market index data
- `fetchSectors()` - Get sector performance data
- `fetchCommodities()` - Get commodity prices
- `fetchEarthquakes()` - Get recent earthquake data (USGS)
- `fetchPolymarket()` - Get prediction market data
- `fetchCongressTrades()` - Get congressional trading data
- `fetchWhaleTransactions()` - Get large crypto transactions
- `fetchGovContracts()` - Get government contract awards
- `fetchAINews()` - Get AI development news
- `fetchLayoffs()` - Get tech layoff announcements
- `fetchFedBalance()` - Get Federal Reserve balance sheet
- `fetchIntelFeed()` - Get curated intelligence feed
- `fetchSituationNews(query)` - Get situation-specific news

**Error Handling:**
- Try-catch blocks on all fetch operations
- Fallback to empty arrays/objects on failure
- Console logging for debugging
- Graceful degradation (app works with partial data)

#### 5. map.js (Visualization Core)
**Responsibility:** Global map rendering and interaction

**Architecture Pattern:** Observer pattern for map state

**State Management:**
```javascript
let mapState = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    view: 'global', // or 'us'
    flashbackHours: 0,
    layers: { /* layer visibility */ }
};
```

**Key Functions:**
- `renderGlobalMap(activity, quakes, news, layers, monitors, flights)` - Main render
- `loadWorldMap()` - Load TopoJSON world data
- `analyzeHotspotActivity(news)` - Analyze news for geographic hotspots
- `calculateNewsDensity(news)` - Calculate heat map density
- `projectCoordinates(lon, lat)` - Project geo coordinates to screen
- `mapZoomIn/Out/Reset()` - Zoom controls
- `setMapView(mode)` - Switch between global/US view
- `initMapPan()` - Initialize pan/drag functionality
- `updateFlashback(hours)` - Historical data playback

**D3.js Integration:**
- Uses `d3.geoMercator()` projection
- `d3.geoPath()` for rendering shapes
- SVG manipulation for overlays

#### 6. layers.js (Layer Management)
**Responsibility:** Manage optional map layers

**Layer Types:**
- Conflict zones
- Military bases
- Nuclear facilities
- Undersea cables
- Flight tracking
- News density heatmap
- Satellite imagery

**Key Functions:**
- `toggleLayer(layer, callback)` - Toggle layer visibility
- `fetchFlightData()` - Get live flight tracking data
- `classifyAircraft(callsign, country)` - Classify aircraft type
- `getAircraftArrow(heading)` - Convert heading to arrow symbol

**State:**
```javascript
export const mapLayers = {
    conflicts: false,
    bases: false,
    nuclear: false,
    cables: false,
    flights: false,
    density: false,
    satellite: false
};
```

#### 7. panels.js (UI State Management)
**Responsibility:** Panel visibility and layout management

**Features:**
- Panel toggle (show/hide)
- Drag-and-drop reordering
- Settings persistence in localStorage
- Livestream URL configuration

**Key Functions:**
- `isPanelEnabled(id)` - Check if panel is visible
- `togglePanel(id, callback)` - Toggle panel visibility
- `getPanelSettings()` - Get current panel state
- `savePanelSettings(settings)` - Save to localStorage
- `applyPanelSettings()` - Apply saved settings
- `initPanels(callback)` - Initialize panel system
- `initDragAndDrop()` - Setup drag-and-drop
- `resetPanelOrder()` - Reset to default layout
- `extractYouTubeId(url)` - Parse YouTube URLs

**Storage Schema:**
```javascript
{
    panels: {
        map: true,
        politics: true,
        // ... other panels
    },
    panelOrder: ['map', 'politics', 'tech', ...],
    livestreamUrl: 'https://youtube.com/...'
}
```

#### 8. renderers.js (Presentation Layer)
**Responsibility:** Transform data into HTML/DOM elements

**Pattern:** Template pattern - each renderer follows consistent structure

**Key Functions:**
- `renderNews(items, panelId, countId)` - Render news items
- `renderMarkets(data)` - Render market indices
- `renderHeatmap(sectors)` - Render sector heatmap
- `renderCommodities(data)` - Render commodity prices
- `renderPolymarket(markets)` - Render prediction markets
- `renderCongressTrades(trades)` - Render congressional trades
- `renderWhaleWatch(transactions)` - Render whale transactions
- `renderMainCharacter(rankings)` - Render main character panel
- `renderGovContracts(contracts)` - Render gov contracts
- `renderAINews(news)` - Render AI news
- `renderMoneyPrinter(data)` - Render Fed balance visualization
- `renderIntelFeed(items)` - Render intelligence feed
- `renderLayoffs(items)` - Render layoff tracker
- `renderSituation(panelId, statusId, news, config)` - Render situation panels

**Common Pattern:**
```javascript
export function renderSomething(data) {
    const panel = document.getElementById('panelId');
    if (!panel) return;
    
    if (!data || data.length === 0) {
        panel.innerHTML = '<div class="error-msg">No data</div>';
        return;
    }
    
    const html = data.map(item => `
        <div class="item">
            ${escapeHtml(item.title)}
        </div>
    `).join('');
    
    panel.innerHTML = html;
}
```

#### 9. intelligence.js (Analytics Layer)
**Responsibility:** Analyze data for insights and patterns

**Algorithms:**

**Correlation Analysis:**
- Topic extraction from headlines
- Region detection
- Cross-source matching
- Momentum calculation (trending topics)
- Pattern emergence detection

**Narrative Tracking:**
- Fringe source monitoring
- Mainstream source comparison
- Crossover detection (fringe → mainstream)
- Disinformation signal analysis

**Main Character:**
- Entity extraction (people, organizations, places)
- Frequency counting
- Relevance scoring

**Key Functions:**
- `analyzeCorrelations(news)` - Find correlated topics
- `renderCorrelationEngine(data)` - Display correlations
- `analyzeNarratives(news)` - Track narrative flows
- `renderNarrativeTracker(data)` - Display narrative tracker
- `calculateMainCharacter(news)` - Determine trending entities
- `detectRegions(text)` - Extract geographic regions
- `detectTopics(text)` - Extract topics from text

#### 10. monitors.js (Custom Monitoring)
**Responsibility:** User-defined keyword monitoring system

**Features:**
- Create custom monitors with keywords
- Optional geographic location
- Color-coding for visualization
- Match detection across all news sources
- Map hotspot creation for located monitors

**Data Structure:**
```javascript
{
    id: 'unique-id',
    name: 'Monitor Name',
    keywords: ['keyword1', 'keyword2'],
    color: '#ff5500',
    lat: 35.6762,
    lon: 139.6503,
    matches: [] // populated at runtime
}
```

**Key Functions:**
- `loadMonitors()` - Load from localStorage
- `saveMonitors(monitors)` - Save to localStorage
- `renderMonitorsList()` - Render in settings modal
- `openMonitorForm(id)` - Open add/edit form
- `saveMonitor(callback)` - Save monitor to storage
- `deleteMonitor(id, callback)` - Remove monitor
- `scanMonitorsForMatches(news)` - Find keyword matches
- `getMonitorHotspots()` - Get monitors with locations for map
- `renderMonitorsPanel(news)` - Display matches

#### 11. popups.js (Interaction Layer)
**Responsibility:** Display detailed information on user interaction

**Popup Types:**
- Hotspot popups (news density)
- Conflict zone popups (active conflicts)
- US city popups (city-specific news)
- US hotspot popups (breaking news locations)
- Chokepoint popups (strategic maritime points)
- Earthquake popups (quake details)
- Cyber incident popups
- Custom monitor popups
- Aircraft popups (flight details)

**Pattern:**
```javascript
export function showSomePopup(data, x, y) {
    hideAllPopups(); // Close other popups first
    
    const popup = document.getElementById('popupId');
    popup.innerHTML = generateHTML(data);
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.classList.add('visible');
}
```

**Key Functions:**
- `showHotspotPopup(data, x, y)` - Show hotspot details
- `showConflictPopup(data, x, y)` - Show conflict details
- `hideAllPopups()` - Close all open popups
- Various specialized popup functions

## 🔄 Data Flow

### Application Startup

```
1. DOMContentLoaded event fires
2. main.js executes initialization
3. initPanels() loads panel settings
4. refreshAll() starts first data load
5. Staged loading begins:
   - Stage 1: Critical (news, markets) → renders immediately
   - Stage 2: Secondary (gov, commodities, etc.)
   - Stage 3: Extras (congress, whales, etc.)
6. Map renders with available data
7. Auto-refresh timer starts (5 minutes)
```

### User Interaction Flow

```
User clicks "Refresh"
    ↓
main.js: refreshAll()
    ↓
data.js: fetchCategory() for each panel
    ↓
RSS feeds fetched via CORS proxy
    ↓
Data transformed to common format
    ↓
intelligence.js: analyze patterns
    ↓
renderers.js: update UI panels
    ↓
map.js: update map visualization
    ↓
Status updated to "Updated [time]"
```

### Map Interaction Flow

```
User clicks map hotspot
    ↓
Click event captured with coordinates
    ↓
popups.js: showHotspotPopup()
    ↓
Generate HTML for popup
    ↓
Position popup near click location
    ↓
Display with animation
    ↓
Click outside → hideAllPopups()
```

## 💾 State Management

### localStorage Schema

```javascript
{
    // Panel settings
    "sa-dash-panels": {
        "panels": { "map": true, "politics": true, ... },
        "panelOrder": ["map", "politics", ...],
        "livestreamUrl": "..."
    },
    
    // Custom monitors
    "sa-dash-monitors": [
        {
            "id": "...",
            "name": "...",
            "keywords": [...],
            "color": "...",
            "lat": ...,
            "lon": ...
        }
    ],
    
    // Map layer preferences
    "sa-dash-map-layers": {
        "conflicts": false,
        "bases": false,
        ...
    }
}
```

### In-Memory State

Map state and temporary data are kept in module scope, not persisted:

```javascript
// map.js
let currentZoom = 1;
let currentPan = { x: 0, y: 0 };
let currentMapData = null;

// Not saved to localStorage
// Reset on page reload
```

## 🎨 Design Patterns

### 1. Module Pattern
Each JS file is an ES6 module with explicit exports

### 2. Observer Pattern
Map updates notify all dependent layers to re-render

### 3. Factory Pattern
Renderers generate HTML elements from data

### 4. Strategy Pattern
Different rendering strategies for different data types

### 5. Facade Pattern
main.js provides simplified interface to complex subsystems

## 🔒 Security

### XSS Prevention
- All user input sanitized via `escapeHtml()`
- innerHTML assignments use escaped data
- No eval() or Function() constructors

### CORS Handling
- Public CORS proxies used (consideration: run own proxy)
- Fallback chain for reliability
- No sensitive data sent through proxies

### Content Security
- No inline scripts (onclick handlers use window functions)
- External scripts only from trusted CDNs (D3.js, TopoJSON)
- LocalStorage used only for preferences (no sensitive data)

## ⚡ Performance

### Optimization Strategies

1. **Staged Loading:**
   - Critical data loaded first (news, markets)
   - Secondary data loaded next
   - Extras loaded last
   - UI updates progressively

2. **Lazy Rendering:**
   - Panels only render when enabled
   - Map layers only render when toggled on
   - Popups created on demand

3. **Debouncing:**
   - Map pan/zoom events debounced
   - Window resize events debounced

4. **Caching:**
   - Map topology data cached in memory
   - Panel settings cached in localStorage

5. **Efficient Updates:**
   - innerHTML for bulk updates
   - Element reuse where possible
   - Minimize DOM manipulations

## 🧪 Testing Strategy

### Module Tests (test-modules.html)
- Validates all modules load correctly
- Tests function existence
- Basic functional tests
- Import/export verification

### Validation Tests (test-node.mjs)
- Syntax validation
- Bracket balancing
- Export/import consistency
- Module dependency graph

### Manual Testing Checklist
- [ ] All panels load data
- [ ] Map renders correctly
- [ ] Zoom/pan works smoothly
- [ ] Popups display properly
- [ ] Custom monitors work
- [ ] Panel drag-and-drop functions
- [ ] Settings persist across sessions
- [ ] No console errors

## 🔮 Future Architecture Considerations

### Potential Improvements

1. **State Management Library:**
   - Consider Redux or similar for complex state
   - Currently using module scope + localStorage

2. **Backend API:**
   - Own API server for data aggregation
   - Eliminate CORS proxy dependency
   - Add caching layer

3. **WebSocket Integration:**
   - Real-time updates instead of polling
   - Reduce bandwidth usage

4. **Web Workers:**
   - Move heavy analysis to background threads
   - Keep UI responsive during data processing

5. **Service Worker:**
   - Offline functionality
   - Background data sync
   - Push notifications

6. **Build Process:**
   - Currently no build step (intentional simplicity)
   - Could add minification, bundling, tree-shaking
   - Trade-off: complexity vs performance

---

**Last Updated:** January 2026  
**Version:** 1.0.0
