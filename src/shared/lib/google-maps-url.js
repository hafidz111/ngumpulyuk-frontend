/**
 * @param {{
 *   latitude?: number | string | null;
 *   longitude?: number | string | null;
 *   address?: string | null;
 * }} params
 * @returns {string | null}
 */
export function buildGoogleMapsUrl({ latitude, longitude, address } = {}) {
  const lat = latitude != null ? Number(latitude) : NaN;
  const lng = longitude != null ? Number(longitude) : NaN;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const coords = `${lat},${lng}`;
    const query = coords;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  const text = address?.trim();
  if (text) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
  }

  return null;
}
