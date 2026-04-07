import { useState, useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Textarea } from '@/presentation/components/ui/textarea';
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
            className='flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50'
          >
            <ImagePlus className='size-8' />
            <span className='text-sm'>Upload cover image</span>
          </button>
        )}
      </div>

      {/* Name */}
      <div className='space-y-2'>
        <Label htmlFor='community-name' className='text-sm font-bold text-foreground'>
          Nama Komunitas <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='community-name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nama komunitas'
          className='h-12 rounded-xl border-border bg-muted/40'
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label htmlFor='community-desc' className='text-sm font-bold text-foreground'>
          Deskripsi <span className='text-destructive'>*</span>
        </Label>
        <Textarea
          id='community-desc'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Ceritakan tentang komunitas ini...'
          className='min-h-[100px] rounded-xl border-border bg-muted/40'
          maxLength={500}
        />
      </div>

      {/* Category */}
      <div className='space-y-2'>
        <Label htmlFor='community-category' className='text-sm font-bold text-foreground'>
          Kategori <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='community-category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder='Contoh: Olahraga, Gaming, Seni'
          className='h-12 rounded-xl border-border bg-muted/40'
          maxLength={50}
        />
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3 pt-2'>
        {onCancel ? (
          <Button type='button' variant='outline' onClick={onCancel} className='flex-1 h-12 rounded-xl'>
            Batal
          </Button>
        ) : null}
        <Button
          type='submit'
          disabled={submitting}
          className='flex-1 h-12 rounded-xl bg-primary-container font-semibold text-primary-foreground shadow-lg shadow-primary-container/30 hover:bg-primary-container/90'
        >
          {submitting ? <Loader2 className='size-4 animate-spin' /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
