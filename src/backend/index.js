import express from 'express';
import cors from 'cors';
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

const app = express();

// Middleware: JSON body parsing
app.use(express.json());

const devDomain = env.DEV_DOMAIN;
const stagingDomain = env.STAGING_DOMAIN;
const prodDomain = env.PROD_DOMAIN;

// Middleware: CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  devDomain,
  stagingDomain,
  prodDomain
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Known top sights for offline / sandbox testing when no Geoapify key is configured
const CURATED_CITY_SIGHTS = {
  nyc: [
    { name: "Central Park", category: "Park & Nature", description: "Iconic 843-acre urban park with walking paths, lakes, and cultural monuments.", address: "Manhattan, New York City, NY", lat: 40.7829, lon: -73.9654 },
    { name: "Statue of Liberty", category: "Historic Landmark", description: "Colossal neoclassical sculpture on Liberty Island in New York Harbor.", address: "Liberty Island, New York City, NY", lat: 40.6892, lon: -74.0445 },
    { name: "Metropolitan Museum of Art", category: "Museum", description: "World-renowned art museum housing over 2 million works spanning 5,000 years.", address: "1000 5th Ave, New York City, NY", lat: 40.7794, lon: -73.9632 },
    { name: "Empire State Building", category: "Viewpoint & Landmark", description: "Famous 102-story Art Deco skyscraper offering panoramic city vistas.", address: "350 5th Ave, New York City, NY", lat: 40.7484, lon: -73.9857 },
    { name: "Brooklyn Bridge", category: "Architectural Sights", description: "Historic hybrid cable-stayed suspension bridge connecting Manhattan and Brooklyn.", address: "Brooklyn Bridge, New York City, NY", lat: 40.7061, lon: -73.9969 },
    { name: "Times Square", category: "Sightseeing", description: "Major commercial intersection, entertainment hub, and tourist epicenter.", address: "Broadway & 7th Ave, New York City, NY", lat: 40.7580, lon: -73.9855 },
    { name: "High Line", category: "Park & Walkway", description: "1.45-mile elevated linear park created on a former New York Central Railroad spur.", address: "Meatpacking District, New York City, NY", lat: 40.7480, lon: -74.0048 },
    { name: "9/11 Memorial & Museum", category: "Memorial & Museum", description: "Solemn tribute honoring the lives lost in the 2001 and 1993 terror attacks.", address: "180 Greenwich St, New York City, NY", lat: 40.7115, lon: -74.0132 }
  ],
  paris: [
    { name: "Eiffel Tower", category: "Landmark & Viewpoint", description: "Wrought-iron lattice tower on the Champ de Mars, the defining symbol of Paris.", address: "Champ de Mars, Paris, France", lat: 48.8584, lon: 2.2945 },
    { name: "Louvre Museum", category: "Museum", description: "The world's largest art museum and historic monument home to the Mona Lisa.", address: "Rue de Rivoli, Paris, France", lat: 48.8606, lon: 2.3376 },
    { name: "Cathédrale Notre-Dame de Paris", category: "Historic Site", description: "Medieval Catholic cathedral famous for French Gothic architecture.", address: "6 Parvis Notre-Dame, Paris, France", lat: 48.8530, lon: 2.3499 },
    { name: "Arc de Triomphe", category: "Monuments", description: "Iconic triumphal arch honoring those who fought and died for France.", address: "Place Charles de Gaulle, Paris, France", lat: 48.8738, lon: 2.2950 },
    { name: "Sacré-Cœur Basilica", category: "Historic & Viewpoint", description: "Roman Catholic basilica perched on the summit of the butte Montmartre.", address: "35 Rue du Chevalier de la Barre, Paris, France", lat: 48.8867, lon: 2.3431 },
    { name: "Musée d'Orsay", category: "Museum", description: "Museum housed in a grand Beaux-Arts railway station featuring impressionist art.", address: "1 Rue de la Légion d'Honneur, Paris, France", lat: 48.8599, lon: 2.3266 }
  ],
  delhi: [
    { name: "India Gate", category: "Monuments", description: "War memorial arch dedicated to soldiers of the Indian Army who died during WWI.", address: "Rajpath, New Delhi, India", lat: 28.6129, lon: 77.2295 },
    { name: "Qutub Minar", category: "Historic Landmark", description: "73-metre tall minaret of victory built in 1193, UNESCO World Heritage Site.", address: "Mehrauli, New Delhi, India", lat: 28.5245, lon: 77.1855 },
    { name: "Red Fort", category: "Fort & Historic Site", description: "Historic fortified complex built by Shah Jahan in 1638, symbol of India's heritage.", address: "Netaji Subhash Marg, Chandni Chowk, Old Delhi, India", lat: 28.6562, lon: 77.2410 },
    { name: "Humayun's Tomb", category: "Historic Site", description: "Magnificent red sandstone mausoleum and garden tomb built for Mughal Emperor Humayun.", address: "Mathura Road, Nizamuddin East, New Delhi, India", lat: 28.5933, lon: 77.2507 },
    { name: "Lotus Temple", category: "Places of Worship", description: "Bahá'í House of Worship famous for its flowerlike marble petals design.", address: "Lotus Temple Rd, Kalkaji, New Delhi, India", lat: 28.5535, lon: 77.2588 },
    { name: "National Museum", category: "Museum", description: "One of India's premier museums housing artifacts from pre-historic to modern times.", address: "Janpath, New Delhi, India", lat: 28.6117, lon: 77.2193 }
  ],
  rome: [
    { name: "Colosseum", category: "Ancient Landmark", description: "Iconic oval amphitheatre in the centre of Rome, the largest ancient amphitheatre built.", address: "Piazza del Colosseo, Rome, Italy", lat: 41.8902, lon: 12.4922 },
    { name: "Pantheon", category: "Historic Site", description: "Former Roman temple, now a Catholic church, renowned for its giant concrete dome.", address: "Piazza della Rotonda, Rome, Italy", lat: 41.8986, lon: 12.4769 },
    { name: "Trevi Fountain", category: "Landmark & Sights", description: "World's most famous Baroque fountain, designed by Nicola Salvi in 1762.", address: "Piazza di Trevi, Rome, Italy", lat: 41.9009, lon: 12.4833 },
    { name: "Roman Forum", category: "Historic Ruins", description: "Sprawling ruins of ancient government buildings and temples at the heart of Rome.", address: "Via della Salara Vecchia, Rome, Italy", lat: 41.8925, lon: 12.4853 },
    { name: "Vatican Museums & Sistine Chapel", category: "Museum", description: "Vast collection of classical sculptures and Renaissance masterpieces by Michelangelo.", address: "Viale Vaticano, Rome, Italy", lat: 41.9065, lon: 12.4536 }
  ],
  kurukshetra: [
    { name: "Brahma Sarovar", category: "Historic & Spiritual", description: "Ancient water pool sacred to Hinduism, associated with the epic Mahabharata.", address: "Thanesar, Kurukshetra, Haryana, India", lat: 29.9575, lon: 76.8286 },
    { name: "Jyotisar", category: "Historic Site", description: "The birthplace of the Bhagavad Gita where Lord Krishna delivered his celestial sermon.", address: "Pehowa Road, Kurukshetra, Haryana, India", lat: 29.9667, lon: 76.7667 },
    { name: "Sannihit Sarovar", category: "Spiritual Site", description: "Sacred reservoir believed to be the meeting point of seven sacred Saraswatis.", address: "Thanesar, Kurukshetra, Haryana, India", lat: 29.9654, lon: 76.8335 },
    { name: "Sheikh Chilli's Tomb", category: "Historic Monument", description: "Beautiful Mughal-era architectural monument with marble dome and gardens.", address: "Thanesar, Kurukshetra, Haryana, India", lat: 29.9798, lon: 76.8273 },
    { name: "Kurukshetra Panorama and Science Centre", category: "Museum", description: "Interactive museum featuring panoramic depiction of the Mahabharata battle.", address: "Near Theme Park, Kurukshetra, Haryana, India", lat: 29.9634, lon: 76.8360 },
    { name: "Dharohar Museum", category: "Museum", description: "Museum showcasing the rich cultural heritage and rural traditions of Haryana.", address: "Kurukshetra University, Kurukshetra, Haryana, India", lat: 29.9602, lon: 76.8184 }
  ]
};

