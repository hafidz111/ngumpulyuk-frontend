import { format, isBefore, isSameDay, startOfDay } from 'date-fns';

/**
 * @param {Date} [date]
 * @returns {boolean}
 */
export function isStartDateBeforeToday(date) {
  if (!date) return false;
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

/**
 * Min HH:mm untuk input waktu mulai jika tanggal = hari ini.
 * @param {Date} [eventDate]
 * @returns {string|undefined}
 */
export function minStartTimeForDate(eventDate) {
  if (!eventDate || !isSameDay(startOfDay(eventDate), startOfDay(new Date()))) {
    return undefined;
  }
  return format(new Date(), 'HH:mm');
}

/**
 * @param {{
 *   eventDate?: Date;
 *   eventTime?: string;
 *   endDate?: Date;
 *   endTime?: string;
 *   enforceStartNotBeforeNow?: boolean;
 * }} params
 * @returns {string|null}
 */
export function validateEventSchedule({
  eventDate,
  eventTime,
  endDate,
  endTime,
  enforceStartNotBeforeNow = false,
}) {
  if (!eventDate) return null;

  const startDay = startOfDay(eventDate);
  const startTime = eventTime?.trim() ?? '';

  if (enforceStartNotBeforeNow && isStartDateBeforeToday(eventDate)) {
    return 'Tanggal mulai tidak boleh sebelum hari ini.';
  }

  if (enforceStartNotBeforeNow && startTime && isSameDay(startDay, startOfDay(new Date()))) {
    const minNow = minStartTimeForDate(eventDate);
    if (minNow && startTime < minNow) {
      return 'Waktu mulai tidak boleh sebelum waktu sekarang.';
    }
  }

  if (!endDate) return null;

  const endDay = startOfDay(endDate);

  if (isBefore(endDay, startDay)) {
    return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
  }

  const endTimeValue = endTime?.trim() ?? '';

  if (isSameDay(startDay, endDay) && startTime && endTimeValue) {
    if (endTimeValue < startTime) {
      return 'Waktu selesai tidak boleh kurang dari waktu mulai.';
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
  return end < start;
}
