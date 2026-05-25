import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { AvatarGroup, AvatarGroupCount } from '@/presentation/components/ui/avatar-group';
import { Card } from '@/presentation/components/ui/card';
import { Users } from 'lucide-react';

export function MemberSection({ members = [], totalCount = 0, isOwner = false }) {
  const fallbackColorClasses = [
    'bg-rose-200 text-rose-900',
    'bg-sky-200 text-sky-900',
    'bg-emerald-200 text-emerald-900',
    'bg-amber-200 text-amber-900',
    'bg-violet-200 text-violet-900',
    'bg-fuchsia-200 text-fuchsia-900',
    'bg-cyan-200 text-cyan-900',
  ];

  function normalizeMember(member, idx = 0) {
    const user = member?.user ?? member ?? {};
    return {
      ...member,
      user,
      id: user.id ?? member?.id ?? `${user.username || user.full_name || 'member'}-${idx}`,
      role: member?.role ?? user?.role ?? 'member',
    };
  }

  function initialFromUser(user = {}) {
    return (user.full_name || user.username || '?').charAt(0).toUpperCase();
  }

  function colorClassForUser(user = {}) {
    const source = String(user.id ?? user.username ?? user.full_name ?? 'member');
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % fallbackColorClasses.length;
    return fallbackColorClasses[idx];
  }

  const normalizedMembers = members
    .map((member, idx) => normalizeMember(member, idx));

  const displayMembers = normalizedMembers.slice(0, 8);
  const remaining = totalCount - displayMembers.length;

  return (
    <Card className='border border-border/80 bg-card p-5'>
      <h3 className='mb-4 font-display text-base font-bold text-foreground'>Anggota</h3>

      {/* Member avatars */}
      <AvatarGroup>
        {displayMembers.map((member) => {
          const user = member.user ?? member;
          const isAdminMember = member.role === 'owner' || member.role === 'admin' || member.role === 'moderator';
          return (
            <Avatar
              key={member.id}
              title={isOwner && isAdminMember ? `${user.full_name || user.username} (Admin)` : (user.full_name || user.username)}
              className={`avatar-group-item size-9 ${isOwner && isAdminMember ? 'ring-amber-300' : ''}`}
            >
              <AvatarFallback className={colorClassForUser(user)}>
                {initialFromUser(user)}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {remaining > 0 ? (
          <AvatarGroupCount>+{remaining}</AvatarGroupCount>
        ) : null}
      </AvatarGroup>

      <p className='mt-2.5 text-sm text-muted-foreground'>
        <Users className='mr-1 inline size-3.5' aria-hidden />
        {totalCount} orang telah bergabung dengan komunitas ini
      </p>
    </Card>
  );
}
