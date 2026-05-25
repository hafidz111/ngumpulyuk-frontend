import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

import { normalizeChatCard } from '@/application/chat/map-chat-response';
import { EventCard } from '@/presentation/events/components/event-card';
import { CommunityCard } from '@/presentation/community/components/community-card';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/lib/utils';

const CHAT_EVENT_CARD_WIDTH =
  'w-[min(85vw,17.5rem)] shrink-0 snap-start sm:w-[17.5rem]';

const CHAT_COMMUNITY_CARD_WIDTH =
  'w-[min(85vw,16rem)] shrink-0 snap-start sm:w-[16rem]';

/**
 * @param {{ cards?: unknown[] }} props
 */
export function ChatAssistantCards({ cards }) {
  const normalized = useMemo(
    () =>
      (Array.isArray(cards) ? cards : [])
        .map((raw) => normalizeChatCard(raw))
        .filter(Boolean),
    [cards],
  );

  if (normalized.length === 0) return null;

  const eventCards = normalized.filter((c) => c.type === 'event');
  const communityCards = normalized.filter((c) => c.type === 'community');
  const otherCards = normalized.filter(
    (c) => c.type !== 'event' && c.type !== 'community',
  );

  return (
    <div className='mt-3 space-y-3'>
      {eventCards.length > 0 ? (
        <ChatEventCardsStrip cards={eventCards} />
      ) : null}
      {communityCards.length > 0 ? (
        <ChatCommunityCardsStrip cards={communityCards} />
      ) : null}
      {otherCards.map((card, i) => (
        <ChatAssistantCardRow key={`${card.type}-other-${i}`} card={card} idx={i} />
      ))}
    </div>
  );
}

/**
 * @param {{ cards: { type: string; payload: Record<string, unknown> }[] }} props
 */
function ChatEventCardsStrip({ cards }) {
  if (cards.length === 1) {
    return <ChatEventCardBlock card={cards[0]} idx={0} className='w-full max-w-md' />;
  }

  return (
    <div
      className='-mx-1 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 snap-x snap-mandatory [scrollbar-width:thin]'
      role='list'
      aria-label='Rekomendasi event'
    >
      {cards.map((card, i) => (
        <div key={`event-${card.payload?.id ?? i}`} role='listitem'>
          <ChatEventCardBlock card={card} idx={i} className={CHAT_EVENT_CARD_WIDTH} />
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{ cards: { type: string; payload: Record<string, unknown> }[] }} props
 */
function ChatCommunityCardsStrip({ cards }) {
  if (cards.length === 1) {
    return <ChatCommunityCardBlock card={cards[0]} className='w-full max-w-md' />;
  }

  return (
    <div
      className='-mx-1 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 snap-x snap-mandatory [scrollbar-width:thin]'
      role='list'
      aria-label='Rekomendasi komunitas'
    >
      {cards.map((card, i) => (
        <div key={`community-${card.payload?.id ?? i}`} role='listitem'>
          <ChatCommunityCardBlock card={card} className={CHAT_COMMUNITY_CARD_WIDTH} />
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   card: { type: string; payload: Record<string, unknown> };
 *   idx: number;
 *   className?: string;
 * }} props
 */
function ChatEventCardBlock({ card, idx, className }) {
  const ev = {
    ...card.payload,
    cover_image: card.payload.cover_image ?? card.payload.image_url ?? '',
  };
  const id = ev.id ?? ev.event_id;
  if (!id) return null;

  const recommendationReason =
    typeof ev.recommendation_reason === 'string'
      ? ev.recommendation_reason.trim()
      : '';

  return (
    <div className={cn('space-y-1.5', className)}>
      {recommendationReason ? (
        <p className='text-xs leading-relaxed text-muted-foreground'>
          <span className='font-semibold text-foreground'>Kenapa ini: </span>
          {recommendationReason}
        </p>
      ) : null}
      <EventCard event={ev} idx={idx} className='h-full' />
    </div>
  );
}

/**
 * @param {{
 *   card: { type: string; payload: Record<string, unknown> };
 *   className?: string;
 * }} props
 */
function ChatCommunityCardBlock({ card, className }) {
  const c = {
    ...card.payload,
    cover_image: card.payload.cover_image ?? card.payload.image_url ?? '',
  };
  if (!c.id) return null;

  return (
    <div className={className}>
      <CommunityCard community={c} />
    </div>
  );
}

/**
 * @param {{
 *   card: { type: string; payload: Record<string, unknown> };
 *   idx: number;
 * }} props
 */
function ChatAssistantCardRow({ card, idx }) {
  switch (card.type) {
    case 'event':
      return <ChatEventCardBlock card={card} idx={idx} className='w-full max-w-md' />;
    case 'community':
      return <ChatCommunityCardBlock card={card} className='w-full max-w-md' />;
    case 'area': {
      const name = String(card.payload.name ?? '').trim();
      const hint = String(card.payload.hint ?? '').trim();
      if (!name && !hint) return null;
      return (
        <div
          className={cn(
            'flex items-start gap-2 rounded-2xl border border-border/70 bg-white px-3 py-2.5 shadow-sm',
          )}
        >
          <MapPin className='mt-0.5 size-4 shrink-0 text-primary-container' aria-hidden />
          <div className='min-w-0'>
            {name ? (
              <p className='text-sm font-semibold text-foreground'>{name}</p>
            ) : null}
            {hint ? (
              <p className='text-xs text-muted-foreground'>{hint}</p>
            ) : (
              <p className='text-xs text-muted-foreground'>
                Area dari event di platform NgumpulYuk.
              </p>
            )}
          </div>
        </div>
      );
    }
    case 'sources':
      return null;
    default:
      return null;
  }
}

/**
 * @param {{ intent?: string }} props
 */
export function ChatIntentBadge({ intent }) {
  if (!intent || intent === 'general' || intent === 'empty') return null;
  const label = intent
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <Badge variant='muted' className='mt-1 text-[10px] font-normal normal-case'>
      {label}
    </Badge>
  );
}
