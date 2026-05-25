import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ChatConversation } from '@/presentation/chat/components/chat-conversation';
import { ChatPanelHeader } from '@/presentation/chat/components/chat-panel-header';
import { useChatContext } from '@/presentation/chat/hooks/use-chat-context';

function readNavigationPrompt(state) {
  if (!state || typeof state !== 'object' || !('prompt' in state)) return '';
  const prompt = state.prompt;
  return typeof prompt === 'string' ? prompt.trim() : '';
}

export default function ChatMainView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSidebar, sendMessage, displayName, ...chat } = useChatContext();
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;
  const consumedPromptRef = useRef('');

  useEffect(() => {
    const prompt = readNavigationPrompt(location.state);
    if (!prompt) return;

    const token = `${location.key}|${prompt}`;
    if (consumedPromptRef.current === token) return;
    consumedPromptRef.current = token;

    navigate(location.pathname, { replace: true, state: null });
    void sendMessageRef.current(prompt);
  }, [location.pathname, location.state, navigate]);

  return (
    <div className='flex h-full max-h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <ChatPanelHeader showMenuButton onOpenMenu={openSidebar} />
      <ChatConversation
        {...chat}
        sendMessage={sendMessage}
        displayName={displayName}
      />
    </div>
  );
}
