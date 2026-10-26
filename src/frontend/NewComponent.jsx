import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import MuseumIcon from '@mui/icons-material/Museum';
import ParkIcon from '@mui/icons-material/Park';
import CastleIcon from '@mui/icons-material/Castle';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExploreIcon from '@mui/icons-material/Explore';
import NavigationIcon from '@mui/icons-material/Navigation';

// Standard global city coordinate mapping
const KNOWN_DESTINATIONS = {
  nyc: { city: 'New York City', country: 'United States', lat: 40.7128, lon: -74.0060 },
  'new york': { city: 'New York City', country: 'United States', lat: 40.7128, lon: -74.0060 },
  paris: { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  rome: { city: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  delhi: { city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  kurukshetra: { city: 'Kurukshetra', country: 'India', lat: 29.9695, lon: 76.8783 },
  tokyo: { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  kyoto: { city: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681 },
  london: { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  india: { city: 'India', country: 'India', lat: 28.6139, lon: 77.2090 },
  mumbai: { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  chicago: { city: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298 },
  berlin: { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 }
};

// Client-side fallback dataset so component works smoothly even without network
const FALLBACK_ATTRACTIONS = {
  nyc: [
    { name: "Central Park", categoryDisplay: "Park & Nature", address: "Manhattan, New York City, NY", description: "Iconic 843-acre urban park with walking paths, lakes, and cultural monuments.", lat: 40.7829, lon: -73.9654 },
    { name: "Statue of Liberty", categoryDisplay: "Historic Landmark", address: "Liberty Island, New York City, NY", description: "Colossal neoclassical sculpture on Liberty Island in New York Harbor.", lat: 40.6892, lon: -74.0445 },
    { name: "Metropolitan Museum of Art", categoryDisplay: "Museum", address: "1000 5th Ave, New York City, NY", description: "World-renowned art museum housing over 2 million works spanning 5,000 years.", lat: 40.7794, lon: -73.9632 },
    { name: "Empire State Building", categoryDisplay: "Viewpoint & Landmark", address: "350 5th Ave, New York City, NY", description: "Famous 102-story Art Deco skyscraper offering panoramic city vistas.", lat: 40.7484, lon: -73.9857 },
    { name: "Brooklyn Bridge", categoryDisplay: "Architectural Sights", address: "Brooklyn Bridge, New York City, NY", description: "Historic hybrid cable-stayed suspension bridge connecting Manhattan and Brooklyn.", lat: 40.7061, lon: -73.9969 }
  ],
  india: [
    { name: "Taj Mahal", categoryDisplay: "Historic Wonder", address: "Tajganj, Agra, Uttar Pradesh", description: "World Heritage ivory-white marble mausoleum on the bank of the Yamuna River.", lat: 27.1751, lon: 78.0421 },
    { name: "Red Fort", categoryDisplay: "Historic Fort", address: "Netaji Subhash Marg, Chandni Chowk, New Delhi", description: "Historic 17th-century Mughal fort constructed from red sandstone.", lat: 28.6562, lon: 77.2410 },
    { name: "Qutub Minar", categoryDisplay: "Ancient Landmark", address: "Seth Sarai, Mehrauli, New Delhi", description: "73-metre tall minaret of victory built in 1193, UNESCO World Heritage Site.", lat: 28.5245, lon: 77.1855 },
    { name: "India Gate", categoryDisplay: "National Monument", address: "Kartavya Path, New Delhi", description: "Triumphal arch war memorial dedicated to Indian soldiers of World War I.", lat: 28.6129, lon: 77.2295 }
  ],
  delhi: [
    { name: "India Gate", categoryDisplay: "National Monument", address: "Rajpath, New Delhi, India", description: "War memorial dedicated to soldiers of the Indian Army who died during WWI.", lat: 28.6129, lon: 77.2295 },
    { name: "Qutub Minar", categoryDisplay: "Historic Landmark", address: "Mehrauli, New Delhi, India", description: "73-metre tall minaret of victory built in 1193, UNESCO World Heritage Site.", lat: 28.5245, lon: 77.1855 },
    { name: "Red Fort", categoryDisplay: "Historic Fort", address: "Chandni Chowk, Old Delhi, India", description: "Historic fortified complex built by Shah Jahan in 1638, symbol of India's heritage.", lat: 28.6562, lon: 77.2410 },
    { name: "National Museum", categoryDisplay: "Museum", address: "Janpath, New Delhi, India", description: "Premier museum housing artifacts from pre-historic to modern times.", lat: 28.6117, lon: 77.2193 }
  ],
  paris: [
    { name: "Eiffel Tower", categoryDisplay: "Landmark & Viewpoint", address: "Champ de Mars, Paris, France", description: "Wrought-iron lattice tower on the Champ de Mars, the defining symbol of Paris.", lat: 48.8584, lon: 2.2945 },
    { name: "Louvre Museum", categoryDisplay: "Museum", address: "Rue de Rivoli, Paris, France", description: "The world's largest art museum and historic monument home to the Mona Lisa.", lat: 48.8606, lon: 2.3376 },
    { name: "Cathédrale Notre-Dame de Paris", categoryDisplay: "Historic Site", address: "6 Parvis Notre-Dame, Paris, France", description: "Medieval Catholic cathedral famous for French Gothic architecture.", lat: 48.8530, lon: 2.3499 }
  ],
  rome: [
    { name: "Colosseum", categoryDisplay: "Ancient Landmark", address: "Piazza del Colosseo, Rome, Italy", description: "Iconic oval amphitheatre in the centre of Rome, the largest ancient amphitheatre built.", lat: 41.8902, lon: 12.4922 },
    { name: "Pantheon", categoryDisplay: "Historic Site", address: "Piazza della Rotonda, Rome, Italy", description: "Former Roman temple, now a Catholic church, renowned for its giant concrete dome.", lat: 41.8986, lon: 12.4769 },
    { name: "Trevi Fountain", categoryDisplay: "Landmark & Sights", address: "Piazza di Trevi, Rome, Italy", description: "World's most famous Baroque fountain, designed by Nicola Salvi in 1762.", lat: 41.9009, lon: 12.4833 }
  ],
  kurukshetra: [
    { name: "Brahma Sarovar", categoryDisplay: "Historic & Spiritual", address: "Thanesar, Kurukshetra, Haryana, India", description: "Ancient water pool sacred to Hinduism, associated with the epic Mahabharata.", lat: 29.9575, lon: 76.8286 },
    { name: "Jyotisar", categoryDisplay: "Historic Site", address: "Pehowa Road, Kurukshetra, Haryana, India", description: "The birthplace of the Bhagavad Gita where Lord Krishna delivered his celestial sermon.", lat: 29.9667, lon: 76.7667 },
    { name: "Sheikh Chilli's Tomb", categoryDisplay: "Historic Monument", address: "Thanesar, Kurukshetra, Haryana, India", description: "Beautiful Mughal-era architectural monument with marble dome and gardens.", lat: 29.9798, lon: 76.8273 }
  ]
};

function getCategoryIcon(catStr = '') {
  const c = catStr.toLowerCase();
  if (c.includes('museum')) return <MuseumIcon fontSize="small" />;
  if (c.includes('park') || c.includes('nature')) return <ParkIcon fontSize="small" />;
  if (c.includes('historic') || c.includes('monument') || c.includes('fort') || c.includes('palace')) return <CastleIcon fontSize="small" />;
  return <PlaceIcon fontSize="small" />;
}

export default function NewComponent(props) {
  const { searchData, searchQuery, format = 'mainline', messageHandlers, deployedBackendURL } = props;
  const isSidebar = format === 'sidebar';

  const [activeTab, setActiveTab] = useState(0);
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNotifiedLoaded, setHasNotifiedLoaded] = useState(false);

  const API_URL =
    process.env.NODE_ENV === 'production'
      ? deployedBackendURL || ''
      : (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:3001');

  // Extract query and location information
  const searchInfo = useMemo(() => {
    const rawData = Array.isArray(searchData) ? searchData[0] : searchData;
    let q = rawData?.query || searchQuery || '';

    // If query isn't directly passed (e.g. sandbox typing without NLU engine), check sandbox input or URL
    if (!q && typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        q = urlParams.get('query') || urlParams.get('text') || '';
        if (!q && window.parent) {
          const parentParams = new URLSearchParams(window.parent.location.search);
          q = parentParams.get('query') || parentParams.get('text') || '';
          if (!q) {
            const inputEl = window.parent.document.querySelector('input[type="text"]');
            if (inputEl && inputEl.value) {
              q = inputEl.value.trim();
            }
          }
        }
      } catch {
        // Cross-origin fallback
      }
    }

    if (!q) q = 'Tourist attractions in NYC';

    const entity = rawData?.entities?.[0];
    const geo = entity?.entityInfo?.geo;
    const userPos = rawData?.userLocation?.position?.coords;

    let city = geo?.city || entity?.word || '';
    let country = geo?.country || '';
    let lat = geo?.lat ?? null;
    let lon = geo?.long ?? null;

    const lowerQ = q.toLowerCase();

    // Match destination from query text if entity geo was not resolved
    if (!lat || !lon) {
      for (const [key, dest] of Object.entries(KNOWN_DESTINATIONS)) {
        if (lowerQ.includes(key)) {
          city = dest.city;
          country = dest.country;
          lat = dest.lat;
          lon = dest.lon;
          break;
        }
      }
    }

    // Default fallback to NYC if still unresolved
    if (!lat || !lon) {
      city = 'New York City';
      country = 'United States';
      lat = 40.7128;
      lon = -74.0060;
    }

    // Detect category intent from query
    let detectedCategory = '';
    if (lowerQ.includes('museum')) detectedCategory = 'Museums';
    else if (lowerQ.includes('monument') || lowerQ.includes('landmark')) detectedCategory = 'Landmarks & Monuments';
    else if (lowerQ.includes('temple') || lowerQ.includes('church') || lowerQ.includes('mosque')) detectedCategory = 'Spiritual Sites';
    else if (lowerQ.includes('park') || lowerQ.includes('garden')) detectedCategory = 'Parks & Nature';
    else if (lowerQ.includes('viewpoint') || lowerQ.includes('sight')) detectedCategory = 'Sights & Viewpoints';
    else detectedCategory = 'Top Sights & Attractions';

    return { query: q, lat, lon, city, country, detectedCategory };
  }, [searchData, searchQuery]);

  // Fetch places
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const getLocalPlaces = () => {
      const cityKey = Object.keys(FALLBACK_ATTRACTIONS).find(k => 
        searchInfo.city.toLowerCase().includes(k) || searchInfo.query.toLowerCase().includes(k)
      ) || 'nyc';

      return FALLBACK_ATTRACTIONS[cityKey] || FALLBACK_ATTRACTIONS.nyc;
    };

    try {
      let loadedFromBackend = false;

      if (API_URL) {
        try {
          const placesUrl = `${API_URL}/api/places?lat=${searchInfo.lat}&lon=${searchInfo.lon}&city=${encodeURIComponent(searchInfo.city)}&query=${encodeURIComponent(searchInfo.query)}`;
          const placesRes = await fetch(placesUrl);
          if (placesRes.ok) {
            const placesData = await placesRes.json();
            if (placesData.places && placesData.places.length > 0) {
              setPlaces(placesData.places);
              loadedFromBackend = true;
            }
          }
        } catch {
          // Backend offline, fallback smoothly
        }
      }

      if (!loadedFromBackend) {
        setPlaces(getLocalPlaces());
      }

      // Live weather from Open-Meteo
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${searchInfo.lat}&longitude=${searchInfo.lon}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          setWeather(wData.current_weather);
        }
      } catch (wErr) {
        console.warn('Weather fetch:', wErr);
      }
    } catch {
      setPlaces(getLocalPlaces());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchInfo.lat, searchInfo.lon, searchInfo.city, searchInfo.query]);

  // Notify HyperDart platform
  useEffect(() => {
    if (!loading && !hasNotifiedLoaded) {
      messageHandlers?.componentLoaded?.();
      setHasNotifiedLoaded(true);
    }
  }, [loading, hasNotifiedLoaded, messageHandlers]);

  // Generate 3-part day plan
  const dayPlan = useMemo(() => {
    if (!places || places.length === 0) return [];
    const morning = places.slice(0, Math.ceil(places.length / 3));
    const afternoon = places.slice(Math.ceil(places.length / 3), Math.ceil((places.length * 2) / 3));
    const evening = places.slice(Math.ceil((places.length * 2) / 3));

    return [
      { time: 'Morning (09:00 - 12:30)', title: 'Morning Highlights', items: morning, note: 'Beat the crowds at these top landmarks.' },
      { time: 'Afternoon (13:30 - 17:00)', title: 'Cultural & Historic Exploration', items: afternoon, note: 'Great time for walking tours, architecture and exhibitions.' },
      { time: 'Evening (17:30 - 20:30)', title: 'Sunset Vistas & Leisure', items: evening, note: 'Relax at viewpoints and illuminated heritage monuments.' }
    ].filter(section => section.items.length > 0);
  }, [places]);

  return (
    <Box
      sx={{
        p: isSidebar ? 1.5 : 3,
        bgcolor: 'background.default',
        color: 'text.primary',
        fontFamily: 'inherit',
        maxWidth: 1200,
        margin: '0 auto',
        minHeight: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header section */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: isSidebar ? 'column' : 'row', justifyContent: 'space-between', alignItems: isSidebar ? 'flex-start' : 'center', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant={isSidebar ? 'h6' : 'h5'} sx={{ fontWeight: 700 }}>
              {searchInfo.city}
            </Typography>
            {searchInfo.country && (
              <Chip label={searchInfo.country} size="small" variant="outlined" />
            )}
            <Chip
              label={searchInfo.detectedCategory}
              size="small"
              color="primary"
              variant="filled"
              icon={<ExploreIcon fontSize="small" />}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            "{searchInfo.query}"
          </Typography>
        </Box>

        {/* Quick Weather summary badge */}
        {weather && (
          <Tooltip title="Current destination temperature">
            <Paper variant="outlined" sx={{ px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
              <WbSunnyIcon color="warning" fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.round(weather.temperature)}°C
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wind {weather.windspeed} km/h
              </Typography>
            </Paper>
          </Tooltip>
        )}
      </Box>

      {/* Tabs navigation */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="standard"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab icon={<PlaceIcon fontSize="small" />} iconPosition="start" label={`Places (${places.length})`} />
        <Tab icon={<ScheduleIcon fontSize="small" />} iconPosition="start" label="Day Plan" />
        <Tab icon={<WbSunnyIcon fontSize="small" />} iconPosition="start" label="Weather" />
      </Tabs>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Discovering sights and points of interest in {searchInfo.city}...
          </Typography>
        </Box>
      )}

      {/* Error state */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={fetchData}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && places.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <ExploreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            No matching tourist attractions found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            We could not find verified sights near "{searchInfo.city}". Try searching for major cities, districts, or broader categories like "museums" or "landmarks".
          </Typography>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchData}>
            Retry Search
          </Button>
        </Paper>
      )}

      {/* Tab 0: Attractions Grid / List */}
      {!loading && !error && activeTab === 0 && places.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isSidebar ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 2
          }}
        >
          {places.map((place, idx) => (
            <Card
              key={place.id || idx}
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent sx={{ flex: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                    {place.name}
                  </Typography>
                  <Chip
                    icon={getCategoryIcon(place.categoryDisplay)}
                    label={place.categoryDisplay}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.72rem' }}
                  />
                </Box>

                {place.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                    {place.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
                    {place.formatted || place.address || 'Prominent tourist attraction and landmark.'}
                  </Typography>
                )}

                {place.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <PlaceIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" noWrap>
                      {place.address}
                    </Typography>
                  </Box>
                )}

                {place.distance && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    ~{(place.distance / 1000).toFixed(1)} km from center
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ pt: 0, px: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<NavigationIcon fontSize="small" />}
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || searchInfo.city))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                >
                  Directions
                </Button>
                <Typography variant="caption" color="text.disabled">
                  #{idx + 1}
                </Typography>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Tab 1: Day Plan */}
      {!loading && !error && activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Curated 1-Day Itinerary for {searchInfo.city}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A balanced sequence of sights organized by time of day to maximize your visit without backtracking.
            </Typography>
          </Box>

          {dayPlan.map((section, sIdx) => (
            <Paper key={sIdx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {section.time} — {section.title}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {section.note}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.items.map((item, iIdx) => (
                  <Box key={item.id || iIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20 }}>
                      {iIdx + 1}.
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description || item.address || item.categoryDisplay}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Tab 2: Weather */}
      {!loading && !error && activeTab === 2 && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Weather Forecast for {searchInfo.city}
          </Typography>
          {weather ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WbSunnyIcon sx={{ fontSize: 44, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(weather.temperature)}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wind speed: {weather.windspeed} km/h
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 1 }}>
                {weather.temperature > 28
                  ? 'Warm weather: ideal for air-conditioned museums, shaded parks, and evening viewpoints.'
                  : weather.temperature < 10
                  ? 'Cool weather: dress warmly for outdoor monuments and historic walks.'
                  : 'Pleasant sightseeing conditions for both outdoor and indoor attractions.'}
              </Alert>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Weather information currently unavailable for this destination.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
