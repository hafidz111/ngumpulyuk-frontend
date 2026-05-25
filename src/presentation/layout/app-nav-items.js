import { Compass, Map, Sparkles, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';

/** @typedef {{ to: string; label: string; icon: import('lucide-react').LucideIcon; end?: boolean }} AppNavItem */

/** @type {AppNavItem[]} */
export const APP_NAV_ITEMS = [
  { to: ROUTES.chat, label: SHELL_COPY.nav.chat, icon: Sparkles, end: true },
  { to: ROUTES.events, label: SHELL_COPY.nav.explore, icon: Compass, end: false },
  { to: ROUTES.community, label: SHELL_COPY.nav.community, icon: Users, end: false },
  { to: ROUTES.map, label: SHELL_COPY.nav.map, icon: Map, end: false },
];
