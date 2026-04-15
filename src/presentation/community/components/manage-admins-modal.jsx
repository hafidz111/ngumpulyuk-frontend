import { useState, useEffect, useCallback } from 'react';
import { Crown, Loader2, Search, Shield, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent } from '@/presentation/components/ui/dialog';
import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { communitiesApi } from '@/infrastructure/communities/communities-api';

function extractCollection(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.data?.members)) return data.data.members;
  return [];
}

export function ManageAdminsModal({ open, onClose, communityId, admins = [], onPromoted }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoting, setPromoting] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      let res = await communitiesApi.members(communityId, { role: 'member', limit: 50 });
      let items = extractCollection(res.data);
      if (items.length === 0) {
        res = await communitiesApi.members(communityId, { limit: 50 });
        items = extractCollection(res.data).filter((m) => (m.role ?? 'member') === 'member');
      }
      setMembers(items);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (open) {
      fetchMembers();
      setSearchQuery('');
    }
  }, [open, fetchMembers]);

  const filteredMembers = members.filter((m) => {
    const user = m.user ?? m;
    const name = (user.full_name || user.username || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  async function handlePromote(member) {
    const user = member.user ?? member;
    setPromoting(user.id);
    try {
      await communitiesApi.promoteMember(communityId, user.id, 'admin');
      toast.success(`${user.full_name || user.username} berhasil dipromote menjadi Admin`);
      onPromoted?.();
      fetchMembers();
    } catch {
      toast.error('Gagal mempromote member. Endpoint mungkin belum tersedia.');
    } finally {
      setPromoting(null);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent onClose={onClose} className='relative'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <UserPlus className='size-6 text-primary-container' />
            <h2 className='font-display text-xl font-bold text-foreground'>Manage Admins</h2>
          </div>
          <button type='button' onClick={() => onClose(false)} className='text-muted-foreground hover:text-foreground'>
            <X className='size-5' />
          </button>
        </div>

        {/* Current Admins */}
        <div className='mb-6'>
          <h3 className='text-sm font-bold text-foreground mb-3'>
            Current Admins ({admins.length})
          </h3>
          <div className='space-y-2'>
            {admins.map((admin) => {
              const user = admin.user ?? admin;
              const isOwner = admin.role === 'owner';
              return (
                <div
                  key={user.id}
                  className='flex items-center gap-3 rounded-xl border border-primary-container/20 bg-primary-container/5 p-3'
                >
                  <Avatar className='size-10'>
                    {user.profile_picture ? (
                      <AvatarImage src={user.profile_picture} />
                    ) : (
                      <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-sm font-bold text-foreground'>
                        {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-bold text-foreground'>
                        {user.full_name || user.username}
                      </span>
                      {isOwner ? (
                        <span className='inline-flex items-center gap-1 rounded bg-[#F5B014] px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase ml-1'>
                          <Crown className='size-3' />
                          OWNER
                        </span>
                      ) : null}
                    </div>
                    <p className='text-xs text-muted-foreground'>Administrator</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promote Section */}
        <div>
          <h3 className='text-sm font-bold text-foreground mb-3'>Promote Members to Admin</h3>

          {/* Search */}
          <div className='relative mb-3'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari member...'
              className='h-10 rounded-xl bg-muted/40 pl-10'
            />
          </div>

          {/* Member List */}
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='size-5 animate-spin text-primary-container' />
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              {searchQuery ? 'Tidak ada member ditemukan' : 'Tidak ada member untuk dipromote'}
            </p>
          ) : (
            <div className='max-h-64 space-y-1 overflow-y-auto'>
              {filteredMembers.map((member) => {
                const user = member.user ?? member;
                return (
                  <div
                    key={user.id}
                    className='flex items-center gap-3 rounded-2xl bg-muted/30 p-3.5 mb-3 transition-colors hover:bg-muted/50'
                  >
                    <Avatar className='size-11'>
                      {user.profile_picture ? (
                        <AvatarImage src={user.profile_picture} />
                      ) : (
                        <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-sm font-bold text-foreground'>
                          {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[15px] font-bold text-foreground truncate'>
                        {user.full_name || user.username}
                      </p>
                      <p className='text-[13px] text-muted-foreground'>Member</p>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      onClick={() => handlePromote(member)}
                      disabled={promoting === user.id}
                      className='rounded-full bg-primary-container px-4 h-9 text-[13px] font-semibold text-primary-foreground hover:bg-primary-container/90'
                    >
                      {promoting === user.id ? (
                        <Loader2 className='size-4 animate-spin' />
                      ) : (
                        <UserPlus className='size-4 mr-1' />
                      )}
                      Promote
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='mt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onClose(false)}
            className='w-full h-11 rounded-xl font-semibold'
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
