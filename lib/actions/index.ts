'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateEngagementScore } from '@/lib/utils/index'

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ─── Follows ─────────────────────────────────────────────────────────────────

export async function toggleFollow(targetUserId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  }

  revalidatePath(`/@${targetUserId}`)
  return { following: !existing }
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export async function toggleLike(
  contentType: 'post' | 'article' | 'content_item' | 'comment',
  contentId: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    // Decrement count
    const table = contentType === 'content_item' ? 'content_items' : contentType === 'article' ? 'articles' : 'posts'
    await supabase.rpc('decrement_likes', { p_table: table, p_id: contentId })
  } else {
    await supabase.from('likes').insert({ user_id: user.id, content_type: contentType, content_id: contentId })
    // Increment count
    const table = contentType === 'content_item' ? 'content_items' : contentType === 'article' ? 'articles' : 'posts'
    await supabase.rpc('increment_likes', { p_table: table, p_id: contentId })
  }

  return { liked: !existing }
}

// ─── Saves ────────────────────────────────────────────────────────────────────

export async function toggleSave(
  contentType: 'post' | 'article' | 'content_item',
  contentId: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('saves')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single()

  if (existing) {
    await supabase.from('saves').delete().eq('id', existing.id)
  } else {
    await supabase.from('saves').insert({ user_id: user.id, content_type: contentType, content_id: contentId })
  }

  return { saved: !existing }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function createComment(
  contentType: 'post' | 'article' | 'content_item' | 'community_post',
  contentId: string,
  body: string,
  parentId?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!body.trim()) throw new Error('Comment cannot be empty')
  if (body.length > 1000) throw new Error('Comment too long')

  const { data, error } = await (supabase.from('comments') as ReturnType<typeof supabase.from>).insert({
    user_id: user.id,
    content_type: contentType,
    content_id: contentId,
    body: body.trim(),
    parent_id: parentId || null,
  }).select('*, profiles(*)').single()

  if (error) throw error

  revalidatePath('/')
  return data
}

// ─── Profile update ───────────────────────────────────────────────────────────

export async function updateProfile(formData: {
  full_name?: string
  bio?: string
  creator_type?: string
  website_url?: string
  twitter_url?: string
  instagram_url?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name?.trim() || null,
      bio: formData.bio?.trim() || null,
      creator_type: formData.creator_type || null,
      website_url: formData.website_url?.trim() || null,
      twitter_url: formData.twitter_url?.trim() || null,
      instagram_url: formData.instagram_url?.trim() || null,
    })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/settings')
  return { success: true }
}

// ─── Track view ───────────────────────────────────────────────────────────────

export async function trackView(contentId: string, contentType: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('content_views').insert({
    content_id: contentId,
    content_type: contentType,
    viewer_id: user?.id || null,
    viewer_ip: null,
    referrer: null,
  })
}

// ─── Report content ───────────────────────────────────────────────────────────

export async function reportContent(
  contentType: string,
  contentId: string,
  reason: string,
  description?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    content_type: contentType,
    content_id: contentId,
    reason: reason as 'spam' | 'misinformation' | 'harassment' | 'hate_speech' | 'copyright' | 'other',
    description: description?.trim() || null,
  })

  if (error) throw error
  return { success: true }
}

// ─── Create content item ──────────────────────────────────────────────────────

export async function createContentItem(formData: {
  category_id: string
  title: string
  description?: string
  external_link?: string
  content_type: string
  tags: string[]
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (!formData.title.trim()) throw new Error('Title is required')
  if (formData.title.length > 200) throw new Error('Title too long')

  // Validate URL if provided
  if (formData.external_link) {
    try { new URL(formData.external_link) }
    catch { throw new Error('Invalid URL format') }
  }

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      user_id: user.id,
      category_id: formData.category_id,
      title: formData.title.trim(),
      thumbnail_url: null,
      description: formData.description?.trim() || null,
      external_link: formData.external_link?.trim() || null,
      download_link: null,
      content_type: formData.content_type as 'link' | 'image' | 'video' | 'carousel' | 'text' | 'resource',
      tags: formData.tags.slice(0, 8),
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/content')
  revalidatePath('/')
  return data
}

// ─── Delete content item ──────────────────────────────────────────────────────

export async function deleteContentItem(contentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', contentId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/content')
  return { success: true }
}

// ─── Mark notifications read ──────────────────────────────────────────────────

export async function markNotificationsRead(notificationIds?: string[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)

  if (notificationIds?.length) {
    query = query.in('id', notificationIds)
  }

  await query
  revalidatePath('/dashboard')
  return { success: true }
}
