import { useCallback, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { ChatContext } from '@/presentation/chat/context/chat-context';
import { ChatSidebar } from '@/presentation/chat/components/chat-sidebar';
import { useChatActivityStats } from '@/presentation/chat/hooks/use-chat-activity-stats';
import { useNgumpskyChat } from '@/presentation/chat/hooks/use-ngumpsky-chat';
import { ChatFirstMobileNav } from '@/presentation/layout/chat-first-mobile-nav';
import { ShellMenuDialog } from '@/presentation/layout/shell-menu-dialog';

function ChatFirstLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const chat = useNgumpskyChat(isAuthenticated);
  const stats = useChatActivityStats(isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleQuickPrompt = useCallback(
    (text) => {
      setSidebarOpen(false);
      if (location.pathname !== ROUTES.chat) {
        navigate(ROUTES.chat, { replace: false, state: { prompt: text } });
        return;
      }
      if (!chat.loading) {
        void chat.sendMessage(text);
      }
    },
    [chat, location.pathname, navigate],
  );

  const contextValue = useMemo(
    () => ({
      ...chat,
      sidebarOpen,
      openSidebar,
      closeSidebar,
      handleQuickPrompt,
      displayName: user?.displayName ?? user?.username ?? '',
    }),
    [chat, sidebarOpen, openSidebar, closeSidebar, handleQuickPrompt, user],
  );

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (!user?.isOnboarded) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return (
    <ChatContext.Provider value={contextValue}>
      <div className='flex h-svh max-h-svh flex-col overflow-hidden bg-[#F5F5F7] text-foreground [@supports(height:100dvh)]:h-dvh [@supports(height:100dvh)]:max-h-dvh'>
        <div className='flex min-h-0 flex-1 overflow-hidden'>
          <ChatSidebar
            stats={stats}
            onQuickPrompt={handleQuickPrompt}
            className='hidden lg:flex lg:max-h-full'
          />

          <div className='flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            <Outlet />
          </div>
        </div>

        <ChatFirstMobileNav />

        <ShellMenuDialog open={sidebarOpen} onClose={closeSidebar}>
          <ChatSidebar
            stats={stats}
            onQuickPrompt={handleQuickPrompt}
            onNavigate={() => setSidebarOpen(false)}
            showFooterProfile={false}
            className='h-full min-h-0 flex-1 border-0'
          />
        </ShellMenuDialog>
      </div>
    </ChatContext.Provider>
  );
}

export default ChatFirstLayout;
export { ChatFirstLayout };
