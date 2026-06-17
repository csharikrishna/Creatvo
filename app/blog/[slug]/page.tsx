import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { Clock, Eye, Heart, Bookmark, Share2, BadgeCheck, ArrowLeft, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatNumber, timeAgo } from '@/lib/utils/index'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, seo_title, seo_description, excerpt, cover_image, profiles(username, full_name)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) return { title: 'Article Not Found' }

  const title = article.seo_title || article.title
  const description = article.seo_description || article.excerpt || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createClient()

  const [{ data: { user } }, { data: article }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('articles')
      .select('*, profiles(*)')
      .eq('slug', params.slug)
      .single(),
  ])

  if (!article || (article.status !== 'published' && article.user_id !== user?.id)) {
    notFound()
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_likes', { p_table: 'articles', p_id: article.id }).then(() => {})

  // Check if liked/saved by current user
  let isLiked = false
  let isSaved = false
  if (user) {
    const [likeRes, saveRes] = await Promise.all([
      supabase.from('likes').select('id').eq('user_id', user.id).eq('content_type', 'article').eq('content_id', article.id).single(),
      supabase.from('saves').select('id').eq('user_id', user.id).eq('content_type', 'article').eq('content_id', article.id).single(),
    ])
    isLiked = !!likeRes.data
    isSaved = !!saveRes.data
  }

  const profile = article.profiles as { username: string; full_name: string | null; avatar_url: string | null; is_verified: boolean; bio: string | null; followers_count: number }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Category + Status */}
        <div className="flex items-center gap-2 mb-4">
          {article.category && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-purple/15 text-brand-violet border border-brand-purple/25">
              {article.category}
            </span>
          )}
          {article.status === 'draft' && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
              Draft
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-white/50 text-lg leading-relaxed mb-6">{article.excerpt}</p>
        )}

        {/* Author + Meta */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.06]">
          <Link href={`/@${profile.username}`} className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-gradient-to-br from-brand-purple to-brand-accent">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name || profile.username} width={44} height={44} className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold">
                  {(profile.full_name || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-white group-hover:text-brand-violet transition-colors text-sm">
                  {profile.full_name || profile.username}
                </p>
                {profile.is_verified && <BadgeCheck className="h-4 w-4 text-brand-violet fill-brand-violet/20" />}
              </div>
              <p className="text-xs text-white/40">@{profile.username}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.reading_time}m read</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatNumber(article.views_count)}</span>
            {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_image && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8">
            <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-a:text-brand-violet prose-blockquote:border-brand-purple/50 prose-code:text-brand-violet prose-pre:bg-dark-card prose-pre:border prose-pre:border-white/[0.06]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-white/[0.06]">
            {article.tags.map((tag: string) => (
              <Link key={tag} href={`/search?q=${tag}`}>
                <span className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-white/50 hover:text-brand-violet border border-white/[0.06] hover:border-brand-purple/30 transition-all cursor-pointer">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Engagement Bar */}
        <div className="flex items-center justify-between mt-8 py-4 border-t border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isLiked
                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white'
            }`}>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400' : ''}`} />
              {formatNumber(article.likes_count)}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white/50 border border-white/[0.06] hover:text-white bg-white/[0.04] transition-all">
              <MessageSquare className="h-4 w-4" />
              {formatNumber(article.comments_count)}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-xl transition-all ${
              isSaved ? 'bg-brand-purple/15 text-brand-violet' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}>
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
              }}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Author Card */}
        <div className="mt-10 p-6 rounded-3xl border border-white/[0.06] bg-dark-card">
          <Link href={`/@${profile.username}`} className="flex items-center gap-4 mb-4 group">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-purple to-brand-accent">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={56} height={56} className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold text-lg">
                  {(profile.full_name || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-white group-hover:text-brand-violet transition-colors">
                  {profile.full_name || profile.username}
                </p>
                {profile.is_verified && <BadgeCheck className="h-4 w-4 text-brand-violet" />}
              </div>
              <p className="text-sm text-white/40">{formatNumber(profile.followers_count)} followers</p>
            </div>
          </Link>
          {profile.bio && <p className="text-white/50 text-sm leading-relaxed">{profile.bio}</p>}
        </div>
      </article>

      <Footer />
    </div>
  )
}
