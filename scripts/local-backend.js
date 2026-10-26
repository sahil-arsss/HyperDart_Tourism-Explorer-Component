import http from 'http';
import fs from 'fs';
import path from 'path';

// Extract API key from wrangler.jsonc or env
let apiKey = process.env.GEOAPIFY_API_KEY || '';
try {
  const wranglerRaw = fs.readFileSync(path.resolve('src/backend/wrangler.jsonc'), 'utf8');
  // Strip jsonc comments and parse
  const cleanJson = wranglerRaw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const wranglerConfig = JSON.parse(cleanJson);
  if (wranglerConfig.vars?.GEOAPIFY_API_KEY) {
    apiKey = wranglerConfig.vars.GEOAPIFY_API_KEY;
  }
} catch {
  // Use env or default
}

const PORT = 3001;

function mapCategoryToGeoapify(categoryStr = '') {
  const c = categoryStr.toLowerCase();
  if (c.includes('museum')) return 'entertainment.museum';
  if (c.includes('monument') || c.includes('landmark') || c.includes('fort') || c.includes('historic')) {
    return 'heritage,building.historic,tourism.sights';
  }
  if (c.includes('temple') || c.includes('worship') || c.includes('church') || c.includes('mosque')) {
    return 'building.place_of_worship';
  }
  if (c.includes('park') || c.includes('garden') || c.includes('nature')) {
    return 'leisure.park,natural';
  }
  if (c.includes('viewpoint') || c.includes('sights') || c.includes('view')) {
    return 'tourism.attraction.viewpoint,tourism.sights';
  }
  return 'tourism.sights,tourism.attraction';
}

const CITY_COORDS = {
  nyc: { lat: 40.7128, lon: -74.0060 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  paris: { lat: 48.8566, lon: 2.3522 },
  rome: { lat: 41.9028, lon: 12.4964 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  kurukshetra: { lat: 29.9695, lon: 76.8783 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  london: { lat: 51.5074, lon: -0.1278 }
};

const DISALLOWED_CATEGORIES = new Set([
  'catering', 'catering.restaurant', 'catering.fast_food', 'catering.cafe',
  'accommodation', 'accommodation.hotel', 'accommodation.motel', 'accommodation.hostel',
  'commercial', 'commercial.supermarket', 'commercial.shopping_mall', 'commercial.clothing'
]);

function isDisallowed(categories = [], name = '') {
  if (!name || typeof name !== 'string') return true;
  const n = name.toLowerCase().trim();
  if (n.length < 2) return true;
  // Filter out transport/highway ramps unless named museum/monument
  if ((n.includes('flyover') || n.includes('ramp') || n.includes('underpass')) && !n.includes('museum')) {
    return true;
  }
  return categories.some(cat => 
    DISALLOWED_CATEGORIES.has(cat) || 
    cat.startsWith('catering') || 
    cat.startsWith('accommodation') || 
    cat.startsWith('commercial.')
  );
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (reqUrl.pathname === '/api/places') {
    let lat = parseFloat(reqUrl.searchParams.get('lat'));
    let lon = parseFloat(reqUrl.searchParams.get('lon'));
    const category = reqUrl.searchParams.get('category') || '';
    const query = reqUrl.searchParams.get('query') || '';
    const radius = Math.min(parseInt(reqUrl.searchParams.get('radius') || '10000', 10), 50000);
    const limit = Math.min(parseInt(reqUrl.searchParams.get('limit') || '20', 10), 20);

    // Auto-align coordinates if query clearly specifies a destination
    const lQuery = query.toLowerCase();
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (lQuery.includes(key)) {
        lat = coords.lat;
        lon = coords.lon;
        break;
      }
    }

    if (isNaN(lat) || isNaN(lon)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Valid lat and lon coordinates required', places: [] }));
      return;
    }

    try {
      const geoCategories = mapCategoryToGeoapify(category || query);
      const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(geoCategories)}&filter=circle:${lon},${lat},${radius}&limit=30&apiKey=${apiKey}`;

      const apiRes = await fetch(url);
      if (!apiRes.ok) {
        throw new Error(`Geoapify HTTP ${apiRes.status}`);
      }

      const data = await apiRes.json();
      const features = data.features || [];

      const places = features
        .map(f => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [props.lon, props.lat];
          return {
            id: props.place_id || `${props.lat}_${props.lon}`,
            name: props.name || props.address_line1 || '',
            formatted: props.formatted || '',
            address: props.address_line2 || props.street || props.city || '',
            city: props.city || '',
            country: props.country || '',
            categories: props.categories || [],
            categoryDisplay: props.categories?.[0]?.replace(/^[a-z_]+\./, '').replace(/_/g, ' ') || 'Tourist Attraction',
            lat: coords[1],
            lon: coords[0],
            distance: props.distance || null
          };
        })
        .filter(p => Boolean(p.name) && !isDisallowed(p.categories, p.name))
        .slice(0, limit);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        source: 'geoapify',
        count: places.length,
        places
      }));
    } catch (err) {
      console.error('Geoapify error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to retrieve places from Geoapify', details: err.message, places: [] }));
    }
    return;
  }

  if (reqUrl.pathname === '/api/weather') {
    const lat = parseFloat(reqUrl.searchParams.get('lat'));
    const lon = parseFloat(reqUrl.searchParams.get('lon'));

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const wRes = await fetch(weatherUrl);
      const wData = await wRes.json();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, current: wData.current_weather }));
    } catch (wErr) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: wErr.message }));
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Tourism Explorer local backend active' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\x1b[32m✔ Tourism Explorer Local Backend running on http://127.0.0.1:${PORT}\x1b[0m`);
  console.log(`  Geoapify Key: ${apiKey ? apiKey.slice(0, 6) + '...' + apiKey.slice(-4) : 'Not configured'}`);
});
