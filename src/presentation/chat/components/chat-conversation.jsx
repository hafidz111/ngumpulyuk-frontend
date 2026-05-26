import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import {
  ButtonBusySkeleton,
  ChatMessageSkeleton,
  ChatRecoSkeleton,
} from '@/presentation/components/skeletons';
import { Textarea } from '@/presentation/components/ui/textarea';
import { getFollowUpSuggestions } from '@/application/chat/get-follow-up-suggestions';
import { CHAT_WELCOME_CHIPS } from '@/presentation/chat/chat-sidebar-actions';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { ChatAssistantCards } from '@/presentation/chat/components/chat-assistant-cards';
import { useChatInitialRecommendations } from '@/presentation/chat/hooks/use-chat-initial-recommendations';
import { NGUMPSKY_MAX_MESSAGE } from '@/presentation/chat/hooks/use-ngumpsky-chat';

function formatMessageTime(createdAt) {
  if (!createdAt) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt));
  } catch {
    return '';
  }
}

function chipClassName(disabled) {
  return cn(
    'rounded-full border border-[#FF8000]/35 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#D97706] shadow-sm transition hover:border-[#FF8000]/60 hover:bg-[#FFF1E5]',
    disabled && 'opacity-50',
  );
}

function SuggestionChips({ chips, onSelect, disabled }) {
  return (
    <div className='mt-3 flex flex-wrap gap-2'>
      {chips.map((chip) => (
        <button
          key={chip}
          type='button'
          disabled={disabled}
          className={chipClassName(disabled)}
          onClick={() => onSelect(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

/**
 * @param {{ suggestions: ReturnType<typeof getFollowUpSuggestions>; onPrompt: (t: string) => void; loading: boolean }} props
 */
function FollowUpSuggestions({ suggestions, onPrompt, loading }) {
  const { prompts, link } = suggestions;
  if (!link && prompts.length === 0) return null;

  return (
    <div className='mt-3 flex flex-wrap gap-2'>
      {link ? (
        <Link to={link.to} className={chipClassName(false)}>
          {link.label}
        </Link>
      ) : null}
      {prompts.map((chip) => (
        <button
          key={chip}
          type='button'
          disabled={loading}
          className={chipClassName(loading)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrompt(chip);
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div
      className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FF8000] text-white shadow-sm'
      aria-hidden
    >
      <Sparkles className='size-4' />
    </div>
  );
}

export function ChatConversation({
  messages,
  input,
  setInput,
  loading,
  sendMessage,
  retryAssistant,
  sendFeedback,
  displayName,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function handleChipSelect(chip) {
    if (typeof sendMessage !== 'function') return;
    if (loading) return;
    void sendMessage(chip);
  }

  const greetingName = displayName?.trim() || 'kamu';
  const showWelcome = messages.length === 0;
  const [welcomeTimestamp] = useState(() => Date.now());
  const { cards: initialRecoCards, loading: initialRecoLoading } =
    useChatInitialRecommendations(showWelcome);
  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const showFollowUpChips =
    messages.length > 0 &&
    lastMessage?.role === 'assistant' &&
    !lastMessage.pending &&
    !lastMessage.error;

  const followUpSuggestions = showFollowUpChips
    ? getFollowUpSuggestions({
        intent: lastMessage.intent,
        lastUserMessage: lastUserMessage?.content,
        cards: lastMessage.cards,
      })
    : null;

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F0F0F2]'>
      <div
        className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-gutter:stable] md:px-6 md:py-6'
        aria-label='Riwayat percakapan'
        role='log'
      >
        {showWelcome ? (
          <div className='flex gap-3'>
            <AssistantAvatar />
            <div className='max-w-[min(100%,36rem)] flex-1'>
              <div className='rounded-2xl rounded-tl-md border border-border/50 bg-white px-4 py-3.5 text-sm leading-relaxed text-foreground shadow-sm'>
                <p>
                  {initialRecoCards.length > 0
                    ? SHELL_COPY.chat.welcomeWithReco(greetingName)
                    : SHELL_COPY.chat.welcomeNoReco(greetingName)}
                </p>
                <p className='mt-2 text-xs text-muted-foreground'>
                  {formatMessageTime(welcomeTimestamp)}
                </p>
              </div>
              {initialRecoLoading ? (
                <ChatRecoSkeleton className='mt-3' />
              ) : null}
              {initialRecoCards.length > 0 ? (
                <ChatAssistantCards cards={initialRecoCards} />
              ) : null}
              <SuggestionChips
                chips={CHAT_WELCOME_CHIPS}
                onSelect={handleChipSelect}
                disabled={loading}
              />
            </div>
          </div>
        ) : null}

        <ul className='space-y-5'>
          {messages.map((m, index) => (
            <li key={m.id}>
              {m.role === 'user' ? (
                <div className='flex justify-end'>
                  <div className='max-w-[min(88%,28rem)] space-y-1'>
                    <div className='rounded-2xl rounded-br-md bg-[#FF8000] px-4 py-2.5 text-sm text-white shadow-md shadow-[#FF8000]/15'>
                      <p className='whitespace-pre-wrap leading-relaxed'>{m.content}</p>
                    </div>
                    <p className='text-right text-[10px] text-muted-foreground'>
                      {formatMessageTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='flex gap-3'>
                  <AssistantAvatar />
                  <div className='max-w-[min(92%,36rem)] flex-1 space-y-1'>
                    <div className='rounded-2xl rounded-tl-md border border-border/50 bg-white px-4 py-3 text-sm shadow-sm'>
                      {m.pending ? (
                        <ChatMessageSkeleton aria-busy='true' />
                      ) : m.error ? (
                        <div className='space-y-2'>
                          <p className='text-destructive'>{m.error}</p>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='rounded-full'
                            disabled={loading}
                            onClick={() => void retryAssistant(m.id)}
                          >
                            Coba lagi
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className='whitespace-pre-wrap leading-relaxed text-foreground'>
                            {m.content}
                          </p>
                        </>
                      )}
                    </div>
                    {!m.pending && !m.error ? (
                      <p className='text-[10px] text-muted-foreground'>
                        {formatMessageTime(m.createdAt)}
                      </p>
                    ) : null}
                    {!m.pending && !m.error && m.traceId && !m.feedbackSent ? (
                      <div className='flex items-center gap-1'>
                        <span className='mr-1 text-[10px] text-muted-foreground'>
                          Membantu?
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-xs'
                          className='rounded-full text-muted-foreground hover:text-foreground'
                          aria-label='Membantu'
                          onClick={() => void sendFeedback(m.id, true)}
                        >
                          <ThumbsUp className='size-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-xs'
                          className='rounded-full text-muted-foreground hover:text-foreground'
                          aria-label='Kurang membantu'
                          onClick={() => void sendFeedback(m.id, false)}
                        >
                          <ThumbsDown className='size-4' />
                        </Button>
                      </div>
                    ) : null}
                    {!m.pending && !m.error && m.feedbackSent ? (
                      <p className='text-[10px] text-muted-foreground'>Makasih feedbacknya.</p>
                    ) : null}
                    {m.cards?.length ? <ChatAssistantCards cards={m.cards} /> : null}
                    {showFollowUpChips && index === messages.length - 1 && followUpSuggestions ? (
                      <FollowUpSuggestions
                        suggestions={followUpSuggestions}
                        onPrompt={(chip) => void sendMessage(chip)}
                        loading={loading}
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div ref={bottomRef} className='h-px shrink-0' aria-hidden />
      </div>

      <div className='z-10 w-full shrink-0 border-t border-border/60 bg-white px-4 py-3 md:px-6 md:py-4'>
        <div className='flex w-full items-end gap-2 rounded-2xl border border-border/60 bg-[#FAFAFA] p-2 shadow-sm'>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={SHELL_COPY.chat.inputPlaceholder}
            rows={1}
            maxLength={NGUMPSKY_MAX_MESSAGE}
            disabled={loading}
            className='min-h-[2.75rem] max-h-28 flex-1 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0'
            aria-label='Pesan ke Ngumpsky'
          />
          <Button
            type='button'
            size='icon'
            className={cn(
              'size-11 shrink-0 rounded-xl',
              input.trim()
                ? 'bg-[#FF8000] text-white hover:bg-[#FF8000]/90'
                : 'bg-[#FFE4CC] text-white/90',
            )}
            disabled={loading || !input.trim()}
            aria-label='Kirim'
            onClick={() => void sendMessage()}
          >
            {loading ? (
              <ButtonBusySkeleton className='size-5' />
            ) : (
              <Send className='size-5' aria-hidden />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
