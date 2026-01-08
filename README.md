# Situation Awareness Dashboard (SA-DASH)

A real-time intelligence monitoring and analysis platform for tracking global events, market movements, geopolitical developments, and critical information flows.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Code Size](https://img.shields.io/badge/Lines-10.7k-informational)

## 🎯 Overview

SA-DASH is a comprehensive situation monitoring dashboard that aggregates and visualizes data from multiple sources to provide real-time situational awareness. It features:

- **Global Activity Map** - Interactive world map with activity hotspots, conflict zones, and real-time event tracking
- **Intelligence Feeds** - Curated news from political, technology, financial, and government sources
- **Market Monitoring** - Real-time market data, sector heatmaps, commodities tracking
- **Predictive Analytics** - Polymarket predictions and trend analysis
- **Custom Monitors** - User-defined keyword tracking with map location support
- **Correlation Engine** - AI-powered pattern detection across multiple data sources
- **Narrative Tracker** - Monitor information flows from fringe to mainstream media

## ✨ Key Features

### 🗺️ Interactive Global Map
- Real-time activity hotspots with intensity indicators
- Conflict zone overlays with boundary visualization
- US city markers with breaking news integration
- Military base and nuclear facility markers
- Undersea cable infrastructure overlay
- Flight tracking with aircraft classification
- Zoom, pan, and layer toggle controls

### 📊 Intelligence Panels
- **World/Geopolitical** - Breaking news and developments
- **Technology/AI** - Tech industry updates and AI developments
- **Financial** - Market-moving financial news
- **Markets** - Real-time stock indices and prices
- **Sector Heatmap** - Visual sector performance tracker
- **Commodities/VIX** - Commodity prices and volatility index
- **Government/Policy** - Policy changes and government actions

### 🎯 Advanced Analytics
- **Correlation Engine** - Detect emerging patterns and momentum signals
- **Narrative Tracker** - Track information as it moves from alternative to mainstream sources
- **Main Character** - Identify the most mentioned topics and entities daily
- **Custom Monitors** - Create keyword-based monitors with optional map locations

### 💼 Specialized Trackers
- **Congress Trades** - Track congressional stock trading activity
- **Whale Watch** - Monitor large crypto wallet transactions
- **Gov Contracts** - Track government contract awards
- **AI Arms Race** - Monitor AI development competition
- **Layoffs Tracker** - Track tech industry layoffs
- **Money Printer** - Federal Reserve balance sheet tracker

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server for local development (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cywf/sa-dash.git
   cd sa-dash
   ```

2. **Serve the application:**
   
   **Option A: Python HTTP Server**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option B: Node.js HTTP Server**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### First Use

1. Click **"Refresh"** in the header to load initial data
2. Click **"Panels"** to configure which panels are visible
3. Use **"+ Monitor"** to create custom keyword monitors
4. Drag panel headers to reorder the dashboard layout
5. Click map hotspots, cities, and markers for detailed popups

## 📁 Project Structure

```
sa-dash/
├── index.html              # Main HTML entry point
├── styles.css              # Complete styling (~4,800 lines)
├── js/                     # JavaScript modules
│   ├── main.js            # Application entry point
│   ├── constants.js       # Configuration and data arrays
│   ├── utils.js           # Utility functions
│   ├── data.js            # Data fetching and processing
│   ├── map.js             # Global map rendering
│   ├── layers.js          # Map layer management
│   ├── panels.js          # Panel management
│   ├── renderers.js       # UI rendering functions
│   ├── intelligence.js    # Analysis and correlation
│   ├── monitors.js        # Custom monitor system
│   └── popups.js          # Map popup management
├── test-modules.html       # Browser-based module tests
└── test-node.mjs          # Node.js validation tests
```

## 🏗️ Architecture

### Module Organization

```
┌─────────────┐
│   main.js   │  Entry point, orchestrates all modules
└──────┬──────┘
       │
       ├─────► constants.js    (Configuration)
       ├─────► utils.js        (Helpers)
       ├─────► data.js         (API & Data)
       ├─────► map.js          (Map Core)
       ├─────► layers.js       (Map Layers)
       ├─────► panels.js       (Panel System)
       ├─────► renderers.js    (UI Rendering)
       ├─────► intelligence.js (Analytics)
       ├─────► monitors.js     (Custom Monitors)
       └─────► popups.js       (Popups)
```

### Data Flow

1. **User Action** → Triggers refresh or interaction
2. **Data Fetch** → `data.js` fetches from multiple sources (RSS, APIs)
3. **Processing** → `intelligence.js` analyzes patterns and correlations
4. **Rendering** → `renderers.js` updates UI panels
5. **Map Update** → `map.js` + `layers.js` render geographic data
6. **Interaction** → `popups.js` handles user clicks and details

### Key Technologies

- **ES6 Modules** - Native JavaScript module system
- **D3.js v7** - Data visualization and map projections
- **TopoJSON** - Efficient geographic data encoding
- **LocalStorage** - Client-side data persistence
- **Fetch API** - HTTP requests to data sources
- **CORS Proxies** - Cross-origin data fetching

## 🔧 Configuration

### Panel Settings

Panels can be toggled via the **"Panels"** button in the header. Settings are persisted in `localStorage`.

### Custom Monitors

Create custom keyword monitors:
1. Click **"+ Monitor"** button
2. Enter monitor name and keywords (comma-separated)
3. Choose a color for the monitor
4. (Optional) Add latitude/longitude for map visualization
5. Save - matches will appear in "My Monitors" panel

### Livestream URL

Configure a YouTube livestream URL in the Panels settings to embed live video content.

## 🧪 Testing

### Browser Tests

Open `test-modules.html` in a browser to run comprehensive module tests:

```bash
# Serve the test file
python3 -m http.server 8000
# Then open: http://localhost:8000/test-modules.html
```

Tests validate:
- ✅ Module loading and imports
- ✅ Function existence and signatures
- ✅ Basic functional tests
- ✅ Export/import relationships

### Node.js Validation

Run syntax and structure validation:

```bash
node test-node.mjs
```

Validates:
- ✅ Module syntax correctness
- ✅ Balanced brackets/braces
- ✅ Export/import declarations
- ✅ Dependency graph integrity
- ✅ Line count statistics

## 🌐 Data Sources

The dashboard aggregates data from multiple sources:

- **RSS Feeds** - Various news sources via RSS
- **Market APIs** - Stock and commodity price data
- **USGS** - Earthquake data
- **Polymarket** - Prediction market data
- **Federal Reserve** - Economic data
- **Flight Tracking** - Aviation data APIs
- **Custom APIs** - Various specialized data sources

> **Note:** Some data sources may require CORS proxies for browser-based access.

## 🔐 Security & Privacy

- **Client-Side Only** - No backend server, runs entirely in browser
- **LocalStorage** - User preferences stored locally only
- **No Auth Required** - No login or personal data collected
- **CORS Proxies** - Used for accessing external APIs (be aware of privacy implications)
- **No Analytics** - No tracking or analytics scripts included

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow ES6 module patterns
- Maintain separation of concerns
- Add comments for complex logic
- Test changes with both test files
- Keep code style consistent with existing patterns

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js** - Powerful data visualization library
- **TopoJSON** - Efficient geographic data format
- **Natural Earth** - Public domain map data
- **RSS Feed Providers** - Various news sources
- **Open Source Community** - For tools and inspiration

## 📮 Contact

- **GitHub Issues** - For bug reports and feature requests
- **Discussions** - For questions and community discussions

## 🗺️ Roadmap

### Planned Features
- [ ] Historical data playback
- [ ] Advanced filtering and search
- [ ] Export/import dashboard configurations
- [ ] Mobile-responsive design improvements
- [ ] WebSocket real-time updates
- [ ] Additional data source integrations
- [ ] Enhanced AI analysis capabilities
- [ ] Collaborative monitoring features

## 📊 Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** January 2026  
**Maintainers:** [@cywf](https://github.com/cywf)

---

**⚡ Built with vanilla JavaScript, no build step required ⚡**
