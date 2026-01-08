# Changelog

All notable changes to the SA-DASH project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite
  - README.md with detailed features and setup
  - CONTRIBUTING.md with development guidelines
  - DEPLOYMENT.md with multiple deployment options
  - ARCHITECTURE.md with system design documentation
  - SECURITY.md with security policy and best practices
- Development tooling configuration
  - package.json with npm scripts
  - ESLint configuration (.eslintrc.json)
  - Prettier configuration (.prettierrc.json)
  - .gitignore for common exclusions
- MIT License file
- This CHANGELOG

### Changed
- Project structure enhanced with documentation

## [1.0.0] - 2026-01-08

### Added
- Initial release of SA-DASH
- Global interactive map with D3.js visualization
- Real-time activity hotspots with intensity indicators
- Multiple intelligence feed panels:
  - World/Geopolitical news
  - Technology/AI developments
  - Financial markets and news
  - Government/Policy updates
- Market monitoring features:
  - Real-time market indices
  - Sector heatmap visualization
  - Commodities tracking with VIX
- Advanced analytics:
  - Correlation Engine for pattern detection
  - Narrative Tracker for information flow analysis
  - Main Character trending entity detection
- Specialized trackers:
  - Congressional trading activity
  - Whale crypto transactions
  - Government contract awards
  - AI development news
  - Tech industry layoffs
  - Federal Reserve balance sheet
- Custom monitor system:
  - User-defined keyword tracking
  - Optional map location visualization
  - Color-coded identification
- Map features:
  - Conflict zone overlays
  - Military base markers
  - Nuclear facility markers
  - Undersea cable infrastructure
  - US city markers with news integration
  - Flight tracking with aircraft classification
  - Zoom, pan, and layer controls
  - 24-hour historical playback
- Panel management:
  - Show/hide any panel
  - Drag-and-drop reordering
  - Settings persistence in localStorage
- Situation monitoring:
  - Venezuela crisis tracking
  - Greenland situation monitoring
- Testing infrastructure:
  - Browser-based module tests (test-modules.html)
  - Node.js syntax validation (test-node.mjs)
- Modular ES6 architecture:
  - 11 JavaScript modules
  - Clean separation of concerns
  - ~10,700 lines of code
- Comprehensive styling:
  - Dark theme optimized for monitoring
  - Responsive design
  - Custom animations and transitions

### Technical Features
- Pure JavaScript ES6 modules (no build step required)
- D3.js v7 for data visualization
- TopoJSON for efficient geographic data
- LocalStorage for settings persistence
- CORS proxy support for external data fetching
- RSS feed aggregation
- Public API integrations (markets, USGS, etc.)
- No backend required (runs entirely in browser)
- Auto-refresh every 5 minutes
- Staged data loading for performance
- Error handling and graceful degradation

[Unreleased]: https://github.com/cywf/sa-dash/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cywf/sa-dash/releases/tag/v1.0.0
