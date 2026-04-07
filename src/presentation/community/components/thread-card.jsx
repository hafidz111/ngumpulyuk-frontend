import { Link } from 'react-router-dom';
import { Clock, Heart, MessageCircle, Share2 } from 'lucide-react';

import { Card } from '@/presentation/components/ui/card';
import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function ThreadCard({ thread, communityName, communityId }) {
  const author = thread.author ?? thread.user ?? {};
  const likeCount = thread.like_count ?? thread.likes_count ?? 0;
  const commentCount = thread.comment_count ?? thread.comments_count ?? 0;

  return (
    <Card className='border border-border/80 bg-card p-5'>
      {/* Author row */}
      <div className='flex items-start gap-3'>
        <Avatar className='size-10'>
          {author.profile_picture ? (
            <AvatarImage src={author.profile_picture} />
          ) : (
            <div className='flex size-full items-center justify-center bg-gradient-to-br from-primary-container/30 to-secondary/30 text-sm font-bold text-foreground'>
              {(author.full_name || author.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5 text-sm'>
            <span className='font-bold text-foreground'>
              {author.full_name || author.username || 'Anonim'}
            </span>
            <span className='text-xs text-muted-foreground'>
              • {timeAgo(thread.created_at)}
            </span>
          </div>
          {communityName ? (
            <Link
              to={`/community/${communityId}`}
              className='text-xs font-semibold text-primary-container hover:underline'
            >
              {communityName}
            </Link>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className='mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap'>
        {thread.content ?? thread.body ?? ''}
      </div>

      {/* Linked Event */}
      {thread.related_event ? (
        <Link
          to={`/events/${thread.related_event.id ?? thread.related_event_id}`}
          className='mt-3 flex items-center gap-2 rounded-xl border border-primary-container/30 bg-primary-container/5 px-4 py-3 text-xs font-semibold text-primary-container hover:bg-primary-container/10 transition-colors'
        >
          <Clock className='size-3.5' aria-hidden />
          Terkait dengan event: {thread.related_event.title ?? 'Event'}
        </Link>
      ) : null}

      {/* Thread Image */}
      {thread.image ? (
        <img
          src={thread.image}
          alt=''
          className='mt-3 w-full rounded-xl object-cover max-h-80'
        />
      ) : null}

      {/* Actions */}
      <div className='mt-4 flex items-center gap-6 text-muted-foreground'>
        <button type='button' className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors'>
          <Heart className='size-4' />
          {likeCount}
        </button>
        <button type='button' className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors'>
          <MessageCircle className='size-4' />
          {commentCount}
        </button>
        <button type='button' className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors'>
          <Share2 className='size-4' />
          Share
        </button>
      </div>
    </Card>
  );
}
