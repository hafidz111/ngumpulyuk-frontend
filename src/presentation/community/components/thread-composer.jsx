import { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { SHELL_COPY } from '@/shared/copy/shell-copy';
import { Card } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { ThemedSearchField } from '@/presentation/components/themed-search-field';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { useAuth } from '@/presentation/auth/hooks/use-auth';
import { uploadThreadImage } from '@/infrastructure/storage/image-upload';

const MAX_THREAD_IMAGES = 3;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const FEED_COMMUNITY = 'feed';
const PILL_THRESHOLD = 4;

/**
 * @param {{
 *   options: { id: string; label: string }[];
 *   value: string;
 *   onChange: (id: string) => void;
 *   feedValue: string;
 *   feedLabel: string;
 *   searchPlaceholder: string;
 *   emptyLabel: string;
 *   manyHint: (n: number) => string;
 * }} props
 */
function SearchableOptionList({
  options,
  value,
  onChange,
  feedValue,
  feedLabel,
  searchPlaceholder,
  emptyLabel,
  manyHint,
}) {
  const [query, setQuery] = useState('');
  const usePills = options.length <= PILL_THRESHOLD;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  if (usePills) {
    return (
      <div className='flex flex-wrap gap-2'>
        <OptionPill
          active={value === feedValue}
          label={feedLabel}
          onClick={() => onChange(feedValue)}
        />
        {options.map((o) => (
          <OptionPill
            key={o.id}
            active={value === o.id}
            label={o.label}
            onClick={() => onChange(o.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <p className='text-[11px] text-muted-foreground'>{manyHint(options.length)}</p>
      <ThemedSearchField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        inputClassName='h-10 rounded-2xl pl-10 text-sm'
      />
      <div
        className='max-h-44 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-border/50 bg-muted/20 p-1 [scrollbar-width:thin]'
        role='listbox'
      >
        <OptionRow
          active={value === feedValue}
          label={feedLabel}
          onClick={() => onChange(feedValue)}
        />
        {filtered.length === 0 ? (
          <p className='px-3 py-4 text-center text-xs text-muted-foreground'>{emptyLabel}</p>
        ) : (
          filtered.map((o) => (
            <OptionRow
              key={o.id}
              active={value === o.id}
              label={o.label}
              onClick={() => onChange(o.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OptionPill({ active, label, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'max-w-full truncate rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-[#FF8000] text-white'
          : 'bg-muted/60 text-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  );
}

function OptionRow({ active, label, onClick }) {
  return (
    <button
      type='button'
      role='option'
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
        active
          ? 'bg-[#FF8000]/10 text-[#FF8000]'
          : 'text-foreground hover:bg-white/80',
      )}
    >
      <span className='min-w-0 truncate'>{label}</span>
      {active ? <Check className='size-4 shrink-0' aria-hidden /> : null}
    </button>
  );
}

/**
 * @param {{
 *   onPost: (payload: Record<string, unknown>) => Promise<void>;
 *   communities?: { id: string|number; name: string }[];
 *   events?: { id: string|number; title: string }[];
 *   autoSelectSingleCommunity?: boolean;
 * }} props
 */
export function ThreadComposer({
  onPost,
  communities = [],
  events = [],
  autoSelectSingleCommunity = false,
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCirclePicker, setShowCirclePicker] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(FEED_COMMUNITY);
  const [selectedEvent, setSelectedEvent] = useState('none');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const lockedCommunity = useMemo(() => {
    if (!autoSelectSingleCommunity || communities.length !== 1) return null;
    return communities[0];
  }, [autoSelectSingleCommunity, communities]);

  const communityOptions = useMemo(
    () =>
      communities.map((c) => ({
        id: String(c.id),
        label: String(c.name || 'Circle'),
      })),
    [communities],
  );

  const eventOptions = useMemo(
    () =>
      events.map((ev) => ({
        id: String(ev.id),
        label: String(ev.title || 'Event'),
      })),
    [events],
  );

  const canPickCircle = !lockedCommunity && communityOptions.length > 0;
  const hasEvents = eventOptions.length > 0;

  useEffect(() => {
    if (lockedCommunity) {
      setSelectedCommunity(String(lockedCommunity.id));
      return;
    }
    setSelectedCommunity(FEED_COMMUNITY);
  }, [lockedCommunity]);

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
    const allowedCount = Math.max(0, MAX_THREAD_IMAGES - imageFiles.length);
    const filtered = picked
      .filter((file) => validTypes.includes(file.type) && file.size <= MAX_IMAGE_SIZE)
      .slice(0, allowedCount);

    if (filtered.length < picked.length) {
      toast.error(SHELL_COPY.threadComposer.imageError);
    }
    if (filtered.length === 0) {
      event.target.value = '';
      return;
    }

    setImageFiles((prev) => [...prev, ...filtered]);
    setImagePreviews((prev) => [
      ...prev,
      ...filtered.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = '';
  }

  function removeImage(index) {
    setImagePreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== index);
    });
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  function resetForm() {
    setExpanded(false);
    setContent('');
    setSelectedEvent('none');
    setShowCirclePicker(false);
    setShowEventPicker(false);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    if (lockedCommunity) {
      setSelectedCommunity(String(lockedCommunity.id));
    } else {
      setSelectedCommunity(FEED_COMMUNITY);
    }
  }

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const communityId =
        selectedCommunity !== FEED_COMMUNITY ? selectedCommunity : undefined;
      const eventId =
        selectedEvent && selectedEvent !== 'none' ? selectedEvent : undefined;
      const uploadedImages =
        imageFiles.length > 0
          ? await Promise.all(imageFiles.map((file) => uploadThreadImage(file)))
          : [];

      await onPost({
        content: content.trim(),
        images: uploadedImages,
        ...(communityId ? { community_id: communityId } : {}),
        ...(eventId ? { related_event_id: eventId } : {}),
      });
      resetForm();
    } catch {
      // error handled by parent
    } finally {
      setPosting(false);
    }
  }

  const placeholder = lockedCommunity
    ? SHELL_COPY.threadComposer.placeholderCommunity(lockedCommunity.name)
    : SHELL_COPY.threadComposer.placeholder;

  const selectedCircleName =
    selectedCommunity === FEED_COMMUNITY
      ? SHELL_COPY.threadComposer.circleFeed
      : communityOptions.find((c) => c.id === selectedCommunity)?.label;

  const selectedEventName =
    selectedEvent === 'none'
      ? null
      : eventOptions.find((e) => e.id === selectedEvent)?.label;

  const circleButtonLabel =
    selectedCommunity !== FEED_COMMUNITY && selectedCircleName
      ? selectedCircleName
      : SHELL_COPY.threadComposer.pickCircle;

  const eventButtonLabel = selectedEventName || SHELL_COPY.threadComposer.pickEvent;

  return (
    <Card className='overflow-hidden border border-[#FF8000]/15 bg-gradient-to-b from-[#FFF1E5]/40 to-white p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <Avatar className='size-10 shrink-0 ring-2 ring-white'>
          <AvatarFallback
            className={`${colorClassForUser(user)} text-sm font-bold`}
          >
            {initial()}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0 flex-1 space-y-3'>
          {!expanded ? (
            <button
              type='button'
              onClick={() => setExpanded(true)}
              className='flex h-12 w-full items-center rounded-full border border-border/60 bg-white px-4 text-left text-sm text-muted-foreground shadow-sm transition hover:border-border hover:bg-muted/30'
            >
              {lockedCommunity
                ? SHELL_COPY.threadComposer.placeholderCommunity(lockedCommunity.name)
                : SHELL_COPY.threadComposer.expandPrompt}
            </button>
          ) : (
            <>
          {lockedCommunity ? (
            <span className='inline-flex max-w-full items-center rounded-full bg-[#FF8000]/10 px-3 py-1 text-xs font-semibold text-[#FF8000]'>
              {SHELL_COPY.threadComposer.postingIn(lockedCommunity.name)}
            </span>
          ) : null}

          {!lockedCommunity && selectedCommunity !== FEED_COMMUNITY && selectedCircleName ? (
            <span className='inline-flex max-w-full items-center gap-1 rounded-full bg-[#FF8000]/10 px-3 py-1 text-xs font-semibold text-[#FF8000]'>
              <span className='truncate'>
                {SHELL_COPY.threadComposer.selectedCircle(selectedCircleName)}
              </span>
              <button
                type='button'
                onClick={() => setSelectedCommunity(FEED_COMMUNITY)}
                className='shrink-0 rounded-full p-0.5 hover:bg-[#FF8000]/20'
                aria-label='Ganti ke feed umum'
              >
                <X className='size-3' />
              </button>
            </span>
          ) : null}

          {selectedEventName ? (
            <span className='inline-flex max-w-full items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700'>
              <span className='truncate'>Event: {selectedEventName}</span>
              <button
                type='button'
                onClick={() => setSelectedEvent('none')}
                className='shrink-0 rounded-full p-0.5 hover:bg-sky-500/20'
                aria-label='Hapus link event'
              >
                <X className='size-3' />
              </button>
            </span>
          ) : null}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            autoFocus
            className='min-h-[88px] w-full resize-none rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-[#FF8000]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8000]/15'
            maxLength={2000}
          />

          {imagePreviews.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {imagePreviews.map((preview, idx) => (
                <div
                  key={`${preview}-${idx}`}
                  className='relative size-20 overflow-hidden rounded-xl border border-border/60'
                >
                  <img src={preview} alt='' className='h-full w-full object-cover' />
                  <button
                    type='button'
                    onClick={() => removeImage(idx)}
                    className='absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-black/65 text-white'
                    aria-label='Hapus gambar'
                  >
                    <X className='size-3.5' />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {showCirclePicker && canPickCircle ? (
            <div className='rounded-2xl border border-border/60 bg-white p-3 shadow-sm'>
              <p className='mb-2 text-xs font-semibold text-muted-foreground'>
                {SHELL_COPY.threadComposer.circleLabel}
              </p>
              <SearchableOptionList
                options={communityOptions}
                value={selectedCommunity}
                onChange={setSelectedCommunity}
                feedValue={FEED_COMMUNITY}
                feedLabel={SHELL_COPY.threadComposer.circleFeed}
                searchPlaceholder={SHELL_COPY.threadComposer.circleSearchPlaceholder}
                emptyLabel={SHELL_COPY.threadComposer.circleNotFound}
                manyHint={SHELL_COPY.threadComposer.circleManyHint}
              />
            </div>
          ) : null}

          {showEventPicker ? (
            <div className='rounded-2xl border border-sky-200/60 bg-sky-50/40 p-3'>
              <p className='mb-2 text-xs font-semibold text-muted-foreground'>
                {SHELL_COPY.threadComposer.eventLabel}
              </p>
              {hasEvents ? (
                <SearchableOptionList
                  options={eventOptions}
                  value={selectedEvent}
                  onChange={setSelectedEvent}
                  feedValue='none'
                  feedLabel={SHELL_COPY.threadComposer.eventNone}
                  searchPlaceholder={SHELL_COPY.threadComposer.eventSearchPlaceholder}
                  emptyLabel={SHELL_COPY.threadComposer.eventNotFound}
                  manyHint={SHELL_COPY.threadComposer.eventManyHint}
                />
              ) : (
                <div className='space-y-3 rounded-xl border border-dashed border-sky-200 bg-white px-4 py-5 text-center'>
                  <p className='text-sm font-semibold text-foreground'>
                    {SHELL_COPY.threadComposer.eventEmptyTitle}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {SHELL_COPY.threadComposer.eventEmptyHint}
                  </p>
                  <Button
                    asChild
                    variant='outline'
                    size='sm'
                    className='rounded-full border-sky-300 text-sky-800'
                  >
                    <Link to={ROUTES.events}>{SHELL_COPY.threadComposer.eventExploreCta}</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          {!lockedCommunity && !showCirclePicker && selectedCommunity === FEED_COMMUNITY ? (
            <p className='text-[11px] leading-relaxed text-muted-foreground'>
              {canPickCircle
                ? SHELL_COPY.threadComposer.feedHint
                : SHELL_COPY.threadComposer.circleNone}
            </p>
          ) : null}

          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3'>
            <div className='flex min-w-0 flex-1 flex-wrap items-center gap-1.5'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg,image/jpg,image/webp'
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
                className='h-9 rounded-full border-border/60 px-3 text-xs font-semibold'
              >
                <ImagePlus className='size-4 shrink-0' />
                {SHELL_COPY.threadComposer.photo}
                {imageFiles.length > 0
                  ? ` ${SHELL_COPY.threadComposer.photoCount(imageFiles.length, MAX_THREAD_IMAGES)}`
                  : ''}
              </Button>

              {canPickCircle ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setShowCirclePicker((v) => !v);
                    if (showEventPicker) setShowEventPicker(false);
                  }}
                  className={cn(
                    'h-9 max-w-[140px] rounded-full px-3 text-xs font-semibold sm:max-w-[180px]',
                    (showCirclePicker || selectedCommunity !== FEED_COMMUNITY) &&
                      'bg-[#FFF1E5] text-[#FF8000]',
                  )}
                  title={circleButtonLabel}
                >
                  <span className='truncate'>{circleButtonLabel}</span>
                  <ChevronDown
                    className={cn(
                      'ml-1 size-3.5 shrink-0 transition',
                      showCirclePicker && 'rotate-180',
                    )}
                  />
                </Button>
              ) : null}

              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowEventPicker((v) => !v);
                  if (showCirclePicker) setShowCirclePicker(false);
                }}
                className={cn(
                  'h-9 max-w-[160px] rounded-full px-3 text-xs font-semibold sm:max-w-[200px]',
                  (showEventPicker || selectedEvent !== 'none') &&
                    'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
                )}
                title={eventButtonLabel}
              >
                <span className='truncate'>{eventButtonLabel}</span>
                <ChevronDown
                  className={cn(
                    'ml-1 size-3.5 shrink-0 transition',
                    showEventPicker && 'rotate-180',
                  )}
                />
              </Button>
            </div>

            <Button
              type='button'
              onClick={handlePost}
              disabled={!content.trim() || posting}
              className='h-10 shrink-0 rounded-full bg-[#FF8000] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#FF8000]/90 disabled:opacity-50'
            >
              {posting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                SHELL_COPY.threadComposer.postButton
              )}
            </Button>
          </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
