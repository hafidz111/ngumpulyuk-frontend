import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, LogOut, User } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/lib/utils';
import { APP_SHELL_NAV_ROW_CLASS } from '@/presentation/layout/app-shell-chrome';
import { userAvatarColorClass, userInitialFromName } from '@/shared/lib/user-avatar';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';

/**
 * @param {{ variant?: 'sidebar' | 'tab'; onNavigate?: () => void }} props
 */
export function ChatProfileMenu({ variant = 'sidebar', onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const onProfilePage =
    location.pathname === ROUTES.profile ||
    location.pathname.startsWith(`${ROUTES.profile}/`);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const displayName = user?.displayName || user?.username || 'Pengguna';
  const username = user?.username || '';
  const identity = user?.id || user?.username || user?.email || displayName;

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    setOpen(false);
    onNavigate?.();
    try {
      await logout();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setPending(false);
    }
  };

  const isTab = variant === 'tab';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'transition hover:bg-[#FFF1E5]/80',
            isTab
              ? cn(
                  'inline-flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold',
                  onProfilePage
                    ? 'bg-[#FF8000] text-white'
                    : 'text-muted-foreground',
                )
              : cn(APP_SHELL_NAV_ROW_CLASS, 'w-full text-left'),
          )}
          aria-label={`Menu profil ${displayName}`}
        >
          <Avatar
            className={cn(
              'border-2 border-white shadow-sm',
              isTab ? 'size-8' : 'size-9',
            )}
          >
            <AvatarFallback
              className={cn(
                userAvatarColorClass(identity),
                isTab ? 'text-xs font-bold' : 'text-sm font-bold',
              )}
            >
              {userInitialFromName(displayName)}
            </AvatarFallback>
          </Avatar>
          {isTab ? (
            <span className='max-w-full truncate'>{displayName.split(' ')[0]}</span>
          ) : (
            <>
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-sm font-semibold text-foreground'>
                  {displayName}
                </span>
                {username ? (
                  <span className='block truncate text-xs text-muted-foreground'>
                    @{username}
                  </span>
                ) : null}
              </span>
              <ChevronUp
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition',
                  open && 'rotate-180',
                )}
                aria-hidden
              />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={isTab ? 'center' : 'start'}
        side={isTab ? 'top' : 'top'}
        className='w-56 p-1'
      >
        <Link
          to={ROUTES.profile}
          className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted'
          onClick={() => {
            setOpen(false);
            onNavigate?.();
          }}
        >
          <User className='size-4' aria-hidden />
          Profil saya
        </Link>
        <button
          type='button'
          disabled={pending}
          className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10'
          onClick={() => void handleLogout()}
        >
          <LogOut className='size-4' aria-hidden />
          Keluar
        </button>
      </PopoverContent>
    </Popover>
  );
}
