# Tourism Explorer — HyperDart Standalone Component

Tourism Explorer is a fast, intelligent, and responsive HyperDart component designed to answer natural-language travel queries like *"things to do in Paris"*, *"tourist attractions in NYC"*, *"museums in Delhi"*, or *"landmarks in Rome"*. 

Instead of routing users to long, ad-heavy travel articles, Tourism Explorer instantly presents what is worth seeing in a destination—complete with verified sights, category filtering, an ordered 1-day itinerary, destination weather, and direct navigation links.

---

## 🌟 Key Features

1. **Intelligent Query & Category Understanding**
   - Automatically detects travel intents and queries requesting specific categories:
     - **Museums**: Art, science, and history galleries
     - **Monuments & Landmarks**: Forts, ancient ruins, and heritage monuments
     - **Parks & Nature**: Urban gardens, waterfronts, and natural reserves
     - **Sacred & Spiritual Sites**: Historic temples, cathedrals, and shrines
     - **Viewpoints & Sights**: Panoramic towers, lookouts, and bridges
   - Extracts destination entity and coordinates via HyperDart's `HD_LOCATION` collection.

2. **Strict Relevance & Anti-Noise Filtering**
   - Eliminates commercial clutter: Restaurants, hotels, bars, motels, and shopping stores are strictly filtered out from primary results to prioritize genuine points of interest.

3. **Curated 1-Day Itinerary**
   - Automatically generates a balanced, ordered 3-part day plan (Morning, Afternoon, Evening) grouping attractions to maximize visiting efficiency without backtracking.

4. **Live Weather & Visiting Guidance**
   - Real-time weather integration via Open-Meteo providing current temperatures and actionable recommendations (e.g. ideal outdoor walks vs. indoor museum visits).

5. **Responsive Mainline & Sidebar Views**
   - **Mainline**: Spacious, multi-column card grid with rich metadata and distance calculations.
   - **Sidebar**: Compact single-column view designed specifically for narrow side panels (~320–400px).

6. **Clear Fallbacks & No-Results Handling**
   - Graceful fallback for offline development, local sandbox testing, or API rate limit scenarios.
   - User-friendly empty state with actionable suggestions when no sights match.

---

## 🏗️ Architecture & Tech Stack

```
hyperDart Search Query
         │
         ▼
┌──────────────────────────────────────────────┐
│ React Frontend (Vite + MUI + withHD)         │
│  - NewComponent.jsx                          │
│  - Responsive tabs: Places, Day Plan, Weather│
└──────────────────────┬───────────────────────┘
                       │ Calls API_URL (/api/places, /api/weather)
                       ▼
┌──────────────────────────────────────────────┐
│ Express on Cloudflare Workers (@hyperdart)   │
│  - index.js                                  │
│  - Geoapify Places API (Secure Server-side)  │
│  - Open-Meteo Weather API                    │
│  - Curated fallback engine                   │
└──────────────────────────────────────────────┘
```

- **Frontend**: React 18, `@hyperdart/frontend` (`withHD`), `@mui/material`, `@mui/icons-material`, Vite.
- **Backend**: Express 5 on Cloudflare Workers node compatibility layer, CORS.
- **Data Sources**:
  - [Geoapify Places API](https://www.geoapify.com/places-api) (Primary attractions database)
  - [Open-Meteo API](https://open-meteo.com) (Destination weather & forecasts)
  - Google Maps navigation links for instant directions

---

## 🚀 Development & Testing

### 1. Install & Build
```bash
# Build frontend and prepare backend distribution
npm run build

# Validate HyperDart publishing requirements
npm run validate
```

### 2. Local Sandbox Dev Server
```bash
# Start frontend sandbox (port 5173)
npm start
```

### 3. Backend Dev Server (Cloudflare Workers)
```bash
cd src/backend
npx wrangler dev
```

---

## 📋 Design Decisions & Hackathon Documentation

- **Server-Side API Security**: In strict compliance with HyperDart guidelines, `GEOAPIFY_API_KEY` is handled entirely server-side in Cloudflare Workers and never exposed to client-side bundles.
- **Offline & Sandbox Resilience**: To ensure smooth evaluation and sandbox previewing without requiring an active third-party API key upfront, the backend includes curated tourist records for major global cities (NYC, Paris, Delhi, Rome, Kurukshetra) that seamlessly hand off to live Geoapify API calls when credentials are supplied.
- **Component Lifecycle Protocol**: `props.messageHandlers.componentLoaded()` is called exclusively when data is fully rendered to provide smooth frame transitions inside the Dart frame.

---

## 🤖 AI Tools & Author Attribution

- **AI Tools Used**: Google Gemini / Antigravity Agent for scaffolding boilerplate, structuring Geoapify filter logic, and validating HyperDart configuration rules.
- **Authored / Customized**:
  - `hyperdart.config.js`: Custom travel keywords, regex patterns for `HD_LOCATION`, and platform format definitions.
  - `src/backend/index.js`: Custom Express route handling, category mapper, restaurant/hotel filter, and Open-Meteo weather integration.
  - `src/frontend/NewComponent.jsx`: Complete UI redesign with MUI tabs, responsive layout, itinerary generator, and navigation links.
  - `scripts/copy-backend.js`: Custom automated asset builder for Cloudflare worker deployment.
