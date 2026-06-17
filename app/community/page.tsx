import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { Users2, Plus, ArrowUp, MessageSquare, Bookmark, Share2, TrendingUp, Flame, Clock } from 'lucide-react'
import Link from 'next/link'
import { timeAgo, formatNumber } from '@/lib/utils/index'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community',
  description: 'Join the Creatvo community — discuss ideas, share resources, and connect with creators.',
}

// Mock data removed in favor of real database query

const TABS = [
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
]

const POST_TYPE_COLORS: Record<string, string> = {
  question: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  text: 'text-white/40 bg-white/[0.04] border-white/[0.06]',
  link: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  image: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export default async function CommunityPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tab = searchParams.tab || 'hot'

  let query = supabase.from('community_posts').select('*, profiles(*)')
  
  if (tab === 'new') {
    query = query.order('created_at', { ascending: false })
  } else if (tab === 'trending') {
    query = query.order('upvotes', { ascending: false }).order('comments_count', { ascending: false })
  } else {
    // hot
    query = query.order('comments_count', { ascending: false }).order('upvotes', { ascending: false })
  }

  const { data: posts } = await query.limit(20)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center">
                  <Users2 className="h-5 w-5 text-brand-violet" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-black text-white">Community</h1>
                  <p className="text-white/40 text-xs">Discuss, share, and connect</p>
                </div>
              </div>
              <Link href="/community/new">
                <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
                  <Plus className="h-4 w-4" />
                  Post
                </button>
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {TABS.map((t) => (
                <a
                  key={t.id}
                  href={`/community?tab=${t.id}`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </a>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {posts?.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-10 text-center text-white/50">
                  No posts found. Be the first to start a discussion!
                </div>
              ) : null}
              {posts?.map((post) => (
                <article key={post.id} className="rounded-2xl border border-white/[0.06] bg-dark-card p-5 hover:border-white/10 card-hover cursor-pointer group">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-xl overflow-hidden bg-brand-purple/20 shrink-0">
                      <div className="h-full w-full flex items-center justify-center text-sm font-bold text-brand-violet">
                        {post.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{post.profiles?.full_name || post.profiles?.username}</span>
                        {post.profiles?.is_verified && (
                          <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-white/30">{timeAgo(post.created_at)}</span>
                      </div>
                      <span className="text-xs text-white/30">@{post.profiles?.username}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${POST_TYPE_COLORS[post.post_type] || POST_TYPE_COLORS.text}`}>
                      {post.post_type}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-white text-base mb-2 group-hover:text-brand-violet transition-colors">
                    {post.title}
                  </h3>
                  {post.content && (
                    <p className="text-sm text-white/50 line-clamp-2 leading-relaxed mb-4">
                      {post.content}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <button className="flex items-center gap-1.5 hover:text-brand-violet transition-colors">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span>{formatNumber(post.upvotes)}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Create post card */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <h3 className="font-display font-bold text-white mb-4">Share something useful</h3>
              <Link href="/community/new">
                <div className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center px-4 text-sm text-white/30 hover:border-brand-purple/30 hover:text-white/50 cursor-text transition-all">
                  What&apos;s on your mind?
                </div>
              </Link>
              <div className="flex gap-2 mt-3">
                {['💬 Text', '🔗 Link', '🖼️ Image', '❓ Question'].map(t => (
                  <Link key={t} href="/community/new">
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white/60 cursor-pointer transition-colors block">
                      {t}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top tags */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <h3 className="font-display font-bold text-white mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['ai', 'startup', 'coding', 'design', 'marketing', 'productivity', 'business', 'saas', 'growth', 'tools'].map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-brand-violet hover:border-brand-purple/30 cursor-pointer transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Community rules */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <h3 className="font-display font-bold text-white mb-4">Community Guidelines</h3>
              <ul className="space-y-2.5 text-sm text-white/50">
                {[
                  '✅ Share useful, high-value content',
                  '✅ Be respectful and constructive',
                  '✅ Give credit to original creators',
                  '❌ No spam or self-promotion only',
                  '❌ No low-effort or misleading posts',
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
