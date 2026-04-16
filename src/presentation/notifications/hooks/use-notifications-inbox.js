import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  mapNotificationRow,
  mapNotificationsListResponse,
} from '@/application/notifications/map-notifications-response';
import { notificationsApi } from '@/infrastructure/notifications/notifications-api';

const PAGE_LIMIT = 20;
const POLL_MS = 45_000;

const TYPE_OPTIONS = [
  { value: '', label: 'Semua tipe' },
  { value: 'event_reminder', label: 'Pengingat event' },
  { value: 'new_event', label: 'Event baru' },
  { value: 'event_update', label: 'Update event' },
  { value: 'community_post', label: 'Posting komunitas' },
  { value: 'comment_reply', label: 'Balasan komentar' },
  { value: 'new_member', label: 'Anggota baru' },
  { value: 'event_full', label: 'Event penuh' },
];

/**
 * @param {boolean} enabled
 */
export function useNotificationsInbox(enabled) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterReadState] = useState('all');
  const [filterType, setFilterTypeState] = useState('');

  const params = useMemo(() => {
    const p = {
      limit: PAGE_LIMIT,
      offset,
    };
    if (filterRead === 'unread') p.is_read = false;
    if (filterRead === 'read') p.is_read = true;
    if (filterType) p.type = filterType;
    return p;
  }, [offset, filterRead, filterType]);

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setUnreadCount(0);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await notificationsApi.list(params);
      const mapped = mapNotificationsListResponse(res.data);
      const rows = mapped.items
        .map((row) => mapNotificationRow(row))
        .filter(Boolean);
      setItems(rows);
      setUnreadCount(mapped.unreadCount);
      const meta = mapped.meta || {};
      const totalRaw =
        meta.total ?? meta.count ?? meta.total_count ?? rows.length;
      setTotal(
        typeof totalRaw === 'number' ? totalRaw : Number(totalRaw) || rows.length,
      );
    } catch {
      setItems([]);
      setUnreadCount(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [enabled, params]);

  const setFilterRead = useCallback((v) => {
    setOffset(0);
    setFilterReadState(v);
  }, []);

  const setFilterType = useCallback((v) => {
    setOffset(0);
    setFilterTypeState(v);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  const markOneRead = useCallback(
    async (id) => {
      try {
        await notificationsApi.markRead(id);
        let decrement = false;
        setItems((prev) => {
          const t = prev.find((n) => n.id === id);
          decrement = Boolean(t && !t.isRead);
          return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        });
        if (decrement) setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        void load();
      }
    },
    [load],
  );

  const markAllRead = useCallback(async () => {
    await notificationsApi.readAll();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const hasMore = offset + PAGE_LIMIT < total;
  const hasPrev = offset > 0;

  return {
    items,
    unreadCount,
    total,
    loading,
    filterRead,
    setFilterRead,
    filterType,
    setFilterType,
    typeOptions: TYPE_OPTIONS,
    pageLimit: PAGE_LIMIT,
    offset,
    setOffset,
    hasMore,
    hasPrev,
    load,
    markOneRead,
    markAllRead,
  };
}
