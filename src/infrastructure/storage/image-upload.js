import { supabase } from './supabase-client';

const BUCKET = 'event-covers';

/**
 * Upload an image file to Supabase Storage and return its public URL.
 * @param {File} file
 * @returns {Promise<string>} public URL of the uploaded image
 */
export async function uploadEventCover(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `covers/${fileName}`;

  if (!supabase) {
    throw new Error('Supabase client belum dikonfigurasi. Pastikan .env sudah diatur dengan benar.');
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Gagal mengupload gambar.');
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
