/**
 * @param {unknown} raw Axios response.data
 * @returns {{
 *   traceId: string;
 *   reply: string;
 *   intent: string;
 *   cards: unknown[];
 *   sources: unknown[];
 *   llmUsed: boolean;
 *   correctionApplied: boolean;
 *   answerSource: { type: string; ref: string } | null;
 * } | null}
 */
export function mapChatSendResponse(raw) {
  const envelope = raw && typeof raw === 'object' ? raw : {};
  if ('success' in envelope && envelope.success === false) {
    return null;
  }
  const root =
    envelope.data && typeof envelope.data === 'object'
      ? envelope.data
      : envelope;

  if (!root || typeof root !== 'object') return null;

  const traceId = String(root.trace_id ?? '').trim();
  const reply = String(root.reply ?? '').trim();
  const intent = String(root.intent ?? 'general').trim() || 'general';
  const cards = Array.isArray(root.cards) ? root.cards : [];
  const sources = Array.isArray(root.sources) ? root.sources : [];
  const llmUsed = Boolean(root.llm_used);
  const correctionApplied = Boolean(root.correction_applied);
  const answerSourceRaw =
    root.answer_source && typeof root.answer_source === 'object'
      ? root.answer_source
      : null;
  const answerSource = answerSourceRaw
    ? {
        type: String(answerSourceRaw.type ?? '').trim(),
        ref: String(answerSourceRaw.ref ?? '').trim(),
      }
    : null;

  return {
    traceId,
    reply,
    intent,
    cards,
    sources,
    llmUsed,
    correctionApplied,
    answerSource,
  };
}

/**
 * @param {unknown} item
 * @returns {{ type: string; payload: Record<string, unknown> } | null}
 */
export function normalizeChatCard(item) {
  if (!item || typeof item !== 'object') return null;
  const type = String(
    /** @type {{ type?: unknown }} */ (item).type ?? '',
  )
    .toLowerCase()
    .trim();
  if (!type) return null;

  const raw = /** @type {{ payload?: unknown }} */ (item);
  const payload =
    raw.payload && typeof raw.payload === 'object'
      ? /** @type {Record<string, unknown>} */ (raw.payload)
      : /** @type {Record<string, unknown>} */ (item);

  return { type, payload };
}
