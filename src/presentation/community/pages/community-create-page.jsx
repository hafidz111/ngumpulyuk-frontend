import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { ChatFirstPageBody } from '@/presentation/layout/chat-first-page-body';
import { ChatFirstPageHeader } from '@/presentation/layout/chat-first-page-header';
import { useChatPageShell } from '@/presentation/layout/use-chat-page-shell';
import { CommunityForm } from '../components/community-form';

export default function CommunityCreatePage() {
  const navigate = useNavigate();
  const { onOpenMenu } = useChatPageShell();

  async function handleCreate(body) {
    await communitiesApi.create(body);
    toast.success('Komunitas berhasil dibuat!', { duration: 4000 });
    navigate(ROUTES.community, { replace: true });
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatFirstPageHeader
        title={SHELL_COPY.pages.createCommunityTitle}
        subtitle={SHELL_COPY.pages.createCommunitySubtitle}
        onOpenMenu={onOpenMenu}
      />
      <ChatFirstPageBody>
        <div className='mx-auto max-w-2xl'>
          <CommunityForm
            onSubmit={handleCreate}
            onCancel={() => navigate(-1)}
            submitLabel='Buat Community'
          />
        </div>
      </ChatFirstPageBody>
    </div>
  );
}
