import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { eventsApi } from '@/infrastructure/events/events-api';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { EventForm } from '../components/event-form';

export default function EventCreatePage() {
  const navigate = useNavigate();
  const { onOpenMenu } = useChatPageShell();

  async function handleCreate(body) {
    await eventsApi.create(body);
    toast.success('Event berhasil dibuat! 🎉', { duration: 4000 });
    navigate(ROUTES.events, { replace: true });
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.createEventTitle}
        subtitle={SHELL_COPY.pages.createEventSubtitle}
        onOpenMenu={onOpenMenu}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-2xl'>
        <EventForm
          onSubmit={handleCreate}
          onCancel={() => navigate(-1)}
          submitLabel='Buat Event'
        />
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
