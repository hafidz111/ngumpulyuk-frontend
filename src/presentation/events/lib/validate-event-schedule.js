import { format, isBefore, isSameDay, startOfDay } from 'date-fns';

/**
 * @param {{
 *   eventDate?: Date;
 *   eventTime?: string;
 *   endDate?: Date;
 *   endTime?: string;
 * }} params
 * @returns {string|null}
 */
export function validateEventSchedule({ eventDate, eventTime, endDate, endTime }) {
  if (!eventDate || !endDate) return null;

  const startDay = startOfDay(eventDate);
  const endDay = startOfDay(endDate);

  if (isBefore(endDay, startDay)) {
    return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  }

  const startTime = eventTime?.trim() ?? '';
  const endTimeValue = endTime?.trim() ?? '';

  if (isSameDay(startDay, endDay) && startTime && endTimeValue) {
    if (endTimeValue <= startTime) {
      return 'Kalau di hari yang sama, jam selesai harus setelah jam mulai.';
    }
  }

  return null;
}

/**
 * @param {Date} eventDate
 * @param {Date} candidate
 */
export function isEndDateBeforeStart(eventDate, candidate) {
  if (!eventDate || !candidate) return false;
  return isBefore(startOfDay(candidate), startOfDay(eventDate));
}

/**
 * @param {Date} eventDate
 * @param {Date} endDate
 * @param {string} eventTime
 * @param {string} endTime
 */
export function isEndTimeBeforeStartOnSameDay(eventDate, endDate, eventTime, endTime) {
  if (!eventDate || !endDate) return false;
  if (!isSameDay(startOfDay(eventDate), startOfDay(endDate))) return false;
  const start = eventTime?.trim() ?? '';
  const end = endTime?.trim() ?? '';
  if (!start || !end) return false;
  return end <= start;
}
