import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, Phone, Share2, Compass, AlertCircle,
  ExternalLink, Search, Check, RefreshCw, X, Filter, Building2,
  Clock, Star, ChevronLeft, ChevronRight, Info, LocateFixed
} from 'lucide-react';
import L from 'leaflet';

const DISTRICTS_LIST = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul',
  'Kanchipuram', 'Chengalpattu', 'Tiruppur', 'Cuddalore', 'Dharmapuri',
  'Krishnagiri', 'Namakkal', 'Thoothukudi', 'Kanyakumari', 'Nagapattinam',
  'Karur', 'Pudukkottai', 'Ramanathapuram', 'Sivaganga', 'Theni',
  'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Viluppuram', 'Virudhunagar'
];

const OFFICE_TYPE_TABS = [
  { id: 'all', label_en: 'All Offices', label_ta: 'அனைத்து மையங்கள்' },
  { id: 'esevai', label_en: 'e-Sevai Maiyam', label_ta: 'இ-சேவை மையம்' },
  { id: 'taluk_office', label_en: 'Taluk Office', label_ta: 'வட்டாட்சியர் அலுவலகம்' },
  { id: 'collectorate', label_en: 'Collectorate', label_ta: 'மாவட்ட ஆட்சியர் அலுவலகம்' },
  { id: 'municipality', label_en: 'Municipality / Corp', label_ta: 'மாநகராட்சி / நகராட்சி' },
  { id: 'ration_shop', label_en: 'Ration Shop', label_ta: 'நியாயவிலைக் கடை' }
];

