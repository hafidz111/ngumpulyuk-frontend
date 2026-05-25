import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { eventsApi } from '@/infrastructure/events/events-api';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { EventForm } from '../components/event-form';

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onOpenMenu } = useChatPageShell();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await eventsApi.getById(id);
        if (!cancelled) setEvent(res.data?.data ?? res.data);
      } catch {
        if (!cancelled) setError('Gagal memuat data event.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleUpdate(body) {
    await eventsApi.update(id, body);
    toast.success('Event berhasil diperbarui!', { duration: 4000 });
    navigate(`/events/${id}`, { replace: true });
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.editEventTitle}
        subtitle={SHELL_COPY.pages.editEventSubtitle}
        onOpenMenu={onOpenMenu}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-2xl'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='size-8 animate-spin text-[#FF8000]' />
            </div>
          ) : error ? (
            <p className='text-center text-sm text-destructive'>{error}</p>
          ) : event ? (
            <EventForm
              initialData={event}
              onSubmit={handleUpdate}
              onCancel={() => navigate(-1)}
              submitLabel='Simpan Perubahan'
              isEdit
            />
          ) : null}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
