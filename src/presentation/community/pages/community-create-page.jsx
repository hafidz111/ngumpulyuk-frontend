import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { CommunityForm } from '../components/community-form';

export default function CommunityCreatePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  async function handleCreate(body) {
    await communitiesApi.create(body);
    toast.success('Komunitas berhasil dibuat!', { duration: 4000 });
    navigate(ROUTES.community, { replace: true });
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6 md:py-10'>
        <div className='text-center space-y-2'>
          <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
            Buat Community Baru
          </h1>
          <p className='text-sm text-muted-foreground'>
            Buat komunitas dan ajak teman-teman untuk bergabung!
          </p>
        </div>

        <CommunityForm
          onSubmit={handleCreate}
          onCancel={() => navigate(-1)}
          submitLabel='Buat Community'
        />
      </main>
    </div>
  );
}
