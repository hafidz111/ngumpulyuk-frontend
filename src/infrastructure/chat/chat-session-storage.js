const SESSION_KEY = 'ngumpsky_session_id';
const THREAD_KEY = 'ngumpsky_thread_v1';

function safeRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateChatSessionId() {
  if (typeof window === 'undefined') return safeRandomId();
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id || id.length > 64) {
      id = safeRandomId();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id.slice(0, 64);
  } catch {
    return safeRandomId();
  }
}

/**
 * @returns {unknown[]}
 */
export function loadChatThreadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {unknown[]} messages
 */
export function saveChatThreadToStorage(messages) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THREAD_KEY, JSON.stringify(messages));
  } catch {
    /* quota / private mode */
  }
}

export function clearChatThreadStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(THREAD_KEY);
  } catch {
    /* ignore */
  }
}

export function clearChatSessionStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAllChatStorage() {
  clearChatThreadStorage();
  clearChatSessionStorage();
}
