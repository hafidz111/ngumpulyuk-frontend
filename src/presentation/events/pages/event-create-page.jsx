import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { eventsApi } from '@/infrastructure/events/events-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { EventForm } from '../components/event-form';

export default function EventCreatePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  async function handleCreate(body) {
    await eventsApi.create(body);
    toast.success('Event berhasil dibuat! 🎉', { duration: 4000 });
    navigate(ROUTES.events, { replace: true });
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6 md:py-10'>
        <div className='text-center space-y-2'>
          <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
            Buat Event Baru
          </h1>
          <p className='text-sm text-muted-foreground'>
            Isi detail event dan ajak teman-teman buat ikutan!
          </p>
        </div>

        <EventForm
          onSubmit={handleCreate}
          onCancel={() => navigate(-1)}
          submitLabel='Buat Event'
        />
      </main>
    </div>
  );
}
