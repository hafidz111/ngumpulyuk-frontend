import { CalendarDays, Compass, Users, Zap } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';

/** @typedef {{ label: string; icon: import('lucide-react').LucideIcon; prompt?: string; to?: string; iconClassName: string }} ChatSidebarAction */

/** @type {ChatSidebarAction[]} */
export const CHAT_SIDEBAR_ACTIONS = [
  {
    label: SHELL_COPY.sidebarActions.findEvent,
    icon: Compass,
    to: ROUTES.events,
    iconClassName: 'bg-sky-100 text-sky-600',
  },
  {
    label: SHELL_COPY.sidebarActions.sports,
    icon: Zap,
    prompt: SHELL_COPY.sidebarActions.sportsPrompt,
    iconClassName: 'bg-amber-100 text-amber-600',
  },
  {
    label: SHELL_COPY.sidebarActions.weekend,
    icon: CalendarDays,
    prompt: SHELL_COPY.sidebarActions.weekendPrompt,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    label: SHELL_COPY.sidebarActions.community,
    icon: Users,
    prompt: SHELL_COPY.sidebarActions.communityPrompt,
    iconClassName: 'bg-emerald-100 text-emerald-600',
  },
];

export const CHAT_WELCOME_CHIPS = SHELL_COPY.welcomeChips;
