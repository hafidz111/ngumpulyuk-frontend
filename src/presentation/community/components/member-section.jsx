import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';
import { Card } from '@/presentation/components/ui/card';
import { Users, Shield } from 'lucide-react';

export function MemberSection({ members = [], totalCount = 0, admins = [] }) {
  const displayMembers = members.slice(0, 5);
  const remaining = totalCount - displayMembers.length;

  return (
    <Card className='border border-border/80 bg-card p-5'>
      <h3 className='font-display text-base font-bold text-foreground mb-4'>Members</h3>

      {/* Admin list */}
      {admins.length > 0 ? (
        <div className='mb-4 space-y-2.5'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Admin</p>
          {admins.map((admin) => {
            const user = admin.user ?? admin;
            return (
              <div key={user.id} className='flex items-center gap-3'>
                <Avatar className='size-8'>
                  {user.profile_picture ? (
                    <AvatarImage src={user.profile_picture} />
                  ) : (
                    <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-xs font-bold text-foreground'>
                      {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold text-foreground truncate'>
                    {user.full_name || user.username}
                  </p>
                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                    <Shield className='size-3' aria-hidden />
                    {admin.role === 'owner' ? 'Owner' : 'Admin'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Member avatars */}
      <div className='flex items-center gap-1'>
        <div className='flex -space-x-2'>
          {displayMembers.map((member) => {
            const user = member.user ?? member;
            return (
              <Avatar key={user.id} className='size-9 ring-2 ring-card'>
                {user.profile_picture ? (
                  <AvatarImage src={user.profile_picture} />
                ) : (
                  <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-xs font-bold text-foreground'>
                    {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
            );
          })}
        </div>
        {remaining > 0 ? (
          <span className='ml-1 text-sm font-medium text-muted-foreground'>+{remaining}</span>
        ) : null}
      </div>

      <p className='mt-2.5 text-sm text-muted-foreground'>
        <Users className='mr-1 inline size-3.5' aria-hidden />
        {totalCount} orang telah bergabung dengan komunitas ini
      </p>
    </Card>
  );
}
