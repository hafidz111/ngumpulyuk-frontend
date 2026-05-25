import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Navigation,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { eventsApi } from '@/infrastructure/events/events-api';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { Button } from '@/presentation/components/ui/button';
import { ThemedSearchField } from '@/presentation/components/themed-search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import {
  extractEventCategories,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from '@/presentation/events/event-data';
import { parseEventsListResponse } from '@/presentation/events/lib/parse-events-list-response';
import { formatEventDateRange, formatTimeId, formatLocation } from '@/shared/lib/formatters';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  upcoming: '#f47421',
  ongoing: '#10b981',
  completed: '#6b7280',
  cancelled: '#dc2626',
};

function makeIcon(color, isSelected = false, title = '') {
  const outerSize = isSelected ? 96 : 60;
  const innerSize = isSelected ? 56 : 36;
  const iconSize = isSelected ? 24 : 16;

  const safeTitle = String(title).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `
    <div class="group relative flex h-full w-full cursor-pointer items-center justify-center">
      <div 
        class="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-[1.6]" 
        style="background-color: ${color}; opacity: 0.15;"
      ></div>
      
      <!-- Lingkaran solid penuh warna di tengah -->
      <div 
        class="relative flex items-center justify-center rounded-full shadow-md transition-transform duration-300 group-hover:scale-125" 
        style="background-color: ${color}; width: ${innerSize}px; height: ${innerSize}px;"
      >
        <!-- Ikon outline Map Pin (stroke putih) -->
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>

      <!-- Tooltip judul event saat di-hover -->
      <div class="pointer-events-none absolute left-1/2 top-full z-[1000] mt-1 -translate-x-1/2 whitespace-nowrap rounded-[20px] bg-white px-3 py-1 text-xs font-bold text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        ${safeTitle}
      </div>
    </div>
  `;

  return new L.divIcon({
    html: html,
    className: 'bg-transparent border-0',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
  });
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FlyToUser({ userPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos) map.flyTo(userPos, 14, { duration: 1.2 });
  }, [map, userPos]);
  return null;
}

function SyncMapState({ selectedEvent, setPopupPixel, onClose }) {
  const map = useMapEvents({
    click: onClose,
    move: () => {
      if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude) {
        const pt = map.latLngToContainerPoint([
          parseFloat(selectedEvent.latitude),
          parseFloat(selectedEvent.longitude),
        ]);
        setPopupPixel({ x: pt.x, y: pt.y });
      }
    },
  });

  useEffect(() => {
    if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude) {
      const pt = map.latLngToContainerPoint([
        parseFloat(selectedEvent.latitude),
        parseFloat(selectedEvent.longitude),
      ]);
      setPopupPixel({ x: pt.x, y: pt.y });
    }
  }, [selectedEvent, map, setPopupPixel]);

  return null;
}

const PAGE_SIZE = 10;

function geolocationErrorMessage(error) {
  const locationSettingsHint =
    'Cek izin lokasi browser dan Location Services di perangkat kamu, lalu coba lagi.';

  if (!error || typeof error.code !== 'number') {
    return `Gagal mendapatkan lokasi saat ini. ${locationSettingsHint}`;
  }

  if (error.code === 1) {
    return `Izin lokasi ditolak. ${locationSettingsHint}`;
  }
  if (error.code === 2) {
    return `Lokasi belum bisa ditentukan saat ini. ${locationSettingsHint}`;
  }
  if (error.code === 3) {
    return `Permintaan lokasi melebihi batas waktu. ${locationSettingsHint}`;
  }
  return `Gagal mendapatkan lokasi saat ini. ${locationSettingsHint}`;
}

