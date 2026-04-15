import { useRef, useState, useEffect } from 'react';
import { ImagePlus, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { uploadThreadImage } from '@/infrastructure/storage/image-upload';

const MAX_THREAD_IMAGES = 3;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

export function ThreadComposer({
  onPost,
  communities = [],
  events = [],
  autoSelectSingleCommunity = false,
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('optional');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (autoSelectSingleCommunity && communities?.length === 1) {
      setSelectedCommunity(String(communities[0].id));
    } else if (!autoSelectSingleCommunity) {
      setSelectedCommunity('optional');
    }
  }, [communities, autoSelectSingleCommunity]);

  function displayName() {
    return (
      user?.full_name ||
      user?.username ||
      user?.display_name ||
      user?.displayName ||
      user?.name ||
      (typeof user?.email === 'string' ? user.email.split('@')[0] : '') ||
      'User'
    );
  }

  function initial() {
    const first = displayName().trim().charAt(0).toUpperCase();
    return first || 'U';
  }

  function colorClassForUser(account = {}) {
    const palette = [
      'bg-rose-200 text-rose-900',
      'bg-sky-200 text-sky-900',
      'bg-emerald-200 text-emerald-900',
      'bg-amber-200 text-amber-900',
      'bg-violet-200 text-violet-900',
      'bg-fuchsia-200 text-fuchsia-900',
      'bg-cyan-200 text-cyan-900',
    ];
    const source = String(account.id ?? account.username ?? account.full_name ?? 'user');
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  }

  function handleSelectImages(event) {
    const picked = Array.from(event.target.files || []);
    if (picked.length === 0) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const currentCount = imageFiles.length;
    const allowedCount = Math.max(0, MAX_THREAD_IMAGES - currentCount);
    const filtered = picked.filter((file) => {
      if (!validTypes.includes(file.type)) return false;
      if (file.size > MAX_IMAGE_SIZE) return false;
      return true;
    }).slice(0, allowedCount);

    if (filtered.length < picked.length) {
      toast.error('Maksimal 3 gambar. Format: PNG/JPG/WEBP, ukuran <= 3MB.');
    }
    if (filtered.length === 0) {
      event.target.value = '';
      return;
    }

    setImageFiles((prev) => [...prev, ...filtered]);
    setImagePreviews((prev) => [...prev, ...filtered.map((file) => URL.createObjectURL(file))]);
    event.target.value = '';
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const normalizedEvent = selectedEvent && selectedEvent !== 'none' ? selectedEvent : undefined;
      const normalizedCommunity =
        selectedCommunity !== 'optional'
          ? selectedCommunity
          : undefined;
      const uploadedImages = imageFiles.length > 0
        ? await Promise.all(imageFiles.map((file) => uploadThreadImage(file)))
        : [];
      await onPost({
        content: content.trim(),
        images: uploadedImages,
        ...(normalizedCommunity ? { community_id: normalizedCommunity } : {}),
        ...(normalizedEvent ? { related_event_id: normalizedEvent } : {}),
      });
      setContent('');
      setSelectedCommunity('optional');
      setSelectedEvent('');
      setImageFiles([]);
      setImagePreviews([]);
      setExpanded(false);
    } catch {
      // error handled by parent
    } finally {
      setPosting(false);
    }
  }

  return (
    <Card className='border border-border/70 bg-gradient-to-b from-card to-card/80 p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <Avatar className='size-10 shrink-0'>
          <AvatarFallback className={`${colorClassForUser(user)} text-sm font-bold`}>
            {initial()}
          </AvatarFallback>
        </Avatar>

        {!expanded ? (
          <div className='w-full'>
            <button
              type='button'
              onClick={() => setExpanded(true)}
              className='flex h-11 w-full items-center rounded-full border border-border/70 bg-muted/30 px-5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/50'
            >
              Tulis thread baru...
            </button>
          </div>
        ) : (
          <div className='flex-1 space-y-3 w-full animate-in fade-in slide-in-from-top-2 duration-200'>
            <div className='grid gap-2 rounded-xl border border-border/60 bg-background/60 p-2 sm:grid-cols-2'>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className='h-9 w-full rounded-lg border-border/60 bg-card text-xs font-medium'>
                  <SelectValue placeholder='Komunitas (opsional)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='optional'>Pilih komunitas (opsional)</SelectItem>
                  {communities.length > 0 ? (
                    communities.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value='none' disabled>Belum ada komunitas tersedia</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className='h-9 w-full rounded-lg border-border/60 bg-card text-xs font-medium'>
                  <SelectValue placeholder='Link ke event (opsional)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Tanpa event</SelectItem>
                  {events?.map((ev) => (
                    <SelectItem key={ev.id} value={String(ev.id)}>{ev.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Apa yang lagi kamu pikirin?'
              className='min-h-[110px] w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none'
              maxLength={2000}
              autoFocus
            />

            {imagePreviews.length > 0 ? (
              <div className='grid grid-cols-3 gap-2'>
                {imagePreviews.map((preview, idx) => (
                  <div key={`${preview}-${idx}`} className='relative overflow-hidden rounded-lg border border-border/60'>
                    <img src={preview} alt='' className='h-24 w-full object-cover' />
                    <button
                      type='button'
                      onClick={() => removeImage(idx)}
                      className='absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white'
                      aria-label='Hapus gambar'
                    >
                      <X className='size-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className='mt-1 flex items-center justify-between border-t border-border/40 pt-2'>
              <div className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                <Sparkles className='size-3.5' />
                Pilih komunitas opsional, sistem akan pakai default jika kosong.
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/png, image/jpeg, image/jpg, image/webp'
                  multiple
                  className='sr-only'
                  onChange={handleSelectImages}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={posting || imageFiles.length >= MAX_THREAD_IMAGES}
                  className='rounded-full'
                >
                  <ImagePlus className='size-4' />
                  Gambar ({imageFiles.length}/{MAX_THREAD_IMAGES})
                </Button>
              </div>
              <button
                type='button'
                onClick={() => {
                  setExpanded(false);
                  setContent('');
                  setSelectedCommunity('optional');
                  setSelectedEvent('');
                  setImageFiles([]);
                  setImagePreviews([]);
                }}
                className='text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
              >
                Batal
              </button>
              <Button
                type='button'
                onClick={handlePost}
                disabled={!content.trim() || posting}
                className='h-9 rounded-full bg-primary-container px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary-container/90'
              >
                {posting ? <Loader2 className='size-3.5 mr-1.5 animate-spin' /> : null}
                Post Thread
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