export default function NearbyOfficesModal({
  isOpen,
  onClose,
  initialFilter = 'all',
  schemeContext = null,
  lang = 'en',
  apiUrl = 'http://localhost:5000'
}) {
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Chennai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const carouselRef = useRef(null);

  // Sync initial filter if prop changes
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter, isOpen]);

  // Request browser geolocation or trigger manual fallback
  useEffect(() => {
    if (!isOpen) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setGeoDenied(false);
          fetchOffices(coords.lat, coords.lng, activeFilter, null);
        },
        (err) => {
          console.warn('[Geolocation Permission]', err.message);
          setGeoDenied(true);
          // Fall back to default district search
          fetchOffices(null, null, activeFilter, selectedDistrict);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setGeoDenied(true);
      fetchOffices(null, null, activeFilter, selectedDistrict);
    }
  }, [isOpen]);

  // Fetch offices from backend API with 10-minute caching
  const fetchOffices = async (lat, lng, type, dist, q) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }
      if (type && type !== 'all') params.append('office_type', type);
      if (dist) params.append('district', dist);
      if (q) params.append('query', q);

      const res = await fetch(`${apiUrl}/api/offices/nearby?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch nearby offices');
      const data = await res.json();
      setOffices(data.offices || []);
      if (data.offices && data.offices.length > 0) {
        setSelectedOffice(data.offices[0]);
      } else {
        setSelectedOffice(null);
      }
    } catch (e) {
      setError(e.message || 'Unable to connect to office service');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    if (userLocation) {
      fetchOffices(userLocation.lat, userLocation.lng, filterId, null, searchQuery);
    } else {
      fetchOffices(null, null, filterId, selectedDistrict, searchQuery);
    }
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    fetchOffices(null, null, activeFilter, dist, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (userLocation) {
      fetchOffices(userLocation.lat, userLocation.lng, activeFilter, null, searchQuery);
    } else {
      fetchOffices(null, null, activeFilter, selectedDistrict, searchQuery);
    }
  };

  const handleRetryLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setGeoDenied(false);
          fetchOffices(coords.lat, coords.lng, activeFilter, null);
        },
        () => {
          setGeoDenied(true);
          setLoading(false);
        }
      );
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Force size recompute when modal opens
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  }, [isOpen]);

  // Update map markers when offices change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(layer)
        .bindPopup(`<b>${lang === 'ta' ? 'உங்கள் இடம்' : 'Your Location'}</b>`);
    }

    if (offices.length === 0) return;

    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);

    offices.forEach((office) => {
      const isSelected = selectedOffice && selectedOffice.id === office.id;
      const typeColor =
        office.type === 'esevai' ? '#10b981' :
        office.type === 'taluk_office' ? '#f59e0b' :
        office.type === 'collectorate' ? '#6366f1' :
        office.type === 'municipality' ? '#ec4899' : '#06b6d4';

      const iconHtml = `
        <div style="
          background-color: ${typeColor};
          color: white;
          padding: 4px 7px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 3px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)'};
          transform: scale(${isSelected ? 1.25 : 1.0});
          transition: transform 0.2s;
        ">
          <span>★ ${office.rating || 4.2}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'office-map-badge',
        html: iconHtml,
        iconSize: [50, 26],
        iconAnchor: [25, 13]
      });

      const marker = L.marker([office.lat, office.lng], { icon: customIcon }).addTo(layer);

      marker.on('click', () => {
        setSelectedOffice(office);
      });

      marker.bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px; max-width: 220px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 14px;">${lang === 'ta' ? office.name_ta : office.name_en}</h4>
          <p style="margin: 0 0 4px; color: #4b5563; font-size: 11px;">${lang === 'ta' ? office.address_ta : office.address_en}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="color: #059669; font-weight: bold; font-size: 11px;">${lang === 'ta' ? office.status_text_ta : office.status_text_en}</span>
            <a href="${office.directions_url}" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 11px;">Directions &rarr;</a>
          </div>
        </div>
      `);

      bounds.extend([office.lat, office.lng]);
    });

    if (offices.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [offices, selectedOffice, userLocation, lang]);

  // Center map when selected office changes from carousel
  const handleSelectOfficeFromCard = (office) => {
    setSelectedOffice(office);
    if (mapInstanceRef.current && office.lat && office.lng) {
      mapInstanceRef.current.setView([office.lat, office.lng], 15, { animate: true });
    }
  };

  const handleShare = async (office) => {
    const text = lang === 'ta' ? office.share_text_ta : office.share_text_en;
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'ta' ? office.name_ta : office.name_en,
          text: text,
          url: office.directions_url
        });
        return;
      } catch (e) {}
    }
    // Clipboard fallback
    navigator.clipboard.writeText(text);
    setCopiedId(office.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">

        {/* TOP HEADER */}
        <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {lang === 'ta' ? 'அருகிலுள்ள அரசு அலுவலகங்கள் & இ-சேவை' : 'Nearby Government Offices & e-Sevai'}
                {schemeContext && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {schemeContext}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                {lang === 'ta'
                  ? 'சான்றிதழ்கள், மனுக்கள் மற்றும் திட்ட சேவைகளுக்கான அதிகாரப்பூர்வ மையங்கள்'
                  : 'Official service points for schemes, certificates, and welfare applications'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH & GEOLOCATION FALLBACK BAR */}
        <div className="px-5 py-2.5 bg-gray-950 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            {geoDenied && (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {lang === 'ta' ? 'ஜிபிஎஸ் அனுமதி இல்லை:' : 'GPS disabled:'}
              </span>
            )}

            <div className="flex items-center gap-2">
              <label className="text-gray-400">{lang === 'ta' ? 'மாவட்டம்:' : 'District:'}</label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {DISTRICTS_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ta' ? 'பின்கோடு அல்லது பகுதி...' : 'Pincode or Area...'}
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs w-36 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {geoDenied ? (
              <button
                onClick={handleRetryLocation}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 underline"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {lang === 'ta' ? 'எனது இருப்பிடத்தை கண்டறி' : 'Use My Geolocation'}
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {lang === 'ta' ? 'நேரலை ஜிபிஎஸ்' : 'Live Geolocation'}
              </span>
            )}
            <span className="text-gray-400 text-xs">
              {offices.length} {lang === 'ta' ? 'மையங்கள்' : 'centers'}
            </span>
          </div>
        </div>

        {/* FILTER CHIPS ROW */}
        <div className="px-5 py-2 bg-gray-900/60 border-b border-gray-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {OFFICE_TYPE_TABS.map(tab => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/60'
                }`}
              >
                {lang === 'ta' ? tab.label_ta : tab.label_en}
              </button>
            );
          })}
        </div>

        {/* MAP VIEW CONTAINER */}
        <div className="flex-1 relative w-full h-full min-h-[280px] bg-gray-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-gray-950/70 backdrop-blur-xs flex items-center justify-center gap-3 text-emerald-400 font-medium text-sm">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{lang === 'ta' ? 'அலுவலகங்களைத் தேடுகிறது...' : 'Finding nearby centers...'}</span>
            </div>
          )}

          {/* Error / No Results State */}
          {!loading && offices.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gray-950/80">
              <div className="p-3 bg-gray-800 rounded-full text-gray-400 mb-2">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-white font-semibold mb-1">
                {lang === 'ta' ? 'அலுவலகங்கள் எதுவும் கிடைக்கவில்லை' : 'No Offices Found in This Area'}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                {lang === 'ta'
                  ? 'தேர்ந்தெடுக்கப்பட்ட பிரிவில் மையங்கள் இல்லை. வேறு மாவட்டத்தை தேர்வு செய்யவும் அல்லது "அனைத்து மையங்கள்" வடிகட்டியை கிளிக் செய்யவும்.'
                  : 'No office found for this specific filter. Try switching to "All Offices" or select another district.'}
              </p>
              <button
                onClick={() => handleFilterChange('all')}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                {lang === 'ta' ? 'அனைத்து மையங்களையும் காட்டு' : 'Show All Offices'}
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM CARD CAROUSEL (Google Maps Style) */}
        <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0">
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-thin scrollbar-thumb-gray-700"
          >
            {offices.map(office => {
              const isSelected = selectedOffice && selectedOffice.id === office.id;
              return (
                <div
                  key={office.id}
                  onClick={() => handleSelectOfficeFromCard(office)}
                  className={`snap-start min-w-[280px] sm:min-w-[320px] max-w-[360px] p-3.5 rounded-xl cursor-pointer transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-gray-800/95 border-emerald-500/80 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                      : 'bg-gray-950/80 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                      {lang === 'ta' ? office.type_name_ta : office.type_name_en}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{office.rating || 4.2}</span>
                      <span className="text-gray-400 text-[10px]">({office.review_count || 120})</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-0.5">
                    {lang === 'ta' ? office.name_ta : office.name_en}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">
                    {lang === 'ta' ? office.address_ta : office.address_en}
                  </p>

                  <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-gray-800/80">
                    <span className={`font-semibold flex items-center gap-1 ${office.is_open ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <Clock className="w-3 h-3" />
                      {lang === 'ta' ? office.status_text_ta : office.status_text_en}
                    </span>
                    <span className="text-gray-300 font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      {office.distance_formatted}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2">
                    <a
                      href={office.directions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs rounded-lg transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{lang === 'ta' ? 'வழிகாட்டல்' : 'Directions'}</span>
                    </a>

                    <a
                      href={`tel:${office.phone}`}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition"
                      title={office.phone}
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(office);
                      }}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition relative"
                      title={lang === 'ta' ? 'பகிர்' : 'Share'}
                    >
                      {copiedId === office.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
