import { useContext } from 'react';

import { ChatContext } from '@/presentation/chat/context/chat-context';

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within ChatFirstLayout');
  }
  return ctx;
}
