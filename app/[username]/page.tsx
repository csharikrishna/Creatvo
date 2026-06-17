import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { ProfilePage } from '@/components/creator/ProfilePage'
import type { Metadata } from 'next'

interface Props {
  params: { username: string }
}

// This route handles both /@username and /username patterns
// Next.js App Router does not support @ prefix in segment names
// We redirect /username → /@username for SEO, and render at /@username

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeURIComponent(params.username).replace(/^@/, '')

  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url, username')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Creator Not Found' }

  return {
    title: `${profile.full_name || profile.username} (@${profile.username})`,
    description: profile.bio || `Check out ${profile.full_name || profile.username}'s creator page on Creatvo`,
    openGraph: {
      type: 'profile',
      title: `${profile.full_name || profile.username} on Creatvo`,
      description: profile.bio || '',
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${profile.full_name || profile.username} (@${profile.username})`,
      description: profile.bio || '',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || ''}/@${profile.username}`,
    },
  }
}

export default async function UserProfilePage({ params }: Props) {
  // Strip @ prefix if present (e.g., someone navigates to /@username somehow)
  const username = decodeURIComponent(params.username).replace(/^@/, '')

  const supabase = createClient()

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single(),
  ])

  if (!profile) notFound()

  // Get profile stats and content
  const [{ data: articles }, { data: posts }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image, reading_time, views_count, likes_count, published_at, tags, category')
      .eq('user_id', profile.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6),
    supabase
      .from('posts')
      .select('id, content, images, post_type, likes_count, comments_count, created_at, tags')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // Check follow status
  let isFollowing = false
  let currentProfile = null
  if (user) {
    const [followRes, profileRes] = await Promise.all([
      user.id !== profile.id
        ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.id).single()
        : Promise.resolve({ data: null }),
      supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single(),
    ])
    isFollowing = !!followRes.data
    currentProfile = profileRes.data
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} profile={currentProfile} />
      <ProfilePage
        profile={profile}
        currentUserId={user?.id}
        isFollowing={isFollowing}
        articles={articles || []}
        posts={posts || []}
      />
      <Footer />
    </div>
  )
}
