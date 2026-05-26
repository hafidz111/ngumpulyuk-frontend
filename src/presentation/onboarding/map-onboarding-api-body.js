import { format } from 'date-fns';

import {
  ONBOARDING_ACTIVITIES,
  EVENT_TIME_OPTIONS,
} from '@/presentation/onboarding/onboarding-data';
import { resolveLocationLabel } from '@/shared/lib/indonesia-locations';
import { toTitleCase } from '@/shared/lib/text-format';

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
  const activityLabelMap = new Map(
    ONBOARDING_ACTIVITIES.map((item) => [item.id, item.label]),
  );
  const mappedPresetInterests = Array.from(selectedActivityIds).map(
    (id) => activityLabelMap.get(id) || id,
  );

  const interests = Array.from(
    new Map(
      [...mappedPresetInterests, ...customActivities]
        .map((raw) => toTitleCase(raw))
        .filter(Boolean)
        .map((label) => [label.toLowerCase(), label]),
    ).values(),
  );

  const areaLabel = resolveLocationLabel(locationAreaId);

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
