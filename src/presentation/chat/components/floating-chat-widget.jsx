import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';

import { Button } from '@/presentation/components/ui/button';
import { ButtonBusySkeleton, ChatMessageSkeleton } from '@/presentation/components/skeletons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
import { Textarea } from '@/presentation/components/ui/textarea';
import {
  NGUMPSKY_MAX_MESSAGE,
  useNgumpskyChat,
} from '@/presentation/chat/hooks/use-ngumpsky-chat';
import { ChatAssistantCards } from '@/presentation/chat/components/chat-assistant-cards';

const QUICK_PROMPTS = [
  'Event olahraga minggu ini',
  'Board game terdekat',
  'Event di Jakarta Selatan',
  'Rekomendasi untuk pemula',
];

function answerSourceLabel(answerSource) {
  const type = String(answerSource?.type ?? '').trim();
  const ref = String(answerSource?.ref ?? '').trim();
  if (!type) return '';
  if (type === 'correction:faq') return `FAQ${ref ? ` (${ref})` : ''}`;
  if (type === 'correction:manual') return 'Manual Admin';
  if (type === 'llm' || type === 'rule_or_llm') return 'Model';
  if (type === 'faq') return `FAQ${ref ? ` (${ref})` : ''}`;
  if (type === 'event') return `Event${ref ? ` (${ref})` : ''}`;
  if (type === 'community') return `Community${ref ? ` (${ref})` : ''}`;
  return ref ? `${type} (${ref})` : type;
}

export function FloatingChatWidget({ enabled }) {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);
  const {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    retryAssistant,
    sendFeedback,
    clearThread,
  } = useNgumpskyChat(Boolean(enabled));

  const panelOpen = enabled && open;

  useEffect(() => {
    if (!panelOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, panelOpen]);

  useEffect(() => {
    if (enabled) return;
    clearThread();
  }, [clearThread, enabled]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  if (!enabled) return null;

  const canSend = input.trim().length > 0 && !loading;

  function handleOpenChange(nextOpen) {
    if (!enabled) return;
    setOpen(nextOpen);
  }

  return (
    <div className='fixed bottom-5 right-3 z-50 md:bottom-6 md:right-6'>
      <Popover open={panelOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-full bg-[#FF8000] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#FF8000]/90'
            aria-label='Ngumpsky - AI Assistant'
          >
            <Sparkles className='size-4' aria-hidden />
            Ngumpsky
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='top'
          align='end'
          sideOffset={10}
          className='w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border-0 bg-transparent p-0 shadow-none md:w-[26rem]'
        >
          <div className='flex max-h-[70vh] flex-col overflow-hidden rounded-[1.5rem]'>
            <div className='flex items-start justify-between bg-[#FF8A00] px-4 py-3.5 text-white'>
              <div className='flex items-start gap-3'>
                <div className='mt-0.5 flex size-9 items-center justify-center rounded-full bg-white/20'>
                  <Sparkles className='size-4' aria-hidden />
                </div>
                <div>
                  <p className='font-display text-base leading-none font-black tracking-tight md:text-lg'>
                    Ngumpsky - AI Assistant
                  </p>
                  <p className='mt-1.5 inline-flex items-center gap-2 text-xs font-medium text-white/95 md:text-sm'>
                    <span className='size-2 rounded-full bg-emerald-400' />
                    Online
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='rounded-full p-1.5 text-white/90 transition hover:bg-white/15 hover:text-white'
                aria-label='Tutup chat'
              >
                <X className='size-5' />
              </button>
            </div>

            <div className='min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#ECECEF] px-4 py-4'>
              {messages.length === 0 ? (
                <>
                  <div className='max-w-[96%] rounded-2xl border border-border/60 bg-[#F5F5F7] px-4 py-4 text-left shadow-sm'>
                    <p className='text-base font-semibold leading-snug text-foreground md:text-lg'>
                      Halo! 👋 Aku Ngumpsky, asisten NgumpulYuk-mu! Aku bisa bantu kamu:
                    </p>
                    <p className='mt-3 text-sm leading-relaxed text-foreground md:text-base'>
                      ✨ Cari event yang cocok
                      <br />
                      📍 Rekomendasi berdasarkan lokasi
                      <br />
                      🎯 Info event terbaru
                      <br />
                      💬 Jawab pertanyaan seputar event
                      <br />
                      <br />
                      Ada yang bisa aku bantu?
                    </p>
                    <p className='mt-2 text-xs text-muted-foreground'>15.56</p>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type='button'
                        className='rounded-full border border-border/70 bg-[#F7F7F8] px-3 py-2 text-left text-xs font-semibold text-[#D97706] hover:bg-white md:text-sm'
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <ul className='space-y-3'>
                {messages.map((m) => (
                  <li key={m.id}>
                    {m.role === 'user' ? (
                      <div className='flex justify-end'>
                        <div className='max-w-[90%] rounded-2xl rounded-br-md bg-[#FF8A00] px-3.5 py-2 text-sm text-white shadow-sm'>
                          <p className='whitespace-pre-wrap leading-relaxed'>{m.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-1'>
                        <div className='max-w-[95%] rounded-2xl rounded-bl-md border border-border/70 bg-[#F5F5F7] px-3.5 py-2.5 text-sm shadow-sm'>
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
                              <div className='mt-2 space-y-1'>
                                {m.correctionApplied ? (
                                  <span className='inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>
                                    Jawaban Terkurasi
                                  </span>
                                ) : null}
                                {m.answerSource ? (
                                  <p className='text-[10px] text-muted-foreground'>
                                    Sumber: {answerSourceLabel(m.answerSource)}
                                  </p>
                                ) : null}
                              </div>
                            </>
                          )}
                        </div>
                        {!m.pending && !m.error && m.traceId && !m.feedbackSent ? (
                          <div className='flex items-center gap-1 pl-1'>
                            <span className='mr-1 text-[10px] text-muted-foreground'>Membantu?</span>
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
                          <p className='pl-1 text-[10px] text-muted-foreground'>Makasih feedbacknya.</p>
                        ) : null}
                        {m.cards?.length ? <ChatAssistantCards cards={m.cards} /> : null}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div ref={bottomRef} className='h-px shrink-0' aria-hidden />
            </div>

            <div className='space-y-2 border-t border-border/60 bg-[#F7F7F8] px-4 py-3'>
              <div className='flex items-end gap-2'>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Tanya apa aja...'
                  rows={1}
                  maxLength={NGUMPSKY_MAX_MESSAGE}
                  disabled={loading}
                  className='min-h-[2.8rem] resize-none rounded-full border-[#E79A61] bg-white px-4 py-2.5 text-sm'
                  aria-label='Pesan ke Ngumpsky'
                />
                <Button
                  type='button'
                  size='icon'
                  className={
                    canSend
                      ? 'size-10 shrink-0 rounded-full bg-[#FF8A00] text-white hover:bg-[#FF8A00]/90'
                      : 'size-10 shrink-0 rounded-full bg-[#E8D9CB] text-white/80'
                  }
                  disabled={!canSend}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
