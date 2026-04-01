import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Restaurant, Location } from './types';
import RestaurantCard from './components/RestaurantCard';
import RestaurantDetail from './components/RestaurantDetail';


interface MapProps {
  favoriteIds: Set<string>;
  onToggleFavorite: (restaurant: Restaurant) => void;
  supabaseRestaurants?: Restaurant[];
}

const Map: React.FC<MapProps> = ({ 
  favoriteIds, 
  onToggleFavorite,
  supabaseRestaurants = []
}) => {
  // Debug: log received restaurants
  React.useEffect(() => {
    console.log('Map received supabaseRestaurants:', supabaseRestaurants);
  }, [supabaseRestaurants]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [userLocation, setUserLocation] = useState<Location>({ lat: 40.7128, lng: -74.0060 });
  const [loading, setLoading] = useState(true);
  const [mapMoving, setMapMoving] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Core Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initTimer = setTimeout(() => {
      if (typeof L === 'undefined') return;

      mapRef.current = L.map(mapContainerRef.current!, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        markerZoomAnimation: true,
        minZoom: 10, // Set minimum zoom level (can zoom out even further)
        maxZoom: 18  // Set maximum zoom level
      }).setView([userLocation.lat, userLocation.lng], 14);

      // Use CartoDB Positron - minimal style similar to Uber with muted colors
      const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd'
      }).addTo(mapRef.current);

      mapRef.current.on('movestart', () => setMapMoving(true));
      mapRef.current.on('moveend', () => setMapMoving(false));

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);

      setupInitialLocation();
      setMapReady(true);
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // Robustly fetch markers when both map is ready and supabaseRestaurants is populated
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    // Always update markers when supabaseRestaurants changes and map is ready
    if (supabaseRestaurants && supabaseRestaurants.length > 0) {
      fetchNearby();
    } else {
      // If no restaurants, clear markers
      updateMarkers([]);
    }
  }, [mapReady, supabaseRestaurants]);

  const setupInitialLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapRef.current) {
            mapRef.current.setView([loc.lat, loc.lng], 14);
            addUserMarker(loc);
            fetchNearby(loc);
          }
        },
        () => {
          addUserMarker(userLocation);
          fetchNearby(userLocation);
        },
        { timeout: 10000 }
      );
    } else {
      addUserMarker(userLocation);
      fetchNearby(userLocation);
    }
  };

  const addUserMarker = (loc: Location) => {
    if (!mapRef.current) return;
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div class="relative flex items-center justify-center">
              <div class="absolute w-10 h-10 bg-gray-400/40 rounded-full animate-ping"></div>
              <div class="w-4 h-4 bg-black rounded-full shadow-2xl drop-shadow-lg"></div>
            </div>`,
      iconSize: [24, 24]
    });
    L.marker([loc.lat, loc.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
  };

  const fetchNearby = (loc?: Location) => {
    const searchLoc = loc || (mapRef.current ? mapRef.current.getCenter() : userLocation);
    setLoading(true);
    try {
      // prefer Supabase-provided restaurants when available
      const source: Restaurant[] = (supabaseRestaurants ?? []).slice();
      // Show all restaurants regardless of distance
      const allWithLocation = source.filter(r => r && r.location);
      setRestaurants(allWithLocation);
      updateMarkers(allWithLocation);
    } catch (err) {
      console.error('Failed to fetch map data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = (data: Restaurant[]) => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    console.log('updateMarkers called with:', data);
      data.forEach((r) => {
        if (!r.location || typeof r.location.lat !== 'number' || typeof r.location.lng !== 'number') {
          console.warn('Skipping restaurant with invalid location:', r);
          return;
        }

        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="group relative flex flex-col items-center cursor-pointer">
                  <svg class="w-8 h-8 text-black drop-shadow-lg transform transition-all group-hover:scale-125 active:scale-95" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        console.log('Adding marker for:', r.name, r.location);
        const marker = L.marker([r.location.lat, r.location.lng], { icon: markerIcon })
          .addTo(mapRef.current)
          .on('click', () => {
            setSelectedRestaurant(r);
            setShowFullDetail(true);
            const map = mapRef.current;
            if (map) {
              map.panTo([r.location!.lat, r.location!.lng], { animate: true });
            }
          });
        
        markersRef.current.push(marker);
      });
  };

  // Refresh button removed as it is no longer needed

  return (
    <div className="relative z-0 w-full h-full min-h-0 min-w-0 bg-white dark:bg-black overflow-hidden">
      <style>{`
        :root { --base-bottom: 6rem; }
        @media (min-width: 768px) {
          :root { --base-bottom: 4.5rem; }
        }
      `}</style>
      {/* Map Container - Centered with tab bar width */}
      <div className="w-full h-full min-h-0 min-w-0 relative">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full min-h-0 min-w-0" 
          style={{ touchAction: 'none' }}
        ></div>
        {/* Control Buttons - Top Right - Overlaid on Map */}
        <div className="absolute top-4 right-4 flex flex-col space-y-3 pointer-events-auto z-[999]">
          <button 
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
              }
            }}
            className="w-12 h-12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Recenter Map"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(45deg) translateX(-0.5px) translateY(-0.5px)' }}>
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Centered Content Wrapper (REMOVED for full map interactivity) */}

      {/* Full Detail Modal Overlay */}
      {showFullDetail && selectedRestaurant && (
        <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none bg-black/70">
          <div className="relative pointer-events-auto">
            <button
              onClick={e => { e.stopPropagation(); setShowFullDetail(false); }}
              aria-label="Close details"
              className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <React.Suspense fallback={<div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl text-black dark:text-white">Loading details...</div>}>
              {selectedRestaurant && selectedRestaurant.id && selectedRestaurant.name && selectedRestaurant.location ? (
                <RestaurantCard
                  restaurant={selectedRestaurant}
                  isFavorite={favoriteIds.has(selectedRestaurant.id)}
                  onToggleFavorite={onToggleFavorite}
                  onClick={undefined}
                  disableClick
                />
              ) : (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl text-black dark:text-white">
                  Error: Restaurant details unavailable.
                </div>
              )}
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
