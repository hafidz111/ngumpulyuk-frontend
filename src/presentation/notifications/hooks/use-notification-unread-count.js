import { useCallback, useEffect, useRef, useState } from 'react';

import { mapNotificationsListResponse } from '@/application/notifications/map-notifications-response';
import { notificationsApi } from '@/infrastructure/notifications/notifications-api';

const POLL_MS = 60_000;

/**
 * Lightweight unread badge for header: GET list with minimal limit to read `unread_count`.
 */
export function useNotificationUnreadCount(enabled) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await notificationsApi.list({ limit: 1, offset: 0 });
      const { unreadCount: n } = mapNotificationsListResponse(res.data);
      if (mounted.current) setUnreadCount(n);
    } catch {
      if (mounted.current) setUnreadCount(0);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return undefined;
    }
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  return { unreadCount, loading, refresh };
}
