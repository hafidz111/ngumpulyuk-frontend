import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WandSparkles } from 'lucide-react';
import { toast } from 'sonner';

import { chatApi } from '@/infrastructure/chat/chat-api';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { Button } from '@/presentation/components/ui/button';
import { OffsetPagination } from '@/presentation/components/offset-pagination';
import {
  AdminLogListSkeleton,
  ButtonBusySkeleton,
} from '@/presentation/components/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { Textarea } from '@/presentation/components/ui/textarea';

const LIMIT = 20;

function rootData(raw) {
  if (raw?.data && typeof raw.data === 'object') return raw.data;
  return raw ?? {};
}

function formatDateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export default function AdminChatMonitoringPage() {
  const { user } = useAuth();
  const { onOpenMenu } = useChatPageShell();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [intent, setIntent] = useState('all');
  const [helpful, setHelpful] = useState('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [offset, setOffset] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [form, setForm] = useState({
    normalized_query: '',
    corrected_reply: '',
    intent: 'faq',
    notes: '',
  });

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchDebounced(search.trim());
      setOffset(0);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = { limit: LIMIT, offset };
        if (intent !== 'all') params.intent = intent;
        if (helpful === 'true') params.helpful = true;
        if (helpful === 'false') params.helpful = false;
        if (searchDebounced) params.search = searchDebounced;
        const res = await chatApi.adminLogs(params);
        if (!active) return;
        const root = rootData(res.data);
        const items = Array.isArray(root.items) ? root.items : [];
        const page = root.pagination ?? {};
        setRows(items);
        setPagination({
          total: Number(page.total ?? items.length) || items.length,
          hasMore: Boolean(page.has_more),
        });
      } catch (err) {
        if (active) {
          setRows([]);
          setPagination({ total: 0, hasMore: false });
          toast.error(err?.response?.data?.detail || 'Gagal memuat chat logs.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [helpful, intent, offset, reloadTick, searchDebounced]);

  function buildLogParams() {
    const params = {};
    if (intent !== 'all') params.intent = intent;
    if (helpful === 'true') params.helpful = true;
    if (helpful === 'false') params.helpful = false;
    if (searchDebounced) params.search = searchDebounced;
    return params;
  }

  function isEmptyLog(row) {
    const userMessage = String(row?.user_message_redacted ?? '').trim();
    const assistantReply = String(row?.assistant_reply ?? '').trim();
    return !userMessage && !assistantReply;
  }

  async function deleteLogs(mode) {
    setDeleting(true);
    try {
      let res;
      if (mode === 'all') {
        res = await chatApi.deleteAdminLogs({ delete_all: true });
      } else if (mode === 'selected') {
        const ids = selectedIds.filter(Boolean);
        if (ids.length === 0) {
          toast.error('Pilih log dulu.');
          return;
        }
        res = await chatApi.deleteAdminLogs({ ids });
      } else if (mode === 'empty') {
        const ids = rows
          .filter((r) => isEmptyLog(r))
          .map((r) => String(r.trace_id || '').trim())
          .filter(Boolean);
        if (ids.length === 0) {
          toast.message('Tidak ada chat kosong untuk dihapus.');
          return;
        }
        res = await chatApi.deleteAdminLogs({ ids });
      } else {
        res = await chatApi.deleteAdminLogs(undefined, buildLogParams());
      }
      const root = rootData(res?.data);
      const deletedCount = Number(root?.deleted_count ?? 0) || 0;
      toast.success(`Berhasil hapus ${deletedCount} log.`);
      setSelectedIds([]);
      setOffset(0);
      setReloadTick((n) => n + 1);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Gagal menghapus log.');
    } finally {
      setDeleting(false);
    }
  }

  const titleInfo = useMemo(
    () =>
      pagination.total > 0
        ? `${Math.min(offset + 1, pagination.total)}-${Math.min(offset + rows.length, pagination.total)} dari ${pagination.total}`
        : '0 data',
    [offset, pagination.total, rows.length],
  );

  async function submitCorrection() {
    if (!form.normalized_query.trim() || !form.corrected_reply.trim()) {
      toast.error('Isi query dan jawaban koreksi dulu.');
      return;
    }
    setCreating(true);
    try {
      await chatApi.createCorrection({
        normalized_query: form.normalized_query.trim(),
        corrected_reply: form.corrected_reply.trim(),
        intent: form.intent || 'faq',
        is_active: true,
        notes: form.notes.trim(),
      });
      toast.success('Koreksi berhasil dibuat.');
      setPrefill(null);
      setForm({ normalized_query: '', corrected_reply: '', intent: 'faq', notes: '' });
      setReloadTick((n) => n + 1);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Gagal membuat koreksi.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title='Admin · Chat Monitoring'
        subtitle='Pantau log percakapan AI'
        onOpenMenu={onOpenMenu}
        showCreateEvent={false}
      />
      <ChatFirstPageBody>
        <div className='space-y-4'>
        {!user?.isStaff ? (
          <Card>
            <CardHeader>
              <CardTitle>Akses ditolak</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant='outline' className='rounded-full'>
                <Link to={ROUTES.profile}>Kembali</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
        <div className='flex flex-wrap items-center justify-end gap-2'>
            <Button asChild variant='outline' className='rounded-full'>
              <Link to={ROUTES.adminChatCorrections}>Lihat Rules Koreksi</Link>
            </Button>
            <Button
              type='button'
              variant='outline'
              className='rounded-full'
              disabled={deleting || loading}
              onClick={() => void deleteLogs('empty')}
            >
              Hapus Chat Kosong
            </Button>
            <Button
              type='button'
              variant='outline'
              className='rounded-full'
              disabled={deleting || loading}
              onClick={() => void deleteLogs('filtered')}
            >
              Hapus by Filter
            </Button>
            <Button
              type='button'
              variant='outline'
              className='rounded-full'
              disabled={deleting || loading}
              onClick={() => void deleteLogs('selected')}
            >
              Hapus Dipilih
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='rounded-full'
              disabled={deleting || loading}
              onClick={() => void deleteLogs('all')}
            >
              Hapus Semua
            </Button>
          </div>

        <Card>
          <CardContent className='grid gap-3 p-4 md:grid-cols-4'>
            <div className='space-y-1'>
              <Label>Intent</Label>
              <Select value={intent} onValueChange={(v) => { setIntent(v); setOffset(0); }}>
                <SelectTrigger><SelectValue placeholder='Semua intent' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua</SelectItem>
                  <SelectItem value='faq'>faq</SelectItem>
                  <SelectItem value='event_reco'>event_reco</SelectItem>
                  <SelectItem value='community_reco'>community_reco</SelectItem>
                  <SelectItem value='general'>general</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1'>
              <Label>Helpful</Label>
              <Select value={helpful} onValueChange={(v) => { setHelpful(v); setOffset(0); }}>
                <SelectTrigger><SelectValue placeholder='Semua' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua</SelectItem>
                  <SelectItem value='true'>Helpful</SelectItem>
                  <SelectItem value='false'>Tidak Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1 md:col-span-2'>
              <Label>Pencarian</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari user / pesan...'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Chat Logs ({titleInfo})</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {loading ? <AdminLogListSkeleton count={4} /> : null}
            {!loading && rows.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Belum ada data chat log.</p>
            ) : null}
            {rows.map((row) => (
              <div key={row.trace_id} className='space-y-2 rounded-2xl border border-border/70 bg-white p-3'>
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                  <label className='inline-flex items-center gap-1.5'>
                    <input
                      type='checkbox'
                      className='size-4 accent-primary'
                      checked={selectedIds.includes(row.trace_id)}
                      onChange={(e) => {
                        const id = row.trace_id;
                        if (!id) return;
                        setSelectedIds((prev) =>
                          e.target.checked
                            ? [...new Set([...prev, id])]
                            : prev.filter((x) => x !== id),
                        );
                      }}
                    />
                    Pilih
                  </label>
                  <span>•</span>
                  <span>{formatDateTime(row.created_at)}</span>
                  <span>•</span>
                  <span>@{row?.user?.username || '-'}</span>
                  <span>•</span>
                  <span>intent: {row.intent || '-'}</span>
                  <span>•</span>
                  <span>helpful: {String(row.helpful)}</span>
                  <span>•</span>
                  <span>llm: {String(row.llm_used)}</span>
                  <span>•</span>
                  <span>koreksi: {String(row.correction_applied)}</span>
                </div>
                <p className='text-sm'><span className='font-semibold'>User:</span> {row.user_message_redacted || '-'}</p>
                <p className='text-sm'><span className='font-semibold'>Assistant:</span> {row.assistant_reply || '-'}</p>
                {isEmptyLog(row) ? (
                  <p className='text-xs font-medium text-amber-700'>Data kosong (user+assistant null)</p>
                ) : null}
                <div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='rounded-full'
                    onClick={() => {
                      setPrefill(row.trace_id);
                      setForm({
                        normalized_query: row.user_message_redacted || '',
                        corrected_reply: row.assistant_reply || '',
                        intent: row.intent || 'faq',
                        notes: '',
                      });
                    }}
                  >
                    <WandSparkles className='size-4' />
                    Buat Koreksi
                  </Button>
                </div>
                {prefill === row.trace_id ? (
                  <div className='grid gap-2 rounded-xl border border-border/60 bg-surface p-3'>
                    <Input
                      value={form.normalized_query}
                      onChange={(e) => setForm((p) => ({ ...p, normalized_query: e.target.value }))}
                      placeholder='normalized_query'
                    />
                    <Textarea
                      value={form.corrected_reply}
                      onChange={(e) => setForm((p) => ({ ...p, corrected_reply: e.target.value }))}
                      placeholder='Jawaban terkoreksi'
                      className='min-h-[90px]'
                    />
                    <div className='grid gap-2 md:grid-cols-2'>
                      <Select value={form.intent} onValueChange={(v) => setForm((p) => ({ ...p, intent: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='faq'>faq</SelectItem>
                          <SelectItem value='general'>general</SelectItem>
                          <SelectItem value='event_reco'>event_reco</SelectItem>
                          <SelectItem value='community_reco'>community_reco</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder='Catatan (opsional)'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <Button size='sm' className='rounded-full' disabled={creating} onClick={() => void submitCorrection()}>
                        {creating ? <ButtonBusySkeleton /> : 'Simpan Koreksi'}
                      </Button>
                      <Button size='sm' variant='ghost' onClick={() => setPrefill(null)}>Batal</Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            <OffsetPagination
              total={pagination.total}
              limit={LIMIT}
              offset={offset}
              onOffsetChange={setOffset}
              loading={loading}
              anchorId='admin-chat-monitoring'
              className='pt-2'
            />
          </CardContent>
        </Card>
          </>
        )}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
