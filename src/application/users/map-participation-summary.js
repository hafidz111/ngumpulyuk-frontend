/**
 * @param {unknown} payload
 * @returns {{ events: { id: string; title: string }[]; communities: { id: string; name: string }[]; activeEventsCount: number }}
 */
export function mapParticipationSummary(payload) {
  const data = payload?.data ?? payload;
  const activeEventsRaw = Array.isArray(data?.active_events) ? data.active_events : [];
  const createdEventsRaw = Array.isArray(data?.events_created) ? data.events_created : [];
  const joinedCommunitiesRaw = Array.isArray(data?.joined_communities)
    ? data.joined_communities
    : [];

  const eventMap = new Map();

  for (const item of [...activeEventsRaw, ...createdEventsRaw]) {
    const id = String(item?.id ?? '');
    if (!id) continue;
    eventMap.set(id, {
      id,
      title: String(item?.title ?? 'Event'),
    });
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
    communities,
    activeEventsCount: Number(data?.active_events_count ?? activeEventsRaw.length) || 0,
  };
}
