import { format } from 'date-fns';

/**
 * @param {number} intervalMinutes
 * @returns {string[]}
 */
export function buildTimeOptions(intervalMinutes = 5) {
  const options = [];
  for (let total = 0; total < 24 * 60; total += intervalMinutes) {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    options.push(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    );
  }
  return options;
}

/**
 * @param {Date} a
 * @param {Date} b
 */
export function isSameCalendarDay(a, b) {
  if (!a || !b) return false;
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
}

export const TIME_OPTIONS = buildTimeOptions(5);