export default function EventMapPage() {
  const { onOpenMenu } = useChatPageShell();
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodedIdsRef = useRef(new Set());

  const [userPos, setUserPos] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupPixel, setPopupPixel] = useState(null); // { x, y }

  const [page, setPage] = useState(0);

  const mapRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsApi.list({
        limit: 200,
        offset: 0,
        status: 'upcoming',
      });
      const { events } = parseEventsListResponse(res.data);
      setAllEvents(events);
    } catch {
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const toGeocode = allEvents.filter(
      (e) => (!e.latitude || !e.longitude) && !geocodedIdsRef.current.has(e.id),
    );
    if (toGeocode.length === 0) return;

    let cancelled = false;

    async function run() {
      setIsGeocoding(true);
      for (const ev of toGeocode) {
        if (cancelled) break;
        geocodedIdsRef.current.add(ev.id);

        const area = ev.location_area?.replace(/-/g, ' ') ?? '';
        const query = [ev.location_address, area, 'Indonesia']
          .filter(Boolean)
          .join(', ');
        if (!query.trim()) continue;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          );
          const results = await response.json();
          if (results?.[0]) {
            const { lat, lon } = results[0];
            setAllEvents((prev) =>
              prev.map((e) =>
                e.id === ev.id ? { ...e, latitude: lat, longitude: lon } : e,
              ),
            );
          }
        } catch {
          // ignore; event just won't have a marker
        }

        if (!cancelled) await new Promise((r) => setTimeout(r, 1100));
      }
      if (!cancelled) setIsGeocoding(false);
    }

    run();
    return () => { cancelled = true; };
  }, [allEvents]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (error) => {
        toast.error(geolocationErrorMessage(error), { duration: 5000 });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const filteredEvents = useMemo(() => {
    let list = allEvents.filter((e) => e.latitude && e.longitude);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location_address?.toLowerCase().includes(q),
      );
    }
    if (category && category.trim()) {
      const selected = category.trim().toLowerCase();
      list = list.filter((e) => e.category && e.category.toLowerCase() === selected);
    }
    const [refLat, refLng] = userPos || DEFAULT_MAP_CENTER;
    list = [...list].sort((a, b) => {
      const dA = haversineKm(refLat, refLng, parseFloat(a.latitude), parseFloat(a.longitude));
      const dB = haversineKm(refLat, refLng, parseFloat(b.latitude), parseFloat(b.longitude));
      return dA - dB;
    });

    return list;
  }, [allEvents, search, category, userPos]);

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pageEvents = useMemo(
    () => filteredEvents.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filteredEvents, page],
  );

  useEffect(() => {
    setPage(0);
    setSelectedEvent(null);
    setPopupPixel(null);
  }, [search, category, userPos]);

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        toast.error(geolocationErrorMessage(error), { duration: 5000 });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleMarkerClick(event) {
    setSelectedEvent(event);
  }

  function closePopup() {
    setSelectedEvent(null);
    setPopupPixel(null);
  }

  const hasActiveFilters = search || category;
  const eventCategories = useMemo(
    () => extractEventCategories(allEvents),
    [allEvents],
  );

  function clearFilters() {
    setSearch('');
    setCategory('');
  }

  const userIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
          <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="2.5" opacity="0.9"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>`),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.mapTitle}
        subtitle={SHELL_COPY.pages.mapSubtitle}
        onOpenMenu={onOpenMenu}
      />

      <div className='relative min-h-0 flex-1'>
        <div className='absolute left-0 right-0 top-0 z-[1000] pointer-events-none'>
          <div className='pointer-events-auto mx-auto mt-3 flex max-w-4xl items-start gap-2 px-3'>
            <div className='flex flex-1 flex-col gap-2'>
              <div className='flex items-center gap-2 overflow-hidden rounded-2xl border border-border/60 bg-white/95 p-1.5 shadow-xl backdrop-blur-md'>
                <ThemedSearchField
                  className='flex-1'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Cari event...'
                  inputClassName='h-10 rounded-xl border-0 bg-transparent pl-10 shadow-none focus:border-transparent focus:ring-0'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className='h-10 shrink-0 rounded-xl px-3 hover:bg-muted'
                  title='Lokasi saya'
                >
                  <Navigation className={cn('size-4', isLocating && 'animate-pulse text-blue-500')} />
                </Button>
              </div>

              <div className='inline-flex w-fit items-center gap-4 rounded-xl border border-border/60 bg-surface-bright/95 px-4 py-2 shadow-md backdrop-blur-md'>
                <span className='text-[0.65rem] sm:text-xs text-muted-foreground'>
                  {loading ? (
                    <span className='flex items-center gap-1.5'>
                      <Loader2 className='size-3 animate-spin' /> Memuat event…
                    </span>
                  ) : isGeocoding ? (
                    <span className='flex items-center gap-1.5'>
                      <Loader2 className='size-3 animate-spin text-primary-container' />
                      <span>
                        <span className='font-semibold text-foreground'>{filteredEvents.length}</span> event · geocoding lokasi…
                      </span>
                    </span>
                  ) : (
                    <>
                      {SHELL_COPY.pages.mapEventsFound(filteredEvents.length)}
                      {userPos ? SHELL_COPY.pages.mapEventsFoundDistance : ''}
                    </>
                  )}
                </span>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className='flex items-center gap-1 border-l border-border/40 pl-3 sm:pl-4'>
                    <button
                      type='button'
                      disabled={page === 0}
                      onClick={() => { setPage((p) => p - 1); setSelectedEvent(null); }}
                      className='flex size-5 sm:size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30'
                    >
                      <ChevronLeft className='size-3.5' />
                    </button>
                    <span className='min-w-[2.5rem] sm:min-w-[3rem] text-center text-[0.65rem] sm:text-xs font-medium text-foreground'>
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type='button'
                      disabled={page >= totalPages - 1}
                      onClick={() => { setPage((p) => p + 1); setSelectedEvent(null); }}
                      className='flex size-5 sm:size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30'
                    >
                      <ChevronRight className='size-3.5' />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Island */}
            <div className='relative shrink-0 pointer-events-auto'>
              <button
                type='button'
                onClick={() => setFiltersOpen((o) => !o)}
                className='flex h-12 items-center gap-2 rounded-2xl border border-border/60 bg-surface-bright/95 px-4 text-sm font-bold text-foreground shadow-xl backdrop-blur-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-14 sm:px-5'
              >
                <Filter className='size-4' />
                <span className='hidden sm:inline'>Filter</span>
                {hasActiveFilters && (
                  <span className='flex size-4 items-center justify-center rounded-full bg-[#f47421] text-[0.6rem] font-bold text-white'>
                    !
                  </span>
                )}
              </button>

              {/* Separate Filter Container */}
              {filtersOpen && (
                <div className='absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[280px] rounded-3xl border border-border/60 bg-surface-bright/95 p-5 shadow-2xl backdrop-blur-md sm:w-[320px] pointer-events-auto'>
                  <div className='space-y-1.5'>
                    <label className='text-base font-bold text-foreground'>Kategori</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className='h-12 rounded-2xl border-border bg-white text-sm'>
                        <SelectValue placeholder='Semua' />
                      </SelectTrigger>
                      <SelectContent className='z-[9999]'>
                        <SelectItem value=' '>Semua</SelectItem>
                        {eventCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type='button'
                      onClick={clearFilters}
                      className='mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline'
                    >
                      <X className='size-3' />
                      Reset filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <MapContainer
          ref={mapRef}
          center={userPos || DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          scrollWheelZoom
          className='h-full w-full'
          style={{ minHeight: 'calc(100svh - 4rem)' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          <SyncMapState
            selectedEvent={selectedEvent}
            setPopupPixel={setPopupPixel}
            onClose={closePopup}
          />
          {userPos && <FlyToUser userPos={userPos} />}

          {/* User position marker */}
          {userPos && (
            <Marker position={userPos} icon={userIcon} zIndexOffset={1000} />
          )}

          {/* Event markers (current page) */}
          {!loading &&
            pageEvents.map((ev) => {
              const lat = parseFloat(ev.latitude);
              const lng = parseFloat(ev.longitude);
              if (isNaN(lat) || isNaN(lng)) return null;
              const isSelected = selectedEvent?.id === ev.id;
              const color = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming;
              const icon = makeIcon(color, isSelected, ev.title);
              return (
                <EventMarker
                  key={ev.id}
                  event={ev}
                  position={[lat, lng]}
                  icon={icon}
                  isSelected={isSelected}
                  onSelect={handleMarkerClick}
                />
              );
            })}
        </MapContainer>

        {selectedEvent && popupPixel && (
          <EventPopupCard
            event={selectedEvent}
            pixel={popupPixel}
            userPos={userPos}
            onClose={closePopup}
            onNavigate={() => navigate(`/events/${selectedEvent.id}`)}
          />
        )}

        {!loading && !isGeocoding && filteredEvents.length === 0 && (
          <div className='pointer-events-none absolute inset-x-0 bottom-8 z-[1000] flex justify-center'>
            <div className='pointer-events-auto flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-bright/95 px-6 py-4 shadow-xl backdrop-blur-md'>
              <Zap className='size-5 text-muted-foreground/40' />
              <span className='text-sm font-medium text-muted-foreground'>
                {hasActiveFilters
                  ? 'Tidak ada event cocok dengan filter.'
                  : 'Belum ada event yang bisa ditampilkan di peta.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventMarker({ event, position, icon, isSelected, onSelect }) {
  const map = useMap();

  function handleClick() {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 0.6 });
    onSelect(event, position, null);
  }

  return (
    <Marker
      position={position}
      icon={icon}
      zIndexOffset={isSelected ? 500 : 0}
      eventHandlers={{ click: handleClick }}
    />
  );
}

function EventPopupCard({ event, pixel, userPos, onClose, onNavigate }) {
  const popupRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(9999);

  const CARD_W = 288;
  const MARKER_OFFSET = 50;

  useEffect(() => {
    const parent = popupRef.current?.parentElement;
    if (!parent) return undefined;

    const updateWidth = () => {
      setContainerWidth(parent.offsetWidth || 9999);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const fitsRight = pixel.x + MARKER_OFFSET + CARD_W + 12 < containerWidth;

  const left = fitsRight ? pixel.x + MARKER_OFFSET : pixel.x - CARD_W - MARKER_OFFSET;
  const top = pixel.y;

  const participantCount =
    event.participant_count ?? event.participants_count ?? event.current_participants ?? 0;
  const maxP = event.max_participants ?? '∞';
  const dateDisplay = formatEventDateRange(event.event_date, event.end_date);
  const formattedTime = formatTimeId(event.event_time);
  const locationDisplay = formatLocation(event.location_address, event.location_area);

  const dist =
    userPos && event.latitude && event.longitude
      ? haversineKm(
        userPos[0],
        userPos[1],
        parseFloat(event.latitude),
        parseFloat(event.longitude),
      )
      : null;

  return (
    <div
      ref={popupRef}
      className='pointer-events-auto absolute z-[1100] select-none animate-in fade-in-0 zoom-in-95 duration-150'
      style={{ left, top, width: CARD_W, transform: 'translateY(-50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {fitsRight && (
        <span
          className='absolute -left-2 top-1/2 -translate-y-1/2 border-8 border-transparent border-r-card drop-shadow-sm'
          style={{ filter: 'drop-shadow(-1px 0 0 hsl(var(--border)/0.6))' }}
        />
      )}
      {!fitsRight && (
        <span
          className='absolute -right-2 top-1/2 -translate-y-1/2 border-8 border-transparent border-l-card drop-shadow-sm'
          style={{ filter: 'drop-shadow(1px 0 0 hsl(var(--border)/0.6))' }}
        />
      )}

      <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl'>
        {event.cover_image ? (
          <div className='h-32 overflow-hidden'>
            <img
              src={event.cover_image}
              alt={event.title}
              className='h-full w-full object-cover'
            />
          </div>
        ) : (
          <div className='flex h-24 items-center justify-center bg-gradient-to-br from-primary-container/20 to-secondary/20'>
            <Zap className='size-8 text-primary-container/30' />
          </div>
        )}

        <div className='p-3.5'>
          {/* Category + close */}
          <div className='mb-2 flex items-start justify-between gap-2'>
            <span className='inline-block rounded-full bg-primary-container/15 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary-container'>
              {event.category || 'Event'}
            </span>
            <button
              type='button'
              onClick={onClose}
              className='rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'
            >
              <X className='size-3.5' />
            </button>
          </div>

          <h3 className='mb-2 line-clamp-2 text-sm font-bold leading-snug text-foreground'>
            {event.title}
          </h3>

          <div className='space-y-1 text-xs text-muted-foreground'>
            {dateDisplay && (
              <p className='flex items-center gap-1.5 truncate'>
                <Calendar className='size-3 shrink-0 text-primary-container/70' />
                {dateDisplay}{formattedTime ? ` · ${formattedTime}` : ''}
              </p>
            )}
            {locationDisplay && (
              <p className='flex items-center gap-1.5 truncate'>
                <MapPin className='size-3 shrink-0 text-primary-container/70' />
                {locationDisplay}
              </p>
            )}
            <p className='flex items-center gap-1.5'>
              <Users className='size-3 shrink-0 text-primary-container/70' />
              {participantCount}/{maxP} peserta
              {dist !== null && (
                <span className='ml-auto font-medium text-primary-container'>
                  {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                </span>
              )}
            </p>
          </div>

          {/* Status badge */}
          {event.status && (
            <div className='mt-2'>
              <span
                className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider',
                  event.status === 'ongoing'
                    ? 'bg-green-100 text-green-700'
                    : event.status === 'upcoming'
                      ? 'bg-violet-100 text-violet-700'
                      : event.status === 'completed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-100 text-red-600',
                )}
              >
                {event.status === 'ongoing'
                  ? 'Berlangsung'
                  : event.status === 'upcoming'
                    ? 'Akan Datang'
                    : event.status === 'completed'
                      ? 'Selesai'
                      : event.status === 'cancelled'
                        ? 'Dibatalkan'
                        : event.status}
              </span>
            </div>
          )}

          <button
            type='button'
            onClick={onNavigate}
            className='mt-3 w-full rounded-xl bg-primary-container px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary-container/30 transition hover:bg-primary-container/90 active:scale-[0.98]'
          >
            Lihat Detail →
          </button>
        </div>
      </div>
    </div>
  );
}
