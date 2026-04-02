import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { getAuthErrorMessage } from '@/application/auth/auth-error';
import { usersApi } from '@/infrastructure/users/users-api';
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Hand,
  Heart,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Target,
  User,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/presentation/components/ui/button';
import { Calendar } from '@/presentation/components/ui/calendar';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
import { Progress } from '@/presentation/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Separator } from '@/presentation/components/ui/separator';
import { useAuth } from '../auth/hooks/use-auth';
import {
  ACTIVITY_LEVEL_OPTIONS,
  AREA_OPTIONS,
  EVENT_TIME_OPTIONS,
  MIN_INTEREST_SELECTIONS,
  ONBOARDING_ACTIVITIES,
} from './onboarding-data';
import { eventTimeIconMap, onboardingActivityIconMap } from './onboarding-icon-maps';
import { mapOnboardingApiBody } from './map-onboarding-api-body';

const TOTAL_STEPS = 4;

function toggleTimeSlot(setState, id) {
  setState((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
}

export default function OnboardingPage() {
  const { isAuthenticated, user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [birthDate, setBirthDate] = useState(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [gender, setGender] = useState('');

  const [selectedActivityIds, setSelectedActivityIds] = useState(() => new Set());
  const [customActivities, setCustomActivities] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const [locationAreaId, setLocationAreaId] = useState('');
  const [timeSlotIds, setTimeSlotIds] = useState(() => new Set());
  const [activityLevel, setActivityLevel] = useState('');

  const [stepError, setStepError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  const interestCount = useMemo(() => {
    return selectedActivityIds.size + customActivities.length;
  }, [selectedActivityIds, customActivities]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (user?.isOnboarded) {
    return <Navigate to={ROUTES.home} replace />;
  }

  function toggleActivity(id) {
    setSelectedActivityIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function addCustomActivity() {
    const t = customInput.trim();
    if (t.length < 2) return;
    const key = t.toLowerCase();
    if (customActivities.some((c) => c.toLowerCase() === key)) {
      setCustomInput('');
      return;
    }
    setCustomActivities((prev) => [...prev, t]);
    setCustomInput('');
  }

  function removeCustomActivity(tag) {
    setCustomActivities((prev) => prev.filter((x) => x !== tag));
  }

  function handleBack() {
    setStepError('');
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleNext() {
    if (step === 1) {
      if (!birthDate || !gender) {
        setStepError('Lengkapi tanggal lahir dan gender dulu, ya.');
        return;
      }
    }
    if (step === 2) {
      if (interestCount < MIN_INTEREST_SELECTIONS) {
        setStepError(`Pilih minimal ${MIN_INTEREST_SELECTIONS} aktivitas (bisa dari daftar atau tambah sendiri).`);
        return;
      }
    }
    if (step === 3) {
      if (!locationAreaId) {
        setStepError('Pilih area lokasi kamu dulu.');
        return;
      }
      if (timeSlotIds.size === 0) {
        setStepError('Pilih minimal satu waktu event yang kamu suka.');
        return;
      }
      if (!activityLevel) {
        setStepError('Pilih level aktivitas kamu.');
        return;
      }
    }

    setStepError('');
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    if (!birthDate || !gender) {
      setStepError('Data pribadi tidak lengkap.');
      return;
    }

    setIsCompleting(true);
    try {
      const body = mapOnboardingApiBody({
        birthDate,
        gender,
        selectedActivityIds,
        customActivities,
        locationAreaId,
        timeSlotIds,
      });
      await usersApi.completeOnboarding(body);
      completeOnboarding();
      toast.success('Onboarding selesai. Selamat datang!', { duration: 4000 });
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      const msg = getAuthErrorMessage(err, 'Gagal menyimpan data onboarding.');
      setStepError(msg);
      toast.error(msg, { duration: 4000 });
    } finally {
      setIsCompleting(false);
    }
  }

  const containerClass =
    step === 2 || step === 3 || step === 4 ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className='min-h-svh bg-surface px-4 py-8 md:px-6 md:py-12'>
      <div className={cn('mx-auto w-full', containerClass)}>
        <div className='mb-8 space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className='font-bold text-primary-container'>
              {progressPercent}% Complete
            </span>
          </div>
          <div
            className={cn(
              '[&_[data-slot=progress]]:h-1.5 [&_[data-slot=progress]]:bg-muted/80 [&_[data-slot=progress-indicator]]:bg-primary-container',
            )}
          >
            <Progress value={progressPercent} className='h-1.5' />
          </div>
        </div>

        <Card className='border-0 bg-card shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.08)] rounded-[1.75rem]'>
          <div className='p-6 md:p-10'>
            {step === 1 ? (
              <>
                <div className='mb-6 flex flex-col items-center text-center'>
                  <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-container/15 text-primary-container shadow-sm'>
                    <Hand className='size-7' strokeWidth={2} aria-hidden />
                  </div>
                  <h1 className='font-display text-2xl font-bold text-foreground'>
                    Halo! Selamat Datang!
                  </h1>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Yuk kita kenalan dulu biar rekomendasi event-nya lebih cocok
                  </p>
                </div>

                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                      <CalendarIcon
                        className='size-4 text-primary-container'
                        aria-hidden
                      />
                      Tanggal Lahir
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          className={cn(
                            'relative flex h-12 w-full items-center rounded-full border border-border bg-muted/40 px-4 text-left text-sm outline-none transition-colors',
                            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            !birthDate && 'text-muted-foreground',
                          )}
                        >
                          {birthDate
                            ? format(birthDate, 'dd/MM/yyyy')
                            : 'dd/mm/yyyy'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          fromYear={1940}
                          toYear={new Date().getFullYear()}
                          defaultMonth={birthDate ?? new Date(2000, 0)}
                          selected={birthDate}
                          onSelect={(d) => {
                            setBirthDate(d);
                            setCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                      <User
                        className='size-4 text-primary-container'
                        aria-hidden
                      />
                      Gender
                    </label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className='h-12 w-full rounded-full border-border bg-muted/40 px-4 text-left'>
                        <SelectValue placeholder='Pilih gender' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Laki-laki</SelectItem>
                        <SelectItem value='female'>Perempuan</SelectItem>
                        <SelectItem value='other'>Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className='mb-6 flex flex-col items-center text-center'>
                  <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-container/15 text-primary-container shadow-sm'>
                    <Heart className='size-7' strokeWidth={2} aria-hidden />
                  </div>
                  <h2 className='font-display text-xl font-bold text-foreground md:text-2xl'>
                    Apa yang Kamu Suka?
                  </h2>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Pilih minimal {MIN_INTEREST_SELECTIONS} aktivitas yang kamu minati
                  </p>
                  <p className='mt-3 text-sm font-bold text-primary-container'>
                    {interestCount} dipilih
                  </p>
                </div>

                <div className='grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4'>
                  {ONBOARDING_ACTIVITIES.map((act) => {
                    const selected = selectedActivityIds.has(act.id);
                    const ActivityIcon = onboardingActivityIconMap[act.id];
                    return (
                      <button
                        key={act.id}
                        type='button'
                        onClick={() => toggleActivity(act.id)}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 text-center transition-colors',
                          'min-h-[5.5rem] sm:min-h-[6rem]',
                          selected
                            ? 'border-primary-container bg-primary-container/10 shadow-sm'
                            : 'border-border bg-card hover:border-muted-foreground/40',
                        )}
                      >
                        {ActivityIcon ? (
                          <ActivityIcon
                            className='size-7 shrink-0 text-primary-container'
                            strokeWidth={2}
                            aria-hidden
                          />
                        ) : null}
                        <span className='text-[0.65rem] font-semibold leading-tight text-foreground sm:text-xs'>
                          {act.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className='mt-6 space-y-3'>
                  <Label htmlFor='custom-activity' className='text-sm font-semibold'>
                    Olahraga atau aktivitas lain
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      id='custom-activity'
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomActivity();
                        }
                      }}
                      placeholder='Contoh: Voli, Panahan, Senam…'
                      className='h-11 rounded-full border-border bg-muted/30'
                    />
                    <Button
                      type='button'
                      variant='secondary'
                      className='shrink-0 rounded-full px-4'
                      onClick={addCustomActivity}
                    >
                      Tambah
                    </Button>
                  </div>
                  {customActivities.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {customActivities.map((tag) => (
                        <span
                          key={tag}
                          className='inline-flex items-center gap-1 rounded-full border border-primary-container/40 bg-primary-container/10 px-3 py-1 text-xs font-medium text-foreground'
                        >
                          {tag}
                          <button
                            type='button'
                            className='rounded-full p-0.5 hover:bg-primary-container/20'
                            onClick={() => removeCustomActivity(tag)}
                            aria-label={`Hapus ${tag}`}
                          >
                            <X className='size-3.5' />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <div className='space-y-8'>
                <div className='flex flex-col items-center text-center'>
                  <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-container/15 text-primary-container shadow-sm'>
                    <SlidersHorizontal className='size-7' strokeWidth={2} aria-hidden />
                  </div>
                  <h2 className='font-display text-xl font-bold text-foreground md:text-2xl'>
                    Preferensi Kamu
                  </h2>
                  <p className='mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground'>
                    Biar kami bisa rekomendasiin event yang pas banget
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='onboarding-area'
                    className='flex items-center gap-2 text-sm font-bold text-foreground'
                  >
                    <MapPin className='size-4 text-primary-container' aria-hidden />
                    Lokasi Pilihan
                  </Label>
                  <Select value={locationAreaId} onValueChange={setLocationAreaId}>
                    <SelectTrigger
                      id='onboarding-area'
                      className='h-12 w-full rounded-xl border-border bg-muted/40 px-4 text-left'
                    >
                      <SelectValue placeholder='Pilih area' />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_OPTIONS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-3'>
                  <Label className='flex flex-wrap items-center gap-2 text-sm font-bold text-foreground'>
                    <Clock className='size-4 shrink-0 text-primary-container' aria-hidden />
                    <span>Waktu Favorit (bisa pilih lebih dari 1)</span>
                  </Label>
                  <div className='grid grid-cols-2 gap-3'>
                    {EVENT_TIME_OPTIONS.map((slot) => {
                      const on = timeSlotIds.has(slot.id);
                      const TimeIcon = eventTimeIconMap[slot.id];
                      return (
                        <button
                          key={slot.id}
                          type='button'
                          onClick={() => toggleTimeSlot(setTimeSlotIds, slot.id)}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-xl border-2 bg-card p-4 text-left transition-colors',
                            on
                              ? 'border-primary-container bg-primary-container/10 shadow-sm'
                              : 'border-border hover:border-muted-foreground/40',
                          )}
                        >
                          {TimeIcon ? (
                            <TimeIcon
                              className='size-7 shrink-0 text-primary-container'
                              strokeWidth={2}
                              aria-hidden
                            />
                          ) : null}
                          <span className='text-xs font-medium leading-snug text-foreground sm:text-sm'>
                            {slot.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='onboarding-level'
                    className='flex items-center gap-2 text-sm font-bold text-foreground'
                  >
                    <Target className='size-4 text-primary-container' aria-hidden />
                    Level Aktivitas
                  </Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger
                      id='onboarding-level'
                      className='h-12 w-full rounded-xl border-border bg-muted/40 px-4 text-left'
                    >
                      <SelectValue placeholder='Seberapa aktif kamu?' />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.title} ({opt.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className='space-y-8 text-center'>
                <div className='flex flex-col items-center'>
                  <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-container/15 text-primary-container shadow-sm'>
                    <CheckCircle2 className='size-7' strokeWidth={2} aria-hidden />
                  </div>
                  <div className='space-y-3'>
                    <h2 className='font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
                      Semua Siap!
                    </h2>
                    <p className='mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:text-base'>
                      Profil kamu udah lengkap. Sekarang kamu siap buat explore dan join
                      event-event seru di sekitarmu!
                    </p>
                  </div>
                </div>

                <div className='rounded-2xl bg-secondary/35 px-4 py-6 md:px-8 md:py-8'>
                  <ul className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-around sm:gap-4'>
                    <li className='flex flex-col items-center gap-3'>
                      <span className='flex size-12 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container'>
                        <Sparkles className='size-6' strokeWidth={2} aria-hidden />
                      </span>
                      <span className='max-w-[9rem] text-xs font-semibold leading-snug text-primary-container md:text-sm'>
                        AI Matcher Aktif
                      </span>
                    </li>
                    <li className='flex flex-col items-center gap-3'>
                      <span className='flex size-12 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container'>
                        <Heart className='size-6' strokeWidth={2} aria-hidden />
                      </span>
                      <span className='max-w-[9rem] text-xs font-semibold leading-snug text-primary-container md:text-sm'>
                        Personal Recommendations
                      </span>
                    </li>
                    <li className='flex flex-col items-center gap-3'>
                      <span className='flex size-12 items-center justify-center rounded-xl bg-primary-container/15 text-primary-container'>
                        <Target className='size-6' strokeWidth={2} aria-hidden />
                      </span>
                      <span className='max-w-[9rem] text-xs font-semibold leading-snug text-primary-container md:text-sm'>
                        Smart Matching
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}

            {stepError ? (
              <p className='mt-6 text-center text-sm text-destructive'>{stepError}</p>
            ) : null}

            <Separator className='my-8 bg-border/80' />

            {step === 1 ? (
              <Button
                type='button'
                disabled={isCompleting}
                onClick={() => void handleNext()}
                className='h-12 w-full rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
              >
                Lanjut
                <ArrowRight className='size-4' />
              </Button>
            ) : (
              <div className='flex flex-col gap-3 sm:flex-row sm:items-stretch'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isCompleting}
                  onClick={handleBack}
                  className='h-12 shrink-0 rounded-full border-border px-6 sm:w-auto'
                >
                  <ArrowLeft className='size-4' />
                  Back
                </Button>
                <Button
                  type='button'
                  disabled={isCompleting}
                  onClick={() => void handleNext()}
                  className='h-12 flex-1 rounded-full bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
                >
                  {step === TOTAL_STEPS
                    ? isCompleting
                      ? 'Menyimpan…'
                      : 'Mulai Ngumpul'
                    : 'Lanjut'}
                  <ArrowRight className='size-4' />
                </Button>
              </div>
            )}

            {step === 1 ? (
              <p className='mt-6 text-center text-xs text-muted-foreground'>
                Butuh bantuan?{' '}
                <button
                  type='button'
                  className='font-medium text-primary-container hover:underline'
                  onClick={() => {
                    completeOnboarding();
                    navigate(ROUTES.home, { replace: true });
                  }}
                >
                  Lewati dulu
                </button>
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
