import { useChatContext } from '@/presentation/chat/hooks/use-chat-context';

export function useChatPageShell() {
  const { openSidebar, sidebarOpen } = useChatContext();
  return { onOpenMenu: openSidebar, sidebarOpen: Boolean(sidebarOpen) };
}
