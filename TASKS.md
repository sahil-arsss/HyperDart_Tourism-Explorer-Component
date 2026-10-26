# Tourism Explorer — Tasks

## Phase 1 — Build Base Project
- [x] Inspect existing workspace and reuse installed dependencies
- [x] Create project progress tracking files (`PROJECT_CONTEXT.md`, `TASKS.md`, `TECHNICAL_NOTES.md`)
- [x] Configure `hyperdart.config.js` with trigger keywords and query regexes from problem statement
- [x] Populate `searchData.json` with realistic test payload matching problem statement
- [x] Set up backend `/api/places` route with Geoapify Places API integration, category filtering, and fallback mock data
- [x] Implement base frontend in `src/frontend/NewComponent.jsx` (entity parsing, API fetch, attraction cards, loading/error/empty states, `componentLoaded` signal, day-plan generator, weather integration)
- [x] Verify base frontend and backend build (`npm run build` completed successfully, 930 modules transformed)
- [x] Verify pre-publish validation (`npm run validate` / `validate-publish.js` passing)

## Phase 2 — Add Features Incrementally
- [x] 1. Natural-language query category parsing (museums, monuments, parks, viewpoints, spiritual sites)
- [x] 2. Location resolution fallback and filtering out unwanted place types (hotels, restaurants, shops)
- [x] 3. Rich attraction cards with category chips, addresses, distance indicators, directions links, and responsive mainline/sidebar layouts
- [x] 4. Interactive day-plan / itinerary generator grouping attractions into Morning, Afternoon, Evening
- [x] 5. Weather integration for destination (Open-Meteo current temp, wind, sightseeing weather tips)
- [x] 6. Navigation and directions link for each attraction
- [x] 7. Polished UI with MUI tabs, error states, and no-results guidance

## Phase 3 — Final Testing & Optimization
- [x] End-to-end build test: `npm run build` passes with zero errors
- [x] Pre-publish validation test: `npm run validate` passes with zero errors
- [x] Verify `.gitignore` excludes node_modules, dist, and secrets
- [x] Comprehensive `README.md` covering architecture, ideas, design decisions, data sources, and AI attribution
