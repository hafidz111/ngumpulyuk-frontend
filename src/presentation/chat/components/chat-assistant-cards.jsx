import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

import { normalizeChatCard } from '@/application/chat/map-chat-response';
import { EventCard } from '@/presentation/events/components/event-card';
import { CommunityCard } from '@/presentation/community/components/community-card';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/lib/utils';

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

  return (
    <div className='mt-3 space-y-3'>
      {normalized.map((card, i) => (
        <ChatAssistantCardRow key={`${card.type}-${i}`} card={card} idx={i} />
      ))}
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
    case 'event': {
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
        <div className='space-y-1.5'>
          {recommendationReason ? (
            <p className='text-xs leading-relaxed text-muted-foreground'>
              <span className='font-semibold text-foreground'>Kenapa ini: </span>
              {recommendationReason}
            </p>
          ) : null}
          <EventCard event={ev} idx={idx} />
        </div>
      );
    }
    case 'community': {
      const c = {
        ...card.payload,
        cover_image: card.payload.cover_image ?? card.payload.image_url ?? '',
      };
      if (!c.id) return null;
      return <CommunityCard community={c} />;
    }
    case 'area': {
      const name = String(card.payload.name ?? '').trim();
      const hint = String(card.payload.hint ?? '').trim();
      if (!name && !hint) return null;
      return (
        <div
          className={cn(
            'flex items-start gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2.5',
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
