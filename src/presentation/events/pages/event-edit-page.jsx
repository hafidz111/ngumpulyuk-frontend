import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FormPageSkeleton } from '@/presentation/components/skeletons';
import { toast } from 'sonner';

import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { eventsApi } from '@/infrastructure/events/events-api';
import { eventQueryKeys } from '../hooks/event-query-keys';
import { useEventDetailQuery } from '../hooks/use-event-detail-query';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { EventForm } from '../components/event-form';

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onOpenMenu } = useChatPageShell();

  const { data: event, isPending, isError } = useEventDetailQuery(id);
  const loading = isPending && !event;
  const error = isError ? 'Gagal memuat data event.' : '';

  async function handleUpdate(body) {
    await eventsApi.update(id, body);
    await queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(id) });
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
            <FormPageSkeleton />
          ) : error ? (
            <p className='text-center text-sm text-destructive'>{error}</p>
          ) : event ? (
            <EventForm
              initialData={event}
              onSubmit={handleUpdate}
              onCancel={() => navigate(-1)}
              submitLabel='Simpan Perubahan'
            />
          ) : null}
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
