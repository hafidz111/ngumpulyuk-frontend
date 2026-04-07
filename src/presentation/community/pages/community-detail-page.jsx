import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
  LogOut,
  Settings,
  Shield,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/config/routes';
import { communitiesApi } from '@/infrastructure/communities/communities-api';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import { ThreadCard } from '../components/thread-card';
import { ThreadComposer } from '../components/thread-composer';
import { MemberSection } from '../components/member-section';
import { ManageAdminsModal } from '../components/manage-admins-modal';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);

  const isAdmin = admins.some((a) => {
    const u = a.user ?? a;
    return u.id === user?.id;
  });

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communitiesApi.getById(id);
      const data = res.data?.data ?? res.data;
      setCommunity(data);
      setIsJoined(data.is_joined ?? data.is_member ?? false);
      setMemberCount(data.member_count ?? data.members_count ?? 0);
    } catch {
      setError('Komunitas tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await communitiesApi.members(id, { limit: 50 });
      const data = res.data;
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data?.results) items = data.results;
      else if (data?.data) {
        const inner = data.data;
        items = Array.isArray(inner) ? inner : (inner?.results || []);
      }
      setMembers(items);
      const adminList = items.filter(
        (m) => m.role === 'admin' || m.role === 'owner' || m.role === 'moderator',
      );
      setAdmins(adminList);
    } catch {
      // silently ignore
    }
  }, [id]);

  const fetchThreads = useCallback(async () => {
    setThreadsLoading(true);
    try {
      const res = await communitiesApi.threads(id, { limit: 20, sort: 'latest' });
      const data = res.data;
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data?.results) items = data.results;
      else if (data?.data) {
        const inner = data.data;
        items = Array.isArray(inner) ? inner : (inner?.results || []);
      }
      setThreads(items);
    } catch {
      // silently ignore
    } finally {
      setThreadsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCommunity();
    fetchMembers();
    fetchThreads();
  }, [fetchCommunity, fetchMembers, fetchThreads]);

  async function handleJoin() {
    setJoining(true);
    try {
      await communitiesApi.join(id);
      setIsJoined(true);
      setMemberCount((c) => c + 1);
      toast.success('Berhasil bergabung!');
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal bergabung.');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    setJoining(true);
    try {
      await communitiesApi.leave(id);
      setIsJoined(false);
      setMemberCount((c) => Math.max(0, c - 1));
      toast.success('Berhasil keluar dari komunitas.');
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Gagal keluar.');
    } finally {
      setJoining(false);
    }
  }

  async function handlePostThread(body) {
    await communitiesApi.createThread(id, body);
    toast.success('Thread berhasil dipost!');
    fetchThreads();
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (loading) {
    return (
      <div className='min-h-svh bg-surface text-foreground'>
        <HomeAppHeader />
        <div className='flex items-center justify-center py-32'>
          <Loader2 className='size-8 animate-spin text-primary-container' />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className='min-h-svh bg-surface text-foreground'>
        <HomeAppHeader />
        <div className='flex flex-col items-center justify-center gap-4 py-32 text-center'>
          <Zap className='size-10 text-muted-foreground/40' />
          <p className='text-muted-foreground'>{error || 'Komunitas tidak ditemukan'}</p>
          <Button
            variant='outline'
            onClick={() => navigate(ROUTES.community)}
            className='rounded-full'
          >
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const createdDate = community.created_at
    ? new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(
      new Date(community.created_at),
    )
    : null;

  const adminNames = admins
    .map((a) => {
      const u = a.user ?? a;
      return u.full_name || u.username;
    })
    .join(', ');

  return (
    <div className='min-h-svh bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8'>
        {/* Back button */}
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='size-4' />
          Kembali
        </button>

        {/* Hero Banner */}
        <div className='relative overflow-hidden rounded-2xl'>
          <div className='aspect-[16/7] w-full bg-gradient-to-br from-primary-container/20 to-secondary/20'>
            {community.cover_image ? (
              <img
                src={community.cover_image}
                alt=''
                className='h-full w-full object-cover'
              />
            ) : null}
          </div>
          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-5 pt-16'>
            <div className='flex items-end justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-white md:text-3xl'>
                  {community.name}
                </h1>
                <div className='mt-1 flex items-center gap-3 text-sm text-white/80'>
                  <span className='inline-flex items-center gap-1'>
                    <Users className='size-3.5' aria-hidden />
                    {memberCount} members
                  </span>
                  {createdDate ? (
                    <>
                      <span className='text-white/40'>&#8226;</span>
                      <span>Dibuat {createdDate}</span>
                    </>
                  ) : null}
                </div>
              </div>
              {isAdmin ? (
                <Button
                  type='button'
                  onClick={() => setManageOpen(true)}
                  className='rounded-full bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/30'
                >
                  <Settings className='size-4' />
                  Admin Panel
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <Card className='mt-4 border border-border/80 bg-card p-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              {community.description ? (
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {community.description}
                </p>
              ) : null}
              <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                {community.total_events != null ? (
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='size-3.5' aria-hidden />
                    {community.total_events} total events
                  </span>
                ) : null}
                {adminNames ? (
                  <span className='inline-flex items-center gap-1'>
                    <Shield className='size-3.5' aria-hidden />
                    Admin: {adminNames}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Join / Leave */}
            {isJoined ? (
              <Button
                type='button'
                variant='outline'
                onClick={handleLeave}
                disabled={joining}
                className='shrink-0 rounded-full px-5 font-semibold'
              >
                {joining ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <CheckCircle className='size-4' />
                )}
                Joined
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleJoin}
                disabled={joining}
                className='shrink-0 rounded-full bg-primary-container px-5 font-semibold text-primary-foreground hover:bg-primary-container/90'
              >
                {joining ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <UserPlus className='size-4' />
                )}
                Join
              </Button>
            )}
          </div>
        </Card>

        {/* Members Section */}
        <div className='mt-6'>
          <MemberSection
            members={members}
            totalCount={memberCount}
            admins={admins}
          />
        </div>

        {/* Thread Composer */}
        {isJoined ? (
          <div className='mt-6'>
            <ThreadComposer
              onPost={handlePostThread}
              communities={[{ id: String(community.id), name: community.name }]}
            />
          </div>
        ) : null}

        {/* Threads */}
        <div className='mt-6 space-y-4'>
          {threadsLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='size-6 animate-spin text-primary-container' />
            </div>
          ) : threads.length === 0 ? (
            <Card className='border border-border/80 bg-card p-8 text-center'>
              <Zap className='mx-auto size-8 text-muted-foreground/30' />
              <p className='mt-2 text-sm text-muted-foreground'>
                Belum ada thread. {isJoined ? 'Jadilah yang pertama posting!' : 'Gabung untuk posting.'}
              </p>
            </Card>
          ) : (
            threads.map((t) => (
              <ThreadCard
                key={t.id}
                thread={t}
                communityName={community.name}
                communityId={community.id}
              />
            ))
          )}
        </div>
      </main>

      {/* Manage Admins Modal */}
      <ManageAdminsModal
        open={manageOpen}
        onClose={setManageOpen}
        communityId={id}
        admins={admins}
        onPromoted={() => {
          fetchMembers();
          fetchCommunity();
        }}
      />
    </div>
  );
}
