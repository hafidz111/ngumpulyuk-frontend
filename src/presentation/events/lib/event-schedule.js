/**
 * Penjadwalan event — selaras dengan filter_scheduled_upcoming / event_has_passed di backend.
 */

function parseLocalDate(value) {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  const parsed = new Date(`${datePart}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Event sudah lewat berdasarkan tanggal (end_date atau event_date) atau status final.
 * @param {Record<string, unknown> | null | undefined} event
 */
export function isEventPast(event) {
  if (!event) return false;

  const status = String(event.status ?? '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') {
    return true;
  }

  const end = parseLocalDate(event.end_date);
  const start = parseLocalDate(event.event_date);
  const effectiveEnd = end ?? start;
  if (!effectiveEnd) return false;

  return effectiveEnd.getTime() < todayLocal().getTime();
}

/**
 * @param {Record<string, unknown> | null | undefined} event
 */
export function isEventJoinClosed(event) {
  return isEventPast(event);
}