// Map search query / category terms to Geoapify category strings
function mapCategoryToGeoapify(categoryStr) {
  if (!categoryStr) return 'tourism.sights,tourism.attraction';
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

// Disallowed category tags (no restaurants, hotels or shops as primary results)
const DISALLOWED_CATEGORIES = new Set([
  'catering',
  'catering.restaurant',
  'catering.fast_food',
  'catering.cafe',
  'accommodation',
  'accommodation.hotel',
  'accommodation.motel',
  'accommodation.hostel',
  'accommodation.guest_house',
  'commercial',
  'commercial.supermarket',
  'commercial.shopping_mall',
  'commercial.clothing'
]);

function isDisallowedPlace(categories = []) {
  return categories.some((cat) => DISALLOWED_CATEGORIES.has(cat) || cat.startsWith('catering') || cat.startsWith('accommodation') || cat.startsWith('commercial.'));
}

// Route: Health & Basic Test
app.get('/api/message', (req, res) => {
  res.json({ message: 'Tourism Explorer backend active' });
});

// Route: Places API
app.get('/api/places', async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lon = parseFloat(req.query.lon);
    const category = req.query.category || '';
    const city = (req.query.city || '').toLowerCase();
    const query = (req.query.query || '').toLowerCase();
    const radius = Math.min(parseInt(req.query.radius || '10000', 10), 50000);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 20);

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

    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (query.includes(key) || city.includes(key)) {
        lat = coords.lat;
        lon = coords.lon;
        break;
      }
    }

    const apiKey = env.GEOAPIFY_API_KEY || process.env.GEOAPIFY_API_KEY || '';

    // If coordinates are invalid, return a 400 error
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Invalid or missing coordinates (lat, lon required)',
        places: []
      });
    }

    // Try Geoapify if API key is present
    if (apiKey && apiKey !== 'your_geoapify_api_key_here') {
      const geoCategories = mapCategoryToGeoapify(category || query);
      const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(geoCategories)}&filter=circle:${lon},${lat},${radius}&limit=30&apiKey=${apiKey}`;

      try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (response.ok) {
          const data = await response.json();
          const features = data.features || [];

          // Clean, filter, and format places
          const places = features
            .map((f) => {
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
            // Remove unnamed places and disallowed categories (hotels, food, shops)
            .filter((p) => Boolean(p.name) && !isDisallowedPlace(p.categories))
            .slice(0, limit);

          if (places.length > 0) {
            return res.json({
              success: true,
              source: 'geoapify',
              count: places.length,
              places
            });
          }
        }
      } catch (apiErr) {
        console.warn('Geoapify fetch failed, falling back:', apiErr.message);
      }
    }

    // Fallback: Check curated city data matching city or query
    let fallbackCity = Object.keys(CURATED_CITY_SIGHTS).find((key) => 
      city.includes(key) || query.includes(key)
    );

    // If no direct city match, compute closest curated city by coordinates
    if (!fallbackCity) {
      let minDistance = Infinity;
      for (const [key, list] of Object.entries(CURATED_CITY_SIGHTS)) {
        if (list.length > 0) {
          const d = Math.hypot(list[0].lat - lat, list[0].lon - lon);
          if (d < minDistance) {
            minDistance = d;
            fallbackCity = key;
          }
        }
      }
      // Only use if within ~3 degrees (~300km)
      if (minDistance > 3.0) {
        fallbackCity = null;
      }
    }

    if (fallbackCity && CURATED_CITY_SIGHTS[fallbackCity]) {
      let list = CURATED_CITY_SIGHTS[fallbackCity];
      // Filter by category if requested
      if (category || query) {
        const filterTerm = (category || query).toLowerCase();
        if (filterTerm.includes('museum')) {
          const filtered = list.filter((p) => p.category.toLowerCase().includes('museum'));
          if (filtered.length > 0) list = filtered;
        } else if (filterTerm.includes('park')) {
          const filtered = list.filter((p) => p.category.toLowerCase().includes('park'));
          if (filtered.length > 0) list = filtered;
        } else if (filterTerm.includes('historic') || filterTerm.includes('monument') || filterTerm.includes('fort')) {
          const filtered = list.filter((p) => p.category.toLowerCase().includes('historic') || p.category.toLowerCase().includes('monument') || p.category.toLowerCase().includes('fort'));
          if (filtered.length > 0) list = filtered;
        }
      }

      return res.json({
        success: true,
        source: 'curated_fallback',
        city: fallbackCity,
        count: list.length,
        places: list.map((p, idx) => ({
          id: `fallback_${fallbackCity}_${idx}`,
          name: p.name,
          categoryDisplay: p.category,
          categories: ['tourism.sights'],
          description: p.description,
          address: p.address,
          lat: p.lat,
          lon: p.lon,
          distance: Math.round(Math.hypot(p.lat - lat, p.lon - lon) * 111000)
        })).slice(0, limit)
      });
    }

    // No places found
    return res.json({
      success: true,
      source: 'empty',
      count: 0,
      places: []
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to retrieve places',
      details: error.message,
      places: []
    });
  }
});

// Route: Weather information from Open-Meteo
app.get('/api/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid lat and lon required' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'Weather service unavailable' });
    }
    const data = await response.json();
    return res.json({
      success: true,
      current: data.current_weather,
      daily: data.daily
    });
  } catch (err) {
    return res.status(500).json({ error: 'Weather lookup failed', details: err.message });
  }
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });
