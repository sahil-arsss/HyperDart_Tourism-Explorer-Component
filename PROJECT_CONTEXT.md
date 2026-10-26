# Tourism Explorer — Project Context

## Purpose & Architecture
A HyperDart standalone component that understands natural-language travel queries (e.g., "things to do in Paris", "tourist attractions in NYC", "museums in Delhi") and displays relevant tourist attractions, sights, and landmarks.

### Architecture
- **Frontend**: React 18 + Vite, wrapped with HyperDart's `withHD` HOC. Renders in both `mainline` (full width) and `sidebar` (compact ~320-400px) modes. Uses MUI for clean UI components and icons.
- **Backend**: Express running on Cloudflare Workers (`@hyperdart/backend`, `wrangler`). Securely calls third-party APIs (Geoapify Places API) to keep API credentials off the client.
- **Data Ingestion**: HyperDart platform extracts entities (`HD_LOCATION`), keywords, and passes structured `props.searchData` and query strings to the component.

## Tech Stack
- Frontend: React 18, `@hyperdart/frontend`, `@mui/material`, `@mui/icons-material`, Vite
- Backend: Express 5, CORS, Cloudflare Workers node runtime, Geoapify Places API
- Local Testing: `@hyperdart/sandbox`

## Folder Structure
- `src/frontend/`: React components (`index.jsx`, `NewComponent.jsx`)
- `src/backend/`: Express server for Cloudflare Workers (`index.js`, `package.json`, `wrangler.jsonc`)
- `src/sandbox/`: Local dev harness (read-only)
- `hyperdart.config.js`: HyperDart triggers, regex, build paths, and format settings
- `searchData.json`: Local sandbox mock data

## Current Implementation State
- **Completed**: Base project, all core hackathon requirements, optional features (Day Plan, Weather, Directions), pre-publish validation, and documentation.
- **Build Status**: `npm run build` succeeds cleanly; `npm run validate` passes with green checkmark.
