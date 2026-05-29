import { ExternalLink, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatLocation } from '@/shared/lib/formatters';
import { buildGoogleMapsUrl } from '@/shared/lib/google-maps-url';
import { Card } from '@/presentation/components/ui/card';

/**
 * @param {{
 *   latitude: number | string;
 *   longitude: number | string;
 *   locationAddress?: string;
 *   locationArea?: string;
 *   className?: string;
 * }} props
 */
export function EventMapPreview({
  latitude,
  longitude,
  locationAddress,
  locationArea,
  className,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const locationLabel = formatLocation(locationAddress, locationArea);
  const googleMapsUrl = buildGoogleMapsUrl({
    latitude: lat,
    longitude: lng,
    address: locationLabel,
  });

  if (!googleMapsUrl) {
    return null;
  }

  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-2xl border-0 bg-card shadow-sm',
        className,
      )}
    >
      <div className='relative'>
        <iframe
          title='Lokasi event'
          src={embedSrc}
          className='pointer-events-none h-52 w-full border-0 md:h-64'
          loading='lazy'
          tabIndex={-1}
        />
        <a
          href={googleMapsUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/25 via-transparent to-transparent p-4 transition-colors hover:from-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8000] focus-visible:ring-offset-2'
          aria-label='Buka lokasi di Google Maps'
        >
          <span className='inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur-sm'>
            <MapPin className='size-4 text-[#FF8000]' aria-hidden />
            Buka di Google Maps
            <ExternalLink
              className='size-3.5 text-muted-foreground'
              aria-hidden
            />
          </span>
        </a>
      </div>
    </Card>
  );
}
