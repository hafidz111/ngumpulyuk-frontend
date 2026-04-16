import { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, Send, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';

import { ROUTES } from '@/shared/config/routes';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import { HomeAppHeader } from '@/presentation/home/components/home-app-header';
import {
  NGUMPSKY_MAX_MESSAGE,
  useNgumpskyChat,
} from '@/presentation/chat/hooks/use-ngumpsky-chat';
import {
  ChatAssistantCards,
  ChatIntentBadge,
} from '@/presentation/chat/components/chat-assistant-cards';

export default function ChatAssistantPage() {
  const { isAuthenticated } = useAuth();
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
  } = useNgumpskyChat(isAuthenticated);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className='flex min-h-svh flex-col bg-surface text-foreground'>
      <HomeAppHeader />

      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-4 pt-6 md:px-6'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h1 className='font-display text-2xl font-black tracking-tight md:text-3xl'>
              Ngumpsky
            </h1>
            <p className='text-sm text-muted-foreground'>AI Assistant · bantu jelajahin NgumpulYuk</p>
          </div>
          {messages.length > 0 ? (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='shrink-0 text-xs text-muted-foreground'
              onClick={() => clearThread()}
            >
              Hapus riwayat
            </Button>
          ) : null}
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto rounded-3xl border border-border/60 bg-white/80 p-4 shadow-sm md:p-5'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
              <div className='flex size-14 items-center justify-center rounded-2xl bg-[#FFF1E5] text-[#FF8000]'>
                <Sparkles className='size-7' aria-hidden />
              </div>
              <p className='font-display text-lg font-bold text-foreground'>
                Hai, aku Ngumpsky
              </p>
              <p className='max-w-sm text-sm leading-relaxed text-muted-foreground'>
                Mau cari event seru, komunitas, atau area yang rame? Ketik aja — jawaban
                bener-bener dari sistem, bukan tebak-tebakan random.
              </p>
            </div>
          ) : null}

          <ul className='space-y-4'>
            {messages.map((m) => (
              <li key={m.id}>
                {m.role === 'user' ? (
                  <div className='flex justify-end'>
                    <div className='max-w-[90%] rounded-2xl rounded-br-md bg-[#FF8000] px-4 py-2.5 text-sm text-white shadow-sm'>
                      <p className='whitespace-pre-wrap leading-relaxed'>{m.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-start'>
                    <div className='max-w-[95%] space-y-1'>
                      <div className='rounded-2xl rounded-bl-md border border-border/70 bg-surface-low/90 px-4 py-3 text-sm shadow-sm'>
                        {m.pending ? (
                          <div className='space-y-2' aria-busy='true'>
                            <div className='h-3 max-w-[85%] animate-pulse rounded bg-muted' />
                            <div className='h-3 w-full max-w-full animate-pulse rounded bg-muted' />
                            <div className='h-3 max-w-[70%] animate-pulse rounded bg-muted' />
                          </div>
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
                            <div className='mt-2 flex flex-wrap items-center gap-2'>
                              {typeof m.llmUsed === 'boolean' ? (
                                <span className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                                  {m.llmUsed ? 'AI' : 'Mode cepat'}
                                </span>
                              ) : null}
                              {m.intent ? <ChatIntentBadge intent={m.intent} /> : null}
                            </div>
                          </>
                        )}
                      </div>
                      {!m.pending && !m.error && m.traceId && !m.feedbackSent ? (
                        <div className='flex items-center gap-1 pl-1'>
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
                        <p className='pl-1 text-[10px] text-muted-foreground'>Makasih feedbacknya.</p>
                      ) : null}
                      {m.cards?.length ? <ChatAssistantCards cards={m.cards} /> : null}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div ref={bottomRef} className='h-px shrink-0' aria-hidden />
        </div>

        <div className='mt-3 space-y-2 rounded-2xl border border-border/50 bg-white/90 p-3 shadow-sm'>
          <p className='text-[11px] leading-relaxed text-muted-foreground'>
            <span className='font-semibold text-foreground'>Privasi: </span>
            jangan kirim email, nomor HP, atau alamat rumah detail ke sini kalau nggak perlu.
            Ngumpsky bantu navigasi ke konten di app; untuk urusan akun sensitif pakai kanal
            support resmi NgumpulYuk.
          </p>
          <div className='flex items-end gap-2'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Tanya event, komunitas, atau area…'
              rows={2}
              maxLength={NGUMPSKY_MAX_MESSAGE}
              disabled={loading}
              className='min-h-[3rem] resize-none rounded-2xl border-border/60 bg-surface-low/50 text-sm'
              aria-label='Pesan ke Ngumpsky'
            />
            <Button
              type='button'
              size='icon'
              className='size-11 shrink-0 rounded-2xl bg-[#FF8000] text-white hover:bg-[#FF8000]/90'
              disabled={loading || !input.trim()}
              aria-label='Kirim'
              onClick={() => void sendMessage()}
            >
              {loading ? (
                <Loader2 className='size-5 animate-spin' aria-hidden />
              ) : (
                <Send className='size-5' aria-hidden />
              )}
            </Button>
          </div>
          <p className='text-center text-[10px] text-muted-foreground'>
            {input.length}/{NGUMPSKY_MAX_MESSAGE} ·{' '}
            <Link to={ROUTES.home} className='font-medium text-primary-container hover:underline'>
              Beranda
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
