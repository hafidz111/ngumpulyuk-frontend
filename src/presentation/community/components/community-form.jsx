import { useState, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { RequiredMark } from '@/presentation/components/required-mark';
import { Button } from '@/presentation/components/ui/button';
import { ButtonBusySkeleton } from '@/presentation/components/skeletons';
import { Label } from '@/presentation/components/ui/label';
import { ThemedInput, ThemedTextarea } from '@/presentation/components/themed-form-field';
import {
  APP_SHELL_FORM_UPLOAD_ZONE_CLASS,
  APP_SHELL_SECONDARY_BUTTON_CLASS,
} from '@/presentation/layout/app-shell-chrome';
import { uploadEventCover } from '@/infrastructure/storage/image-upload';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function CommunityForm({ onSubmit, onCancel, submitLabel = 'Buat Community' }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Cover image
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function handleFileSelect(file, setFile, setPreview) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file maksimal 3MB.');
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) { setFormError('Nama komunitas wajib diisi.'); return; }
    if (!description.trim()) { setFormError('Deskripsi wajib diisi.'); return; }
    if (!category.trim()) { setFormError('Kategori wajib diisi.'); return; }

    setSubmitting(true);
    try {
      let coverUrl = '';
      if (coverFile) {
        coverUrl = await uploadEventCover(coverFile);
      }

      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        cover_image: coverUrl,
      });
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Gagal membuat komunitas.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {formError ? (
        <div className='rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive'>
          {formError}
        </div>
      ) : null}

      {/* Cover Image */}
      <div className='space-y-2'>
        <Label className='text-sm font-bold text-foreground'>Cover Image</Label>
        <input
          ref={coverRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => handleFileSelect(e.target.files?.[0], setCoverFile, setCoverPreview)}
        />
        {coverPreview ? (
          <div className='relative overflow-hidden rounded-xl'>
            <img src={coverPreview} alt='' className='aspect-[16/9] w-full object-cover' />
            <button
              type='button'
              onClick={() => { setCoverFile(null); setCoverPreview(''); }}
              className='absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80'
            >
              <X className='size-4' />
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => coverRef.current?.click()}
            className={cn(APP_SHELL_FORM_UPLOAD_ZONE_CLASS, 'aspect-[16/9]')}
          >
            <ImagePlus className='size-8 text-muted-foreground' />
            <span className='text-sm font-medium text-foreground'>Upload cover image</span>
          </button>
        )}
      </div>

      {/* Name */}
      <div className='space-y-2'>
        <Label htmlFor='community-name' className='text-sm font-bold text-foreground'>
          Nama Komunitas <RequiredMark />
        </Label>
        <ThemedInput
          id='community-name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nama komunitas'
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label htmlFor='community-desc' className='text-sm font-bold text-foreground'>
          Deskripsi <RequiredMark />
        </Label>
        <ThemedTextarea
          id='community-desc'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Ceritakan tentang komunitas ini...'
          maxLength={500}
        />
      </div>

      {/* Category */}
      <div className='space-y-2'>
        <Label htmlFor='community-category' className='text-sm font-bold text-foreground'>
          Kategori <RequiredMark />
        </Label>
        <ThemedInput
          id='community-category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder='Contoh: Olahraga, Gaming, Seni'
          maxLength={50}
        />
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3 pt-2'>
        {onCancel ? (
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            className={cn('h-12 flex-1', APP_SHELL_SECONDARY_BUTTON_CLASS)}
          >
            Batal
          </Button>
        ) : null}
        <Button
          type='submit'
          disabled={submitting}
          className='h-12 flex-1 rounded-xl bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
        >
          {submitting ? <ButtonBusySkeleton /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
