import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { mapChatSendResponse } from '@/application/chat/map-chat-response';
import { chatApi } from '@/infrastructure/chat/chat-api';
import {
  clearChatThreadStorage,
  getOrCreateChatSessionId,
  loadChatThreadFromStorage,
  saveChatThreadToStorage,
} from '@/infrastructure/chat/chat-session-storage';

export const NGUMPSKY_MAX_MESSAGE = 4000;

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * @param {unknown} data
 */
function chatFailureMessageFromResponse(data) {
  if (!data || typeof data !== 'object') return 'Permintaan gagal';
  const d = /** @type {Record<string, unknown>} */ (data);
  if (typeof d.detail === 'string' && d.detail.trim()) return d.detail.trim();
  if (typeof d.message === 'string' && d.message.trim()) return d.message.trim();
  const inner = d.data;
  if (inner && typeof inner === 'object') {
    const i = /** @type {Record<string, unknown>} */ (inner);
    if (typeof i.message === 'string' && i.message.trim()) return i.message.trim();
  }
  return 'Permintaan gagal';
}

function chatErrorMessage(err) {
  const status = /** @type {{ response?: { status?: number } }} */ (err).response
    ?.status;
  if (status === 429) {
    return 'Terlalu sering, tunggu sebentar ya';
  }
  const data = /** @type {{ response?: { data?: Record<string, unknown> } }} */ (
    err
  ).response?.data;
  const detail = data?.detail ?? data?.message;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (err && typeof err === 'object' && 'message' in err) {
    const m = String(/** @type {{ message?: unknown }} */ (err).message ?? '');
    if (m) return m;
  }
  return 'Gagal mengirim. Coba lagi ya.';
}

/**
 * @param {unknown} err
 */
function resolveUserFacingChatError(err) {
  if (
    err &&
    typeof err === 'object' &&
    /** @type {{ response?: unknown }} */ (err).response
  ) {
    return chatErrorMessage(err);
  }
  if (err && typeof err === 'object' && typeof err.message === 'string') {
    return err.message;
  }
  return chatErrorMessage(err);
}

/**
 * @param {unknown} row
 */
function isRestorableMessage(row) {
  if (!row || typeof row !== 'object') return false;
  const m = /** @type {{ role?: unknown; id?: unknown; pending?: unknown; content?: unknown; error?: unknown }} */ (
    row
  );
  if (m.role !== 'user' && m.role !== 'assistant') return false;
  if (typeof m.id !== 'string') return false;
  if (m.pending) return false;
  if (m.role === 'user') {
    return typeof m.content === 'string' && m.content.length > 0;
  }
  return (
    (typeof m.content === 'string' && m.content.length > 0) ||
    (typeof m.error === 'string' && m.error.length > 0)
  );
}

/**
 * @param {boolean} enabled
 */
export function useNgumpskyChat(enabled) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [sessionId] = useState(() => getOrCreateChatSessionId());

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setHydrated(false);
      return;
    }
    const restored = loadChatThreadFromStorage().filter(isRestorableMessage);
    setMessages(/** @type {never} */ (restored));
    setHydrated(true);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    if (messages.some((m) => m.pending)) return;
    saveChatThreadToStorage(messages.filter(isRestorableMessage));
  }, [enabled, hydrated, messages]);

  const clearThread = useCallback(() => {
    clearChatThreadStorage();
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (overrideText) => {
      const raw =
        typeof overrideText === 'string' ? overrideText : input;
      const text = raw.trim();
      if (!enabled || !text) return;
      if (text.length > NGUMPSKY_MAX_MESSAGE) {
        toast.error(`Maksimal ${NGUMPSKY_MAX_MESSAGE} karakter.`);
        return;
      }
      if (loading) return;

      const now = Date.now();
      const userMsg = { id: newId(), role: 'user', content: text, createdAt: now };
      const assistantId = newId();
      const assistantPlaceholder = {
        id: assistantId,
        role: 'assistant',
        pending: true,
        content: '',
        createdAt: now,
      };

      if (typeof overrideText !== 'string') {
        setInput('');
      }
      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setLoading(true);

      try {
        const res = await chatApi.sendMessage({
          message: text,
          session_id: sessionId,
        });
        const mapped = mapChatSendResponse(res.data);
        if (!mapped) {
          throw new Error(chatFailureMessageFromResponse(res.data));
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  pending: false,
                  content: mapped.reply,
                  createdAt: Date.now(),
                  traceId: mapped.traceId,
                  intent: mapped.intent,
                  cards: mapped.cards,
                  llmUsed: mapped.llmUsed,
                  correctionApplied: mapped.correctionApplied,
                  answerSource: mapped.answerSource,
                  feedbackSent: false,
                }
              : m,
          ),
        );
      } catch (err) {
        const msg = resolveUserFacingChatError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  pending: false,
                  error: msg,
                  content: '',
                }
              : m,
          ),
        );
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [enabled, input, loading, sessionId],
  );

  const retryAssistant = useCallback(
    async (failedAssistantId) => {
      const idx = messages.findIndex((m) => m.id === failedAssistantId);
      if (idx < 1) return;
      const userMsg = messages[idx - 1];
      if (!userMsg || userMsg.role !== 'user' || !userMsg.content) return;
      const text = userMsg.content;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === failedAssistantId
            ? {
                ...m,
                pending: true,
                error: undefined,
                content: '',
                traceId: undefined,
                cards: undefined,
                feedbackSent: undefined,
              }
            : m,
        ),
      );
      setLoading(true);

      try {
        const res = await chatApi.sendMessage({
          message: text,
          session_id: sessionId,
        });
        const mapped = mapChatSendResponse(res.data);
        if (!mapped) {
          throw new Error(chatFailureMessageFromResponse(res.data));
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === failedAssistantId
              ? {
                  ...m,
                  pending: false,
                  content: mapped.reply,
                  createdAt: Date.now(),
                  traceId: mapped.traceId,
                  intent: mapped.intent,
                  cards: mapped.cards,
                  llmUsed: mapped.llmUsed,
                  correctionApplied: mapped.correctionApplied,
                  answerSource: mapped.answerSource,
                  feedbackSent: false,
                }
              : m,
          ),
        );
      } catch (err) {
        const msg = resolveUserFacingChatError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === failedAssistantId
              ? {
                  ...m,
                  pending: false,
                  error: msg,
                  content: '',
                }
              : m,
          ),
        );
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [messages, sessionId],
  );

  const sendFeedback = useCallback(
    async (messageId, helpful) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.traceId || msg.feedbackSent) return;
      try {
        await chatApi.sendFeedback({
          trace_id: msg.traceId,
          helpful,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, feedbackSent: true } : m,
          ),
        );
      } catch {
        toast.error('Gagal mengirim feedback');
      }
    },
    [messages],
  );

  return {
    messages,
    input,
    setInput,
    loading,
    sessionId,
    sendMessage,
    retryAssistant,
    sendFeedback,
    clearThread,
  };
}
