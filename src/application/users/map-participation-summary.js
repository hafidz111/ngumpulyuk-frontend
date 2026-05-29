/**
 * @param {unknown} payload
 * @returns {{
 *   events: { id: string; title: string }[];
 *   eventsById: Record<string, Record<string, unknown>>;
 *   communities: { id: string; name: string }[];
 *   activeEventsCount: number;
 * }}
 */
export function mapParticipationSummary(payload) {
  const data = payload?.data ?? payload;
  const activeEventsRaw = Array.isArray(data?.active_events) ? data.active_events : [];
  const pastEventsRaw = Array.isArray(data?.past_events) ? data.past_events : [];
  const createdEventsRaw = Array.isArray(data?.events_created) ? data.events_created : [];
  const joinedCommunitiesRaw = Array.isArray(data?.joined_communities)
    ? data.joined_communities
    : [];

  const eventMap = new Map();
  const eventsById = {};

  for (const item of [...activeEventsRaw, ...pastEventsRaw, ...createdEventsRaw]) {
    const id = String(item?.id ?? '');
    if (!id) continue;
    eventsById[id] = item;
    if (!eventMap.has(id)) {
      eventMap.set(id, {
        id,
        title: String(item?.title ?? 'Event'),
      });
    }
  }

  const events = [...eventMap.values()];
  const communities = joinedCommunitiesRaw
    .map((item) => ({
      id: String(item?.id ?? ''),
      name: String(item?.title ?? item?.name ?? 'Community'),
    }))
    .filter((item) => item.id);

  return {
    events,
    eventsById,
    communities,
    activeEventsCount: Number(data?.active_events_count ?? activeEventsRaw.length) || 0,
  };
}
