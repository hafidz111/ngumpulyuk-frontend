import { useChatContext } from '@/presentation/chat/hooks/use-chat-context';

export function useChatPageShell() {
  const { openSidebar } = useChatContext();
  return { onOpenMenu: openSidebar };
}
