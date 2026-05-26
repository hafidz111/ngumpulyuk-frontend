/**
 * @param {unknown} payload API response (axios .data)
 * @returns {{ id: string; label: string }[]}
 */
export function parseCategoriesResponse(payload) {
  const root = payload?.data ?? payload;
  const raw = root?.categories ?? root?.results ?? root;
  if (!Array.isArray(raw)) return [];

  const seen = new Map();
  raw.forEach((item) => {
    const label =
      typeof item === 'string'
        ? item.trim()
        : String(item?.label ?? item?.name ?? item?.id ?? '').trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (!seen.has(key)) seen.set(key, label);
  });

  return Array.from(seen.values())
    .sort((a, b) => a.localeCompare(b, 'id'))
    .map((label) => ({ id: label, label }));
}
