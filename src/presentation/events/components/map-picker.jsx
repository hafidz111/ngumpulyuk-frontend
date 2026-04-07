import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../event-data';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * @param {{
 *   latitude: string;
 *   longitude: string;
 *   onChange: (lat: string, lng: string) => void;
 *   className?: string;
 * }} props
 */
export function MapPicker({ latitude, longitude, onChange, className }) {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const position = useMemo(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    return null;
  }, [latitude, longitude]);

  const center = position || DEFAULT_MAP_CENTER;

  const handleLocationSelect = useCallback(
    ([lat, lng]) => {
      onChange(lat.toFixed(6), lng.toFixed(6));
    },
    [onChange],
  );

  useEffect(() => {
    if (position && mapRef.current) {
      mapRef.current.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position]);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10`,
      );
      const results = await res.json();
      setSearchResults(results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search + locate bar */}
      <div className='flex gap-2'>
        <div className='flex flex-1 gap-2 relative'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder='Cari lokasi...'
              className='h-10 rounded-xl bg-muted/40 pl-9'
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className='absolute left-0 top-full z-[1000] mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg'>
                {searchResults.map((result) => {
                  const parts = result.display_name.split(', ');
                  const title = result.name || parts[0];
                  return (
                    <button
                      key={result.place_id}
                      type='button'
                      className='flex w-full flex-col gap-0.5 border-b border-border/40 px-4 py-2.5 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none last:border-0'
                      onClick={() => {
                        handleLocationSelect([parseFloat(result.lat), parseFloat(result.lon)]);
                        setSearchQuery(title);
                        setSearchResults([]);
                      }}
                    >
                      <span className='font-medium text-foreground line-clamp-1'>
                        {title}
                      </span>
                      <span className='text-[0.65rem] text-muted-foreground line-clamp-1'>
                        {result.display_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={handleSearch}
            disabled={isSearching}
            className='h-10 shrink-0 rounded-xl px-4'
          >
            {isSearching ? 'Mencari…' : 'Cari'}
          </Button>
        </div>
        <Button
          type='button'
          variant='outline'
          size='icon'
          disabled={isLocating}
          onClick={handleLocateMe}
          className='size-10 shrink-0 rounded-xl'
          title='Lokasi saya'
        >
          <Navigation className={cn('size-4', isLocating && 'animate-pulse')} />
        </Button>
      </div>

      {/* Map container */}
      <div className='overflow-hidden rounded-2xl border border-border shadow-sm'>
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={position ? 16 : DEFAULT_MAP_ZOOM}
          scrollWheelZoom
          className='z-0 h-[280px] w-full md:h-[340px]'
          style={{ background: 'hsl(33 44% 93%)' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position ? <Marker position={position} icon={orangeIcon} /> : null}
        </MapContainer>
      </div>

      {/* Coordinate display */}
      {position ? (
        <div className='flex items-center gap-2 rounded-xl bg-primary-container/10 px-4 py-2.5'>
          <MapPin className='size-4 shrink-0 text-primary-container' />
          <span className='text-xs font-medium text-foreground'>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        </div>
      ) : (
        <p className='text-center text-xs text-muted-foreground'>
          Klik pada peta atau cari lokasi untuk memilih koordinat
        </p>
      )}
    </div>
  );
}
