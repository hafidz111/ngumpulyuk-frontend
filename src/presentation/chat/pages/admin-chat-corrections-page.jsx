import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { chatApi } from '@/infrastructure/chat/chat-api';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
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

export default function AdminChatCorrectionsPage() {
  const { isAuthenticated, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [intentFilter, setIntentFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [faqOptions, setFaqOptions] = useState([]);
  const [loadingFaqOptions, setLoadingFaqOptions] = useState(false);
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState({
    normalized_query: '',
    corrected_reply: '',
    use_faq_id: '',
    intent: 'faq',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = { limit: LIMIT, offset };
        if (intentFilter !== 'all') params.intent = intentFilter;
        if (activeFilter === 'true') params.active = true;
        if (activeFilter === 'false') params.active = false;
        const res = await chatApi.adminCorrections(params);
        if (!active) return;
        const root = rootData(res.data);
        const items = Array.isArray(root.items) ? root.items : [];
        const page = root.pagination ?? {};
        setRows(items);
        setHasMore(Boolean(page.has_more));
      } catch (err) {
        if (active) {
          setRows([]);
          setHasMore(false);
          toast.error(err?.response?.data?.detail || 'Gagal memuat correction rules.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [activeFilter, intentFilter, offset]);

  useEffect(() => {
    let active = true;
    async function loadTemplates() {
      setLoadingFaqOptions(true);
      try {
        const res = await chatApi.adminTemplates();
        if (!active) return;
        const root = rootData(res.data);
        const listRaw = Array.isArray(root.items)
          ? root.items
          : Array.isArray(root.templates)
            ? root.templates
            : Array.isArray(root)
              ? root
              : [];
        const mapped = listRaw
          .map((item) => ({
            id: String(item?.id ?? '').trim(),
            title: String(item?.title ?? '').trim(),
            answer: String(item?.answer ?? '').trim(),
            keywords: Array.isArray(item?.keywords) ? item.keywords : [],
            aliases: Array.isArray(item?.aliases) ? item.aliases : [],
          }))
          .filter((item) => item.id);
        setFaqOptions(mapped);
      } catch {
        if (active) {
          setFaqOptions([]);
          toast.error('Gagal memuat template FAQ.');
        }
      } finally {
        if (active) setLoadingFaqOptions(false);
      }
    }
    void loadTemplates();
    return () => {
      active = false;
    };
  }, []);

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  if (!user?.isStaff) return <Navigate to={ROUTES.profile} replace />;

  async function submitForm() {
    if (!form.normalized_query.trim()) {
      toast.error('Normalized query wajib diisi.');
      return;
    }
    const usingFaq = mode === 'faq';
    if (usingFaq && !form.use_faq_id) {
      toast.error('Pilih FAQ id dulu.');
      return;
    }
    if (!usingFaq && !form.corrected_reply.trim()) {
      toast.error('Jawaban manual wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        normalized_query: form.normalized_query.trim(),
        intent: form.intent || 'faq',
        is_active: Boolean(form.is_active),
        notes: form.notes.trim(),
      };
      if (usingFaq) body.use_faq_id = form.use_faq_id;
      else body.corrected_reply = form.corrected_reply.trim();
      await chatApi.createCorrection(body);
      toast.success('Rule koreksi berhasil dibuat.');
      setForm({
        normalized_query: '',
        corrected_reply: '',
        use_faq_id: '',
        intent: 'faq',
        is_active: true,
        notes: '',
      });
      setOffset(0);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        'Gagal membuat rule.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(rule) {
    try {
      await chatApi.patchCorrection(rule.id, { is_active: !rule.is_active });
      setRows((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r)),
      );
      toast.success('Status rule diperbarui.');
    } catch {
      toast.error('Gagal update status rule.');
    }
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6'>
        <div className='flex items-center justify-between gap-3'>
          <h1 className='font-display text-2xl font-black'>Admin · Chat Corrections</h1>
          <Button asChild variant='outline' className='rounded-full'>
            <Link to={ROUTES.adminChatMonitoring}>Kembali ke Monitoring</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Buat Rule Koreksi</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Input
              value={form.normalized_query}
              onChange={(e) => setForm((p) => ({ ...p, normalized_query: e.target.value }))}
              placeholder='normalized_query (contoh: web apa ini)'
            />
            <div className='grid gap-2 md:grid-cols-3'>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='manual'>Mode Manual</SelectItem>
                  <SelectItem value='faq'>Mode Reuse FAQ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.intent} onValueChange={(v) => setForm((p) => ({ ...p, intent: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='faq'>faq</SelectItem>
                  <SelectItem value='general'>general</SelectItem>
                  <SelectItem value='event_reco'>event_reco</SelectItem>
                  <SelectItem value='community_reco'>community_reco</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.is_active ? 'true' : 'false'}
                onValueChange={(v) => setForm((p) => ({ ...p, is_active: v === 'true' }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Aktif</SelectItem>
                  <SelectItem value='false'>Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'manual' ? (
              <Textarea
                value={form.corrected_reply}
                onChange={(e) => setForm((p) => ({ ...p, corrected_reply: e.target.value }))}
                className='min-h-[110px]'
                placeholder='Isi jawaban manual...'
              />
            ) : (
              <div className='space-y-1'>
                <Label>Pilih FAQ ID</Label>
                <Select value={form.use_faq_id} onValueChange={(v) => setForm((p) => ({ ...p, use_faq_id: v }))}>
                  <SelectTrigger><SelectValue placeholder='Pilih FAQ...' /></SelectTrigger>
                  <SelectContent>
                    {loadingFaqOptions ? (
                      <SelectItem value='loading' disabled>Memuat template...</SelectItem>
                    ) : null}
                    {!loadingFaqOptions && faqOptions.length === 0 ? (
                      <SelectItem value='no-data' disabled>Template kosong</SelectItem>
                    ) : null}
                    {faqOptions.map((faq) => (
                      <SelectItem key={faq.id} value={faq.id}>
                        {faq.id} {faq.title ? `- ${faq.title}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.use_faq_id ? (
                  <p className='text-xs text-muted-foreground'>
                    {faqOptions.find((f) => f.id === form.use_faq_id)?.answer || ''}
                  </p>
                ) : null}
              </div>
            )}

            <Input
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder='Catatan opsional'
            />
            <Button
              type='button'
              className='rounded-full'
              disabled={submitting}
              onClick={() => void submitForm()}
            >
              {submitting ? <Loader2 className='size-4 animate-spin' /> : 'Simpan Rule'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Daftar Rules</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid gap-2 md:grid-cols-2'>
              <Select value={intentFilter} onValueChange={(v) => { setIntentFilter(v); setOffset(0); }}>
                <SelectTrigger><SelectValue placeholder='Filter intent' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua intent</SelectItem>
                  <SelectItem value='faq'>faq</SelectItem>
                  <SelectItem value='general'>general</SelectItem>
                  <SelectItem value='event_reco'>event_reco</SelectItem>
                  <SelectItem value='community_reco'>community_reco</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setOffset(0); }}>
                <SelectTrigger><SelectValue placeholder='Filter active' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua status</SelectItem>
                  <SelectItem value='true'>Aktif</SelectItem>
                  <SelectItem value='false'>Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='size-6 animate-spin text-muted-foreground' />
              </div>
            ) : null}

            {!loading && rows.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Belum ada rules.</p>
            ) : null}

            {rows.map((rule) => (
              <div key={rule.id} className='space-y-2 rounded-2xl border border-border/70 bg-white p-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant={rule.is_active ? 'default' : 'muted'}>
                    {rule.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <Badge variant='muted'>{rule.intent || '-'}</Badge>
                  <Badge variant='muted'>
                    {rule.source_type === 'faq'
                      ? `FAQ: ${rule.source_ref || '-'}`
                      : 'Manual'}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    Usage: {rule.usage_count ?? 0}
                  </span>
                </div>
                <p className='text-sm'><span className='font-semibold'>Query:</span> {rule.normalized_query}</p>
                <p className='text-sm'><span className='font-semibold'>Reply:</span> {rule.corrected_reply || '-'}</p>
                {rule.notes ? (
                  <p className='text-xs text-muted-foreground'>Notes: {rule.notes}</p>
                ) : null}
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='rounded-full'
                  onClick={() => void toggleActive(rule)}
                >
                  {rule.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            ))}

            <div className='flex items-center justify-between pt-2'>
              <Button
                variant='outline'
                className='rounded-full'
                disabled={offset === 0 || loading}
                onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
              >
                Sebelumnya
              </Button>
              <Button
                variant='outline'
                className='rounded-full'
                disabled={!hasMore || loading}
                onClick={() => setOffset((o) => o + LIMIT)}
              >
                Berikutnya
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
