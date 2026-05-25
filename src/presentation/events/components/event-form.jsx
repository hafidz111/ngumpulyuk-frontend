import { useCallback, useEffect, useRef, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Tag,
  Trophy,
  Type,
  Upload,
  Users,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { Calendar } from '@/presentation/components/ui/calendar';
import { Card } from '@/presentation/components/ui/card';
import { RequiredMark } from '@/presentation/components/required-mark';
import { ThemedInput, ThemedTextarea } from '@/presentation/components/themed-form-field';
import { isSameCalendarDay, TimeSelectField } from '@/presentation/components/time-select-field';
import { Label } from '@/presentation/components/ui/label';
import {
  APP_SHELL_FORM_PICKER_CLASS,
  APP_SHELL_FORM_PICKER_PLACEHOLDER_CLASS,
  APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS,
  APP_SHELL_FORM_SECTION_CLASS,
  APP_SHELL_FORM_SELECT_CLASS,
  APP_SHELL_FORM_UPLOAD_ZONE_CLASS,
  APP_SHELL_SECONDARY_BUTTON_CLASS,
} from '@/presentation/layout/app-shell-chrome';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
import { uploadEventCover } from '@/infrastructure/storage/image-upload';
import { getAuthErrorMessage } from '@/application/auth/auth-error';

import { eventsApi } from '@/infrastructure/events/events-api';

import { AREA_OPTIONS, DIFFICULTY_LEVELS, extractEventCategories } from '../event-data';
import {
  isEndDateBeforeStart,
  validateEventSchedule,
} from '../lib/validate-event-schedule';
import { MapPicker } from './map-picker';

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

/**
 * @param {{
 *   initialData?: Record<string, unknown>;
 *   onSubmit: (body: Record<string, unknown>) => Promise<void>;
 *   onCancel: () => void;
 *   submitLabel?: string;
 *   isEdit?: boolean;
 * }} props
 */
export function EventForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Buat Event',
  isEdit = false,
}) {
  const fileInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const [title, setTitle] = useState(initialData.title ?? '');
  const [category, setCategory] = useState(initialData.category ?? '');
  const [description, setDescription] = useState(initialData.description ?? '');
  const [eventDate, setEventDate] = useState(() => {
    if (initialData.event_date) return new Date(initialData.event_date);
    return undefined;
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventTime, setEventTime] = useState(initialData.event_time ?? '');

  const [endDate, setEndDate] = useState(() => {
    if (initialData.end_date) return new Date(initialData.end_date);
    return undefined;
  });
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [endTime, setEndTime] = useState(initialData.end_time ?? '');
  const [registrationDeadlineEnabled, setRegistrationDeadlineEnabled] = useState(
    Boolean(initialData.registration_deadline || initialData.registration_deadline_time),
  );
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState(() => {
    if (initialData.registration_deadline) return new Date(initialData.registration_deadline);
    return undefined;
  });
  const [registrationDeadlineCalendarOpen, setRegistrationDeadlineCalendarOpen] = useState(false);
  const registrationDeadlineTimeInputRef = useRef(null);
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState(
    initialData.registration_deadline_time ?? '',
  );
  const [locationArea, setLocationArea] = useState(initialData.location_area ?? '');
  const [locationAddress, setLocationAddress] = useState(
    initialData.location_address ?? '',
  );
  const [latitude, setLatitude] = useState(
    initialData.latitude != null ? String(initialData.latitude) : '',
  );
  const [longitude, setLongitude] = useState(
    initialData.longitude != null ? String(initialData.longitude) : '',
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialData.max_participants != null ? String(initialData.max_participants) : '',
  );
  const [isCompetition, setIsCompetition] = useState(
    initialData.is_competition ?? false,
  );
  const [difficultyLevel, setDifficultyLevel] = useState(
    initialData.difficulty_level ?? 'beginner',
  );
  const [tags, setTags] = useState(() =>
    Array.isArray(initialData.tags) ? initialData.tags : [],
  );
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryContainerRef = useRef(null);

  async function handleCreateCategory() {
    const newCatStr = toTitleCase(category.trim());
    setCategory(newCatStr);
    setCategories((prev) => [...prev, { name: newCatStr }]);
    setCategoryDropdownOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    if (!category.trim()) {
      const loadInitialCategories = async () => {
        try {
          const res = await eventsApi.list({ limit: 200, offset: 0 });
          const payload = res.data?.data || res.data;
          let events = [];
          if (Array.isArray(payload)) events = payload;
          else if (payload?.events) events = payload.events;
          else if (payload?.results) events = payload.results;
          if (active) setCategories(extractEventCategories(events));
        } catch {
          if (active) setCategories([]);
        }
      };
      loadInitialCategories();
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCategories(true);
      try {
        const res = await eventsApi.categories({ search: category });
        const data = res.data;
        let items = Array.isArray(data) ? data : (data?.data?.results || data?.data?.categories || data?.categories || data?.results || []);
        if (active) setCategories(items);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setIsSearchingCategories(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category]);

  const [coverUrl, setCoverUrl] = useState(initialData.cover_image ?? '');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialData.cover_image ?? '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Ukuran gambar maksimal 3MB.');
      return;
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      toast.error('File harus berupa gambar (PNG, JPG/JPEG, HEIC).');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeCoverImage() {
    setCoverFile(null);
    setCoverPreview('');
    setCoverUrl('');
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((x) => x !== tag));
  }

  const handleMapChange = useCallback((lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  useEffect(() => {
    if (!eventDate || !endDate) {
      setScheduleError('');
      return;
    }
    setScheduleError(
      validateEventSchedule({ eventDate, eventTime, endDate, endTime }) ?? '',
    );
  }, [eventDate, eventTime, endDate, endTime]);

  const sameDaySchedule =
    eventDate && endDate && isSameCalendarDay(eventDate, endDate);

  useEffect(() => {
    if (eventDate && endDate && isEndDateBeforeStart(eventDate, endDate)) {
      setEndDate(undefined);
    }
  }, [eventDate, endDate]);

  useEffect(() => {
    if (!sameDaySchedule || !eventTime.trim() || !endTime.trim()) return;
    if (endTime <= eventTime.trim()) {
      setEndTime('');
    }
  }, [sameDaySchedule, eventTime, endTime]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setScheduleError('');

    if (!title.trim()) {
      setFormError('Judul event wajib diisi.');
      return;
    }
    if (!category) {
      setFormError('Pilih kategori event.');
      return;
    }
    if (!description.trim()) {
      setFormError('Deskripsi event wajib diisi.');
      return;
    }
    if (!eventDate) {
      setFormError('Tanggal event wajib diisi.');
      return;
    }
    if (!eventTime.trim()) {
      setFormError('Waktu event wajib diisi.');
      return;
    }
    if (!endDate) {
      setFormError('Tanggal selesai wajib diisi.');
      return;
    }
    if (!endTime.trim()) {
      setFormError('Waktu selesai wajib diisi.');
      return;
    }

    const scheduleValidation = validateEventSchedule({
      eventDate,
      eventTime,
      endDate,
      endTime,
    });
    if (scheduleValidation) {
      setScheduleError(scheduleValidation);
      setFormError(scheduleValidation);
      return;
    }

    if (!locationArea) {
      setFormError('Pilih area lokasi.');
      return;
    }
    if (!locationAddress.trim()) {
      setFormError('Alamat lengkap wajib diisi.');
      return;
    }
    if (!maxParticipants || Number(maxParticipants) < 1) {
      setFormError('Jumlah peserta minimal 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCoverUrl = coverUrl;
      if (coverFile) {
        setIsUploadingImage(true);
        try {
          finalCoverUrl = await uploadEventCover(coverFile);
        } catch (err) {
          toast.error('Gagal upload gambar: ' + (err.message || 'Unknown error'));
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      const body = {
        title: title.trim(),
        description: description.trim(),
        category: toTitleCase(category.trim()),
        cover_image: finalCoverUrl || '',
        event_date: format(eventDate, 'yyyy-MM-dd'),
        event_time: eventTime.trim(),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        end_time: endTime.trim() || null,
        registration_deadline: format(
          registrationDeadlineEnabled
            ? (registrationDeadlineDate || eventDate)
            : eventDate,
          'yyyy-MM-dd',
        ),
        registration_deadline_time: registrationDeadlineEnabled
          ? (registrationDeadlineTime.trim() || eventTime.trim() || null)
          : (eventTime.trim() || null),
        location_area: locationArea,
        location_address: locationAddress.trim(),
        latitude: latitude || '',
        longitude: longitude || '',
        max_participants: Number(maxParticipants),
        is_competition: isCompetition,
        difficulty_level: difficultyLevel,
        tags: tags.length > 0 ? tags : [],
      };

      await onSubmit(body);
    } catch (err) {
      const msg = getAuthErrorMessage(err, 'Gagal menyimpan event.');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Cover Image Upload */}
      <Card className='border-0 bg-card shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.06)] rounded-[1.75rem] overflow-hidden'>
        <div className='p-6 md:p-8 space-y-6'>
          <div className='space-y-3'>
            <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <ImageIcon className='size-4 text-primary-container' aria-hidden />
              Cover Image Event
            </Label>
            {coverPreview ? (
              <div className='relative group'>
                <img
                  src={coverPreview}
                  alt='Preview cover'
                  className='h-48 w-full rounded-2xl object-cover border border-border/50 md:h-56'
                />
                <button
                  type='button'
                  onClick={removeCoverImage}
                  className='absolute right-3 top-3 rounded-full bg-foreground/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground/90'
                >
                  <X className='size-4' />
                </button>
              </div>
            ) : (
              <label className={cn('cursor-pointer py-10', APP_SHELL_FORM_UPLOAD_ZONE_CLASS)}>
                <div className='rounded-xl bg-muted/50 p-3'>
                  <Upload className='size-6 text-muted-foreground' />
                </div>
                <div className='text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    Upload foto cover event (Opsional)
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    PNG, JPG, HEIC hingga 3MB
                  </p>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className={cn('mt-1 rounded-full px-6', APP_SHELL_SECONDARY_BUTTON_CLASS)}
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  Pilih File
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/png, image/jpeg, image/jpg, image/heic'
                  onChange={handleImageChange}
                  className='sr-only'
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='event-title' className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <Type className='size-4 text-primary-container' aria-hidden />
              Judul Event <RequiredMark />
            </Label>
            <ThemedInput
              id='event-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Contoh: Morning Run Sudirman'
            />
          </div>

          {/* Category */}
          <div className='space-y-2 relative' ref={categoryContainerRef}>
            <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <Tag className='size-4 text-primary-container' aria-hidden />
              Kategori Event <RequiredMark />
            </Label>
            <div className='relative'>
              <ThemedInput
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCategoryDropdownOpen(true);
                }}
                onFocus={() => setCategoryDropdownOpen(true)}
                placeholder='Ketik atau pilih kategori...'
                autoComplete='off'
              />

              {categoryDropdownOpen && (
                <div className='absolute left-0 top-full z-[1010] mt-2 flex max-h-[16rem] w-full flex-col overflow-y-auto rounded-xl border border-border/60 bg-white shadow-lg'>
                  {isSearchingCategories && <div className='p-3 text-center text-sm text-muted-foreground'>Pencarian...</div>}

                  {!isSearchingCategories && categories.map((c, i) => {
                    const label = typeof c === 'string' ? c : c.name || c.label || c.id;
                    if (!label) return null;
                    return (
                      <button
                        key={i}
                        type='button'
                        onClick={() => {
                          setCategory(label);
                          setCategoryDropdownOpen(false);
                        }}
                        className='border-b border-border/40 bg-white px-4 py-2.5 text-left text-sm last:border-0 hover:bg-muted/50 focus:bg-muted/50'
                      >
                        {toTitleCase(label)}
                      </button>
                    );
                  })}

                  {!isSearchingCategories && category.trim() && !categories.some(c => {
                    const label = typeof c === 'string' ? c : c.name || c.label || c.id;
                    return label && label.toLowerCase() === category.trim().toLowerCase();
                  }) && (
                      <button
                        type='button'
                        onClick={handleCreateCategory}
                        className='border-b border-border/40 bg-white px-4 py-2.5 text-left text-sm font-medium text-primary-container last:border-0 hover:bg-muted/50 focus:bg-muted/50'
                      >
                        Buat kategori baru: "{toTitleCase(category.trim())}"
                      </button>
                    )}

                  {!isSearchingCategories && categories.length === 0 && !category.trim() && (
                    <div className='p-3 text-center text-sm text-muted-foreground'>Ketik untuk mencari kategori lain</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='event-desc' className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <FileText className='size-4 text-primary-container' aria-hidden />
              Deskripsi Event <RequiredMark />
            </Label>
            <ThemedTextarea
              id='event-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Ceritain tentang event-mu...'
              rows={4}
            />
          </div>

          {/* Date & Time */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <CalendarIcon className='size-4 text-primary-container' aria-hidden />
                Tanggal <RequiredMark />
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    className={cn(
                      APP_SHELL_FORM_PICKER_CLASS,
                      !eventDate && APP_SHELL_FORM_PICKER_PLACEHOLDER_CLASS,
                    )}
                  >
                    {eventDate ? format(eventDate, 'dd/MM/yyyy') : 'Pilih tanggal'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-auto border border-border/60 bg-white p-0 shadow-lg' align='start'>
                  <Calendar
                    className='bg-white'
                    mode='single'
                    selected={eventDate}
                    onSelect={(d) => {
                      setEventDate(d);
                      if (d && endDate && isBefore(startOfDay(endDate), startOfDay(d))) {
                        setEndDate(undefined);
                      }
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='event-time' className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <Clock className='size-4 text-primary-container' aria-hidden />
                Waktu <RequiredMark />
              </Label>
              <ThemedInput
                ref={timeInputRef}
                id='event-time'
                type='time'
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                onClick={() => timeInputRef.current?.showPicker?.()}
                onFocus={() => timeInputRef.current?.showPicker?.()}
                className='cursor-text'
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <CalendarIcon className='size-4 text-primary-container' aria-hidden />
                Tanggal Selesai <RequiredMark />
              </Label>
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    className={cn(
                      APP_SHELL_FORM_PICKER_CLASS,
                      !endDate && APP_SHELL_FORM_PICKER_PLACEHOLDER_CLASS,
                    )}
                  >
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Pilih tanggal selesai'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-auto border border-border/60 bg-white p-0 shadow-lg' align='start'>
                  <Calendar
                    className='bg-white'
                    mode='single'
                    selected={endDate}
                    disabled={(date) =>
                      eventDate ? isBefore(startOfDay(date), startOfDay(eventDate)) : false
                    }
                    onSelect={(d) => {
                      if (d && eventDate && isEndDateBeforeStart(eventDate, d)) return;
                      setEndDate(d);
                      setEndCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='event-end-time' className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <Clock className='size-4 text-primary-container' aria-hidden />
                Waktu Selesai <RequiredMark />
              </Label>
              {sameDaySchedule ? (
                <TimeSelectField
                  id='event-end-time'
                  value={endTime}
                  onValueChange={setEndTime}
                  minExclusive={eventTime.trim() || undefined}
                  placeholder={
                    eventTime.trim()
                      ? 'Pilih jam setelah jam mulai'
                      : 'Isi jam mulai dulu'
                  }
                  invalid={Boolean(scheduleError)}
                />
              ) : (
                <ThemedInput
                  id='event-end-time'
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={cn('cursor-text', scheduleError && 'border-destructive/60')}
                />
              )}
            </div>
          </div>

          {scheduleError ? (
            <p className='text-sm font-medium text-destructive' role='alert'>
              {scheduleError}
            </p>
          ) : null}

          {/* Registration Deadline */}
          <div className={APP_SHELL_FORM_SECTION_CLASS}>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <CalendarIcon className='size-4 text-primary-container' aria-hidden />
                  Batas Registrasi Event
                </Label>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Jika tidak diaktifkan, batas registrasi otomatis mengikuti tanggal & waktu mulai event.
                </p>
              </div>
              <Switch
                checked={registrationDeadlineEnabled}
                onCheckedChange={setRegistrationDeadlineEnabled}
              />
            </div>

            {registrationDeadlineEnabled ? (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-foreground'>
                    Tanggal Batas Registrasi (Opsional)
                  </Label>
                  <Popover
                    open={registrationDeadlineCalendarOpen}
                    onOpenChange={setRegistrationDeadlineCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        className={cn(
                          APP_SHELL_FORM_PICKER_CLASS,
                          !registrationDeadlineDate && APP_SHELL_FORM_PICKER_PLACEHOLDER_CLASS,
                        )}
                      >
                        {registrationDeadlineDate
                          ? format(registrationDeadlineDate, 'dd/MM/yyyy')
                          : 'Ikuti tanggal mulai event'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto border border-border/60 bg-white p-0 shadow-lg' align='start'>
                      <Calendar
                        className='bg-white'
                        mode='single'
                        selected={registrationDeadlineDate}
                        onSelect={(d) => {
                          setRegistrationDeadlineDate(d);
                          setRegistrationDeadlineCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='registration-deadline-time' className='text-sm font-semibold text-foreground'>
                    Waktu Batas Registrasi (Opsional)
                  </Label>
                  <ThemedInput
                    ref={registrationDeadlineTimeInputRef}
                    id='registration-deadline-time'
                    type='time'
                    value={registrationDeadlineTime}
                    onChange={(e) => setRegistrationDeadlineTime(e.target.value)}
                    onClick={() => registrationDeadlineTimeInputRef.current?.showPicker?.()}
                    onFocus={() => registrationDeadlineTimeInputRef.current?.showPicker?.()}
                    className='cursor-text'
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Location Area & Address */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <MapPin className='size-4 text-primary-container' aria-hidden />
              Area Lokasi <RequiredMark />
            </Label>
            <Select value={locationArea} onValueChange={setLocationArea}>
              <SelectTrigger className={APP_SHELL_FORM_SELECT_CLASS}>
                <SelectValue placeholder='Pilih area' />
              </SelectTrigger>
              <SelectContent
                className={APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS}
                position='popper'
              >
                {AREA_OPTIONS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='event-address' className='text-sm font-bold text-foreground'>
              Alamat Lengkap <RequiredMark />
            </Label>
            <ThemedInput
              id='event-address'
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder='Contoh: Gelora Bung Karno, Gate 1'
            />
          </div>

          {/* Map Picker */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <MapPin className='size-4 text-primary-container' aria-hidden />
              Pilih Lokasi di Peta
            </Label>
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleMapChange}
            />
          </div>

          {/* Max Participants */}
          <div className='space-y-2'>
            <Label htmlFor='event-max-p' className='flex items-center gap-2 text-sm font-bold text-foreground'>
              <Users className='size-4 text-primary-container' aria-hidden />
              Maksimal Peserta <RequiredMark />
            </Label>
            <ThemedInput
              id='event-max-p'
              type='number'
              min='1'
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder='Contoh: 20'
            />
          </div>

          {/* Competition & Difficulty */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-3'>
              <Label className='flex items-center gap-2 text-sm font-bold text-foreground'>
                <Trophy className='size-4 text-primary-container' aria-hidden />
                Kompetisi
              </Label>
              <div className='flex items-center gap-3'>
                <Switch
                  checked={isCompetition}
                  onCheckedChange={setIsCompetition}
                />
                <span className='text-sm text-muted-foreground'>
                  {isCompetition ? 'Ya, ini event kompetisi' : 'Bukan kompetisi'}
                </span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-bold text-foreground'>
                Level Kesulitan
              </Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger className={APP_SHELL_FORM_SELECT_CLASS}>
                  <SelectValue placeholder='Pilih level' />
                </SelectTrigger>
                <SelectContent
                  className={APP_SHELL_FORM_DROPDOWN_CONTENT_CLASS}
                  position='popper'
                >
                  {DIFFICULTY_LEVELS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className='space-y-3'>
            <Label className='text-sm font-bold text-foreground'>
              Tags (Opsional)
            </Label>
            <div className='flex gap-2'>
              <ThemedInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder='Tambah tag...'
                className='h-11'
              />
              <Button
                type='button'
                variant='secondary'
                className='shrink-0 rounded-xl px-3'
                onClick={addTag}
              >
                <Plus className='size-4' />
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 rounded-full border border-primary-container/40 bg-primary-container/10 px-3 py-1 text-xs font-medium text-foreground'
                  >
                    {tag}
                    <button
                      type='button'
                      className='rounded-full p-0.5 hover:bg-primary-container/20'
                      onClick={() => removeTag(tag)}
                    >
                      <X className='size-3.5' />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Error */}
      {formError ? (
        <p className='text-center text-sm text-destructive'>{formError}</p>
      ) : null}

      {/* Actions */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button
          type='button'
          variant='ghost'
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn('h-12 flex-1', APP_SHELL_SECONDARY_BUTTON_CLASS)}
        >
          <ArrowLeft className='size-4' />
          Batal
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='h-12 flex-1 rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              {isUploadingImage ? 'Mengupload gambar…' : 'Menyimpan…'}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
