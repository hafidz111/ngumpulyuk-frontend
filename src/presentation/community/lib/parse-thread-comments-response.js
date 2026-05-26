/**
 * @param {unknown} apiResponse axios response `.data`
 * @returns {Record<string, unknown>[]}
 */
export function parseThreadCommentsResponse(apiResponse) {
  const root = apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse
    ? apiResponse.data
    : apiResponse;

  if (!root || typeof root !== 'object') return [];

  const payload = /** @type {Record<string, unknown>} */ (root);
  const nested = payload.data && typeof payload.data === 'object'
    ? /** @type {Record<string, unknown>} */ (payload.data)
    : null;

  if (Array.isArray(payload.comments)) return payload.comments;
  if (nested && Array.isArray(nested.comments)) return nested.comments;
  if (Array.isArray(payload.results)) return payload.results;
  if (nested && Array.isArray(nested.results)) return nested.results;
  if (Array.isArray(payload)) return payload;
  if (nested && Array.isArray(nested)) return nested;

  return [];
}
