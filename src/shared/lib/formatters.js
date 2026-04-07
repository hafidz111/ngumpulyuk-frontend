import { AREA_OPTIONS } from '@/presentation/events/event-data';

export function formatDateId(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (err) {
    return dateStr;
  }
}

export function formatTimeId(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export function formatLocation(address, areaId) {
  const areaLabel = AREA_OPTIONS.find(a => a.id === areaId)?.label || areaId;
  const parts = [];
  if (address && address.trim()) parts.push(address.trim());
  if (areaLabel && areaLabel.trim()) parts.push(areaLabel.trim());
  return parts.join(', ');
}

export function formatEventDateRange(startStr, endStr) {
  if (!startStr) return '';
  if (!endStr || startStr === endStr) return formatDateId(startStr);

  try {
    const d1 = new Date(startStr);
    const d2 = new Date(endStr);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return `${formatDateId(startStr)} - ${formatDateId(endStr)}`;
    }

    const fmtWk = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });
    const fmtDay = new Intl.DateTimeFormat('id-ID', { day: 'numeric' });
    const fmtMon = new Intl.DateTimeFormat('id-ID', { month: 'long' });
    const fmtYr = new Intl.DateTimeFormat('id-ID', { year: 'numeric' });

    const w1 = fmtWk.format(d1), w2 = fmtWk.format(d2);
    const day1 = fmtDay.format(d1), day2 = fmtDay.format(d2);
    const m1 = fmtMon.format(d1), m2 = fmtMon.format(d2);
    const y1 = fmtYr.format(d1), y2 = fmtYr.format(d2);

    const weekdays = `${w1}-${w2}`;

    if (y1 === y2 && m1 === m2) {
      return `${weekdays}, ${day1}-${day2} ${m1} ${y1}`;
    } else if (y1 === y2) {
      return `${weekdays}, ${day1} ${m1} - ${day2} ${m2} ${y1}`;
    } else {
      return `${weekdays}, ${day1} ${m1} ${y1} - ${day2} ${m2} ${y2}`;
    }
  } catch (err) {
    return `${formatDateId(startStr)} - ${formatDateId(endStr)}`;
  }
}


