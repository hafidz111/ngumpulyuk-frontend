import { Link } from 'react-router-dom';
import { Clock, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/presentation/components/ui/card';
import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';
import { toTitleCase } from '@/shared/lib/text-format';

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

function pickPrimaryInterest(author, thread) {
  const fromAuthorArray = Array.isArray(author?.interests)
    ? author.interests
    : [];
  const fromAuthorSingle = author?.interest ? [author.interest] : [];
  const fromThread = thread?.interest ? [thread.interest] : [];

  const uniqueInterests = Array.from(
    new Map(
      [...fromAuthorArray, ...fromAuthorSingle, ...fromThread]
        .map((value) => toTitleCase(value))
        .filter(Boolean)
        .map((value) => [value.toLowerCase(), value]),
    ).values(),
  );

  return uniqueInterests[0] ?? null;
}

export function ThreadCard({
  thread,
  communityName,
  communityId,
  onLike,
  onOpenComments,
  onDelete,
  isLiking = false,
  isLiked = false,
  isDeleting = false,
  canDelete = false,
}) {
  const author = thread.author ?? thread.user ?? {};
  const likeCount = thread.like_count ?? thread.likes_count ?? 0;
  const commentCount = thread.comment_count ?? thread.comments_count ?? 0;
  const imageList = Array.isArray(thread.images) ? thread.images : (thread.image ? [thread.image] : []);
  const normalizedFirstInterest = pickPrimaryInterest(author, thread);
  const profilePath = author.username ? `/profile/${author.username}` : null;

  function authorDisplayName() {
    return (
      author.full_name ||
      author.username ||
      author.display_name ||
      author.displayName ||
      author.name ||
      (typeof author.email === 'string' ? author.email.split('@')[0] : '') ||
      'User'
    );
  }

  function authorInitial() {
    const first = authorDisplayName().trim().charAt(0).toUpperCase();
    return first || 'U';
  }

  function authorColorClass() {
    const palette = [
      'bg-rose-200 text-rose-900',
      'bg-sky-200 text-sky-900',
      'bg-emerald-200 text-emerald-900',
      'bg-amber-200 text-amber-900',
      'bg-violet-200 text-violet-900',
      'bg-fuchsia-200 text-fuchsia-900',
      'bg-cyan-200 text-cyan-900',
    ];
    const source = String(
      author.id ||
      author.username ||
      author.full_name ||
      author.email ||
      'user',
    );
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  }

  async function handleShareThread() {
    const threadUrl = `${window.location.origin}/community?thread=${thread.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Thread dari ${authorDisplayName()}`,
          text: (thread.content ?? thread.body ?? '').slice(0, 120),
          url: threadUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(threadUrl);
      toast.success('Link thread berhasil disalin.');
    } catch {
      toast.error('Gagal membagikan thread.');
    }
  }

  return (
    <Card className='border border-border/80 bg-card p-5'>
      {/* Author row */}
      <div className='flex items-start gap-3'>
        {profilePath ? (
          <Link to={profilePath} className='shrink-0'>
            <Avatar className='size-10'>
              {author.profile_picture ? (
                <AvatarImage src={author.profile_picture} />
              ) : (
                <div className={`flex size-full items-center justify-center text-sm font-bold ${authorColorClass()}`}>
                  {authorInitial()}
                </div>
              )}
            </Avatar>
          </Link>
        ) : (
          <Avatar className='size-10'>
            {author.profile_picture ? (
              <AvatarImage src={author.profile_picture} />
            ) : (
              <div className={`flex size-full items-center justify-center text-sm font-bold ${authorColorClass()}`}>
                {authorInitial()}
              </div>
            )}
          </Avatar>
        )}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5 text-sm'>
            {profilePath ? (
              <Link to={profilePath} className='font-bold text-foreground hover:underline'>
                {authorDisplayName()}
              </Link>
            ) : (
              <span className='font-bold text-foreground'>
                {authorDisplayName()}
              </span>
            )}
            <span className='text-xs text-muted-foreground'>
              • {timeAgo(thread.created_at)}
            </span>
          </div>
          {normalizedFirstInterest ? (
            <p className='mt-0.5 text-[11px] font-medium text-muted-foreground'>
              {normalizedFirstInterest}
            </p>
          ) : null}
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
      {imageList.length > 0 ? (
        <div className={`mt-3 grid gap-2 ${imageList.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {imageList.slice(0, 3).map((img, idx) => (
            <img
              key={`${img}-${idx}`}
              src={img}
              alt=''
              className='max-h-80 w-full rounded-xl object-cover'
            />
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <div className='mt-4 flex items-center gap-6 text-muted-foreground'>
        <button
          type='button'
          onClick={() => onLike?.(thread)}
          disabled={isLiking}
          className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors disabled:opacity-60'
        >
          <Heart className={`size-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
          {likeCount}
        </button>
        <button
          type='button'
          onClick={() => onOpenComments?.(thread)}
          className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors'
        >
          <MessageCircle className='size-4' />
          {commentCount}
        </button>
        <button
          type='button'
          onClick={() => void handleShareThread()}
          className='inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors'
        >
          <Share2 className='size-4' />
          Share
        </button>
        {canDelete ? (
          <button
            type='button'
            onClick={() => onDelete?.(thread)}
            disabled={isDeleting}
            className='inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors disabled:opacity-60'
          >
            <Trash2 className='size-4' />
            Hapus
          </button>
        ) : null}
      </div>
    </Card>
  );
}
