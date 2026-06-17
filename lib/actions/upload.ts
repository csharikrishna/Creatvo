'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

type UploadBucket = 'avatars' | 'banners' | 'content-thumbnails' | 'article-images' | 'post-images'

/**
 * Upload an image file to Supabase Storage
 * Enforces 1MB limit, validates MIME type
 */
export async function uploadImage(
  formData: FormData,
  bucket: UploadBucket,
  folder?: string
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }

  // Validate type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF' }
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 1MB' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const prefix = folder || user.id
  const path = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: publicUrl }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(bucket: UploadBucket, path: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Security: only allow deleting own files
  if (!path.startsWith(user.id)) return

  await supabase.storage.from(bucket).remove([path])
}

/**
 * Update user avatar
 */
export async function updateAvatar(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const result = await uploadImage(formData, 'avatars', user.id)
  if ('error' in result) return result

  await supabase.from('profiles').update({ avatar_url: result.url }).eq('id', user.id)
  revalidatePath('/dashboard')
  revalidatePath(`/@${user.id}`)
  return result
}

/**
 * Update user banner/cover
 */
export async function updateBanner(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const result = await uploadImage(formData, 'banners', user.id)
  if ('error' in result) return result

  await supabase.from('profiles').update({ banner_url: result.url }).eq('id', user.id)
  revalidatePath('/dashboard')
  return result
}
