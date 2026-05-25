import { ROUTES } from '@/shared/config/routes';
import { normalizeChatCard } from '@/application/chat/map-chat-response';

/**
 * @param {string} message
 */
function inferTopic(message) {
  const m = String(message ?? '').toLowerCase();
  if (/olahraga|sport|futsal|badminton|lari|gym|bola|voli|basket|tenis|padel|workout/.test(m)) {
    return 'sports';
  }
  if (/board\s*game|boardgame|kotak|tabletop|dnd|uno|monopoli/.test(m)) {
    return 'boardgame';
  }
  if (/komunitas|community|grup|ngumpul bareng/.test(m)) {
    return 'community';
  }
  if (/kreatif|creative|temanya|tema|vibe|seni|workshop|lukis|fotografi/.test(m)) {
    return 'creative';
  }
  if (/weekend|sabtu|minggu|libur/.test(m)) {
    return 'weekend';
  }
  if (/deket|dekat|sekitar|terdekat|lokasi|area|kota|maps|peta/.test(m)) {
    return 'place';
  }
  if (/event|acara|kegiatan|agenda|hangout|kumpul/.test(m)) {
    return 'event';
  }
  return 'general';
}

/**
 * @param {unknown[]} cards
 */
function cardTypes(cards) {
  const types = new Set();
  for (const raw of Array.isArray(cards) ? cards : []) {
    const card = normalizeChatCard(raw);
    if (card?.type) types.add(card.type);
  }
  return types;
}

/**
 * @param {{
 *   intent?: string;
 *   lastUserMessage?: string;
 *   cards?: unknown[];
 * }} ctx
 * @returns {{ prompts: string[]; link?: { label: string; to: string } }}
 */
export function getFollowUpSuggestions(ctx) {
  const intent = String(ctx?.intent ?? 'general').toLowerCase();
  const topic = inferTopic(ctx?.lastUserMessage ?? '');
  const types = cardTypes(ctx?.cards);

  if (intent === 'community_reco' || topic === 'community' || topic === 'creative') {
    return {
      prompts: ['Komunitas yang lagi aktif', 'Ada yang temanya kreatif?'],
      link: { label: 'Lihat semua komunitas', to: ROUTES.community },
    };
  }

  if (intent === 'place_reco' || topic === 'place') {
    return {
      prompts: ['Event di area itu', 'Yang rame minggu ini'],
      link: { label: 'Buka peta', to: ROUTES.map },
    };
  }

  if (
    intent === 'event_reco' ||
    topic === 'sports' ||
    topic === 'boardgame' ||
    topic === 'weekend' ||
    topic === 'event' ||
    types.has('event')
  ) {
    const prompts =
      topic === 'sports'
        ? [
            'Event futsal minggu ini',
            'Event badminton terdekat',
            'Olahraga lain yang recommended',
          ]
        : topic === 'boardgame'
          ? [
              'Event board game minggu ini',
              'Gaming atau tabletop terdekat',
              'Event indoor deket sini',
            ]
          : topic === 'weekend'
            ? [
                'Event seru weekend ini',
                'Kegiatan outdoor minggu ini',
                'Rekomendasi event pemula',
              ]
            : [
                'Event minggu ini',
                'Event deket lokasiku',
                'Rekomendasi event untukku',
              ];

    return {
      prompts,
      link: { label: 'Explore event lain', to: ROUTES.events },
    };
  }

  if (intent === 'faq') {
    return {
      prompts: ['Gimana cara daftar?', 'Mau bikin event sendiri'],
      link: { label: 'Cari event', to: ROUTES.events },
    };
  }

  if (intent === 'greeting') {
    return {
      prompts: ['Olahraga minggu ini', 'Komunitas yang cocok', 'Ada yang deket?'],
    };
  }

  return {
    prompts: ['Event minggu ini', 'Komunitas yang aktif'],
    link: { label: 'Explore', to: ROUTES.events },
  };
}
