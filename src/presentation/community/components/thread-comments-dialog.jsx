import { useMemo, useState } from 'react';
import { Heart, Loader2, MessageCircle } from 'lucide-react';

import { Dialog, DialogContent } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Avatar, AvatarImage } from '@/presentation/components/ui/avatar';

function formatCommentTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ThreadCommentsDialog({
  open,
  onOpenChange,
  thread,
  comments,
  loading,
  submitting,
  likingCommentId,
  onSubmitComment,
  onLikeComment,
}) {
  const [draft, setDraft] = useState('');

  const title = useMemo(() => {
    if (!thread) return 'Komentar';
    return thread.title || 'Diskusi Thread';
  }, [thread]);

  async function handleSubmit() {
    if (!draft.trim() || !thread) return;
    const content = draft.trim();
    await onSubmitComment?.(thread, content);
    setDraft('');
  }

  return (
    <Dialog open={open} onClose={onOpenChange}>
      <DialogContent onClose={onOpenChange} className='max-w-2xl'>
        <div className='space-y-4'>
          <div>
            <h3 className='pr-10 text-lg font-semibold text-foreground'>{title}</h3>
            <p className='mt-1 text-xs text-muted-foreground'>Baca dan balas komentar thread.</p>
          </div>

          <div className='max-h-[45vh] space-y-3 overflow-y-auto pr-1'>
            {loading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='size-5 animate-spin text-primary-container' />
              </div>
            ) : comments.length === 0 ? (
              <div className='rounded-xl border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground'>
                <MessageCircle className='mx-auto mb-2 size-5 opacity-40' />
                Belum ada komentar.
              </div>
            ) : (
              comments.map((comment) => {
                const author = comment.author ?? comment.user ?? {};
                const liked = Boolean(comment.is_liked);
                const likeCount = comment.like_count ?? comment.likes_count ?? 0;
                return (
                  <div key={comment.id} className='rounded-xl border border-border/70 bg-card p-3'>
                    <div className='flex items-start gap-2.5'>
                      <Avatar className='mt-0.5 size-8'>
                        {author.profile_picture ? (
                          <AvatarImage src={author.profile_picture} />
                        ) : (
                          <div className='flex size-full items-center justify-center bg-muted text-xs font-bold'>
                            {(author.full_name || author.username || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-foreground'>
                          {author.full_name || author.username || 'Anonim'}
                        </p>
                        <p className='mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground'>
                          {comment.content}
                        </p>
                        <button
                          type='button'
                          onClick={() => onLikeComment?.(comment)}
                          disabled={likingCommentId === comment.id}
                          className={`mt-2 inline-flex items-center gap-1 text-xs ${
                            liked ? 'text-rose-500' : 'text-muted-foreground'
                          }`}
                        >
                          <Heart className={`size-3.5 ${liked ? 'fill-current' : ''}`} />
                          {likeCount}
                        </button>
                      </div>
                      <span className='text-[10px] text-muted-foreground'>
                        {formatCommentTime(comment.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className='space-y-2'>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='Tulis komentar...'
              maxLength={1000}
              className='min-h-[92px]'
            />
            <div className='flex items-center justify-end'>
              <Button
                type='button'
                onClick={handleSubmit}
                disabled={!draft.trim() || submitting}
                className='rounded-full px-5'
              >
                {submitting ? <Loader2 className='size-4 animate-spin' /> : null}
                Kirim Komentar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
