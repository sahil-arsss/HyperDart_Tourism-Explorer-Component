# Tourism Explorer — Technical Notes

## Key Specifications & Guidelines
- **Keywords**: `['tourist attractions', 'things to do', 'places to visit', 'landmarks', 'sights', 'points of interest', 'museums']`
- **Regex Patterns**:
  - `'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*'`
  - `'((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*'`
- **Data Shape**:
  - `searchData`: Supports both array format `[{...}]` and object format `{...}`.
  - Coordinates: `entityInfo.geo.lat` and `entityInfo.geo.long` with fallback to userLocation coordinates.
  - Geoapify endpoint: `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:{longitude},{latitude},5000&limit=20&apiKey=YOUR_API_KEY`. (Longitude first, max 20 places).
- **Backend & Deployment**:
  - `dist/backend/index.js`, `dist/backend/wrangler.jsonc`, and `dist/backend/schema.jsonc` are generated automatically during `npm run build` via `scripts/copy-backend.js`.
  - Geoapify API key remains strictly server-side in Workers environment (`env.GEOAPIFY_API_KEY`).
  - Pre-publish validation executed via `npm run validate` (`scripts/validate-publish.js`).
