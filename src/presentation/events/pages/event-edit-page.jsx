import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { eventsApi } from '@/infrastructure/events/events-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { EventForm } from '../components/event-form';

export default function EventEditPage() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

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
    return () => { cancelled = true; };
  }, [id]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  async function handleUpdate(body) {
    await eventsApi.update(id, body);
    toast.success('Event berhasil diperbarui!', { duration: 4000 });
    navigate(`/events/${id}`, { replace: true });
  }

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />
      <main className='mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6 md:py-10'>
        <div className='text-center space-y-2'>
          <h1 className='font-display text-2xl font-bold text-foreground md:text-3xl'>
            Edit Event
          </h1>
          <p className='text-sm text-muted-foreground'>
            Perbarui detail event kamu
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-primary-container' />
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
      </main>
    </div>
  );
}
