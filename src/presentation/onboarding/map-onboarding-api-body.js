import { format } from 'date-fns';

import {
  AREA_OPTIONS,
  EVENT_TIME_OPTIONS,
} from '@/presentation/onboarding/onboarding-data';

/** Maps slot waktu UI ke nilai `preferred_time` API. */
const TIME_SLOT_TO_PREFERRED_TIME = {
  morning: 'morning',
  midday: 'afternoon',
  afternoon: 'evening',
  evening: 'night',
};

const ORDER = ['morning', 'midday', 'afternoon', 'evening'];

/**
 * @param {{
 *   birthDate: Date;
 *   gender: string;
 *   selectedActivityIds: Set<string>;
 *   customActivities: string[];
 *   locationAreaId: string;
 *   timeSlotIds: Set<string>;
 * }} params
 */
export function mapOnboardingApiBody({
  birthDate,
  gender,
  selectedActivityIds,
  customActivities,
  locationAreaId,
  timeSlotIds,
}) {
  const interests = [
    ...Array.from(selectedActivityIds),
    ...customActivities,
  ].map((s) => String(s).trim());

  const areaLabel =
    AREA_OPTIONS.find((a) => a.id === locationAreaId)?.label ?? '';

  const slots = Array.from(timeSlotIds);
  let preferredTime = 'morning';
  for (const id of ORDER) {
    if (slots.includes(id)) {
      preferredTime = TIME_SLOT_TO_PREFERRED_TIME[id] ?? 'morning';
      break;
    }
  }

  const preferred_days = slots.map((id) => {
    const opt = EVENT_TIME_OPTIONS.find((o) => o.id === id);
    return opt?.label ?? id;
  });

  return {
    personal_data: {
      date_of_birth: format(birthDate, 'yyyy-MM-dd'),
      gender,
    },
    interests,
    preferences: {
      preferred_days,
      preferred_time: preferredTime,
      preferred_location: areaLabel,
    },
  };
}
