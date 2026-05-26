import { LANDING_COPY } from '@/shared/copy/landing-copy';

/**
 * @param {number} n
 */
export function formatLandingCount(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}jt+`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}rb+`;
  }
  return `${value}+`;
}

/**
 * @param {string} [locationArea]
 * @param {string} [address]
 */
function formatEventLocation(locationArea, address) {
  const area = String(locationArea ?? '').trim();
  const addr = String(address ?? '').trim();
  if (area && addr) return `${area}, ${addr}`;
  return area || addr || 'Lokasi di app';
}

/**
 * @param {Record<string, unknown>} ev
 */
function mapTrendingItem(ev) {
  return {
    id: String(ev.id ?? ''),
    categoryLabel: String(ev.category ?? 'Event'),
    title: String(ev.title ?? 'Event'),
    location: formatEventLocation(ev.location_area, ev.location_address),
    image: String(ev.cover_image ?? ''),
    participantCount: Number(ev.participant_count ?? 0),
    maxParticipants: ev.max_participants,
  };
}

/**
 * @param {Record<string, unknown>} c
 */
function mapCommunityItem(c) {
  const creator = /** @type {Record<string, unknown>|null} */ (c.creator);
  return {
    id: String(c.id ?? ''),
    name: String(c.name ?? 'Circle'),
    category: String(c.category ?? ''),
    description: String(c.description ?? ''),
    coverImage: String(c.cover_image ?? c.logo ?? ''),
    memberCount: Number(c.member_count ?? 0),
    upcomingEventsCount: Number(c.upcoming_events_count ?? 0),
    creatorName: creator
      ? String(creator.full_name ?? creator.username ?? '')
      : '',
  };
}

/**
 * @param {ReturnType<typeof mapCommunityItem>} circle
 */
function mapCommunityForCard(circle) {
  return {
    id: circle.id,
    name: circle.name,
    description: circle.description,
    cover_image: circle.coverImage,
    member_count: circle.memberCount,
    upcoming_events_count: circle.upcomingEventsCount,
  };
}

/**
 * @param {unknown} payload
 */
export function mapLandingPublicResponse(payload) {
  const root =
    payload && typeof payload === 'object' && 'data' in payload
      ? /** @type {Record<string, unknown>} */ (payload.data)
      : /** @type {Record<string, unknown>} */ (payload);

  const statsRaw = /** @type {Record<string, unknown>} */ (root?.stats ?? {});
  const heroRaw = /** @type {Record<string, unknown>} */ (root?.hero ?? {});
  const spotlight = /** @type {Record<string, unknown>|null} */ (
    heroRaw.spotlight_event ?? null
  );

  const featuredEvents = Array.isArray(root?.featured_events)
    ? root.featured_events.map((e) =>
        mapTrendingItem(/** @type {Record<string, unknown>} */ (e)),
      )
    : [];

  const featuredCommunities = Array.isArray(root?.featured_communities)
    ? root.featured_communities.map((c) =>
        mapCommunityItem(/** @type {Record<string, unknown>} */ (c)),
      )
    : [];

  const socialRaw = /** @type {Record<string, unknown>} */ (
    heroRaw.social_members ?? {}
  );
  const socialTotal = Number(socialRaw.total ?? statsRaw.users ?? 0);
  const socialPreview = Array.isArray(socialRaw.preview)
    ? socialRaw.preview
    : [];

  /** @type {{ id: string; name: string; image: string }[]} */
  let socialMembers = socialPreview
    .map((row, idx) => {
      const m = /** @type {Record<string, unknown>} */ (row);
      const name =
        String(m.full_name ?? m.username ?? '').trim() || `Member ${idx + 1}`;
      return {
        id: String(m.id ?? name),
        name,
        image: String(m.profile_picture ?? '').trim(),
      };
    })
    .filter((m) => m.id);

  if (socialMembers.length === 0 && Array.isArray(heroRaw.member_avatars)) {
    socialMembers = heroRaw.member_avatars
      .filter((u) => typeof u === 'string' && u.trim())
      .map((src, idx) => ({
        id: `legacy-${idx}`,
        name: 'Member',
        image: String(src).trim(),
      }));
  }

  const recentJoins = Number(statsRaw.recent_joins_week ?? 0);
  const usersCount = Number(statsRaw.users ?? 0);

  const floatingCards = [];
  if (recentJoins > 0) {
    floatingCards.push({
      variant: 'count',
      count: recentJoins,
      countSuffix: 'join minggu ini',
      subtitle: 'Partisipasi event',
    });
  } else if (usersCount > 0) {
    floatingCards.push({
      variant: 'count',
      count: usersCount,
      countSuffix: 'member',
      subtitle: 'Di NgumpulYuk',
    });
  } else {
    floatingCards.push({
      variant: 'count',
      count: 0,
      countSuffix: 'member',
      subtitle: 'Di NgumpulYuk',
    });
  }
  if (spotlight?.title) {
    floatingCards.push({
      variant: 'text',
      title: 'Lagi rame',
      subtitle: String(spotlight.title),
    });
  }

  const stats = [
    {
      icon: 'users',
      count: Number(statsRaw.users ?? 0),
      label: LANDING_COPY.statsLabels.users,
    },
    {
      icon: 'calendar',
      count: Number(statsRaw.events ?? statsRaw.events_total ?? 0),
      label: LANDING_COPY.statsLabels.events,
    },
    {
      icon: 'map-pin',
      count: Number(statsRaw.communities ?? 0),
      label: LANDING_COPY.statsLabels.communities,
    },
    {
      icon: 'sparkles',
      count: Number(statsRaw.participants ?? 0),
      label: LANDING_COPY.statsLabels.participants,
    },
  ];

  return {
    brand: LANDING_COPY.brand,
    navigation: LANDING_COPY.navigation,
    hero: {
      ...LANDING_COPY.hero,
      floatingCards,
      socialProof: {
        members: socialMembers,
        total: socialTotal > 0 ? socialTotal : usersCount,
        memberCount: usersCount,
        hasMembers: usersCount > 0,
      },
    },
    stats,
    trending: {
      ...LANDING_COPY.trending,
      items: featuredEvents,
      isEmpty: featuredEvents.length === 0,
    },
    communities: {
      ...LANDING_COPY.communities,
      items: featuredCommunities.map(mapCommunityForCard),
      isEmpty: featuredCommunities.length === 0,
    },
    steps: LANDING_COPY.steps,
    aiMatcher: LANDING_COPY.aiMatcher,
    finalCta: LANDING_COPY.finalCta,
    footer: LANDING_COPY.footer,
  };
}

export function createEmptyLandingContent() {
  return mapLandingPublicResponse({
    stats: {
      users: 0,
      communities: 0,
      events: 0,
      events_upcoming: 0,
      events_total: 0,
      participants: 0,
      recent_joins_week: 0,
    },
    featured_events: [],
    featured_communities: [],
    hero: {
      spotlight_event: null,
      social_members: { total: 0, preview: [] },
    },
  });
}
