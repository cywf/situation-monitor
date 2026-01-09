# Map Assets

This directory contains TopoJSON map data files for the SA-DASH application.

## Files

- `countries-110m.json` - World countries map (low resolution)
- `states-10m.json` - US states map (medium resolution)

## ⚠️ Current Status

**IMPORTANT:** The current files are placeholder stubs with empty geometry arrays. They will NOT render properly.

## Setup

For the application to work properly, these files should be downloaded from the world-atlas and us-atlas npm packages:

```bash
# Download world map
curl -o assets/maps/countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json

# Download US states map
curl -o assets/maps/states-10m.json https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
```

Or install via npm and copy:

```bash
npm install world-atlas us-atlas
cp node_modules/world-atlas/countries-110m.json assets/maps/
cp node_modules/us-atlas/states-10m.json assets/maps/
```

## Fallback

If these files are not present or invalid, the application will automatically fall back to fetching them from the CDN:
- https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
- https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json

This fallback ensures the application works even if local assets are missing, but loading from CDN will be slower.

## License

Map data is from Natural Earth and is in the public domain.
TopoJSON files are distributed under ISC license by Mike Bostock.
