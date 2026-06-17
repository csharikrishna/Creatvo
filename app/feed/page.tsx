import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar/Navbar'
import { ContentCard } from '@/components/content-card/ContentCard'
import { CreatorCard } from '@/components/creator-card/CreatorCard'
import { Sparkles, Users, TrendingUp, Clock, Flame, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'
import type { Metadata } from 'next'
import type { ContentItem, Profile } from '@/types'

export const metadata: Metadata = { title: 'Your Feed' }

const FEED_TABS = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'latest', label: 'Latest', icon: Clock },
]

export default async function FeedPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const tab = searchParams.tab || 'foryou'

  // Fetch real content based on tab
  let query = supabase.from('content_items').select('*, profiles(*)')
  
  if (tab === 'trending' || tab === 'foryou') {
    query = query.order('engagement_score', { ascending: false })
  } else if (tab === 'latest') {
    query = query.order('created_at', { ascending: false })
  }

  const { data: feedItems } = await query.limit(20)

  // Fetch real suggested creators (by followers)
  const { data: suggestedCreators } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .order('followers_count', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Left sidebar — categories */}
          <aside className="hidden xl:block space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Browse Categories</h3>
              <div className="space-y-0.5">
                {PLATFORM_CATEGORIES.slice(0, 10).map(cat => (
                  <Link key={cat.slug} href={`/categories?filter=${cat.slug}`}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
                      <span className="text-base">{cat.icon}</span>
                      {cat.label}
                    </div>
                  </Link>
                ))}
                <Link href="/categories">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-violet hover:bg-brand-purple/10 transition-all cursor-pointer font-medium">
                    <LayoutGrid className="h-4 w-4" />
                    View All
                  </div>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <div className="xl:col-span-2 space-y-6">
            {/* Feed tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-dark-card border border-white/[0.06]">
              {FEED_TABS.map(t => (
                <Link
                  key={t.id}
                  href={`/feed?tab=${t.id}`}
                  className={`flex items-center gap-1.5 flex-1 justify-center py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-white text-black border border-white'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">{t.label}</span>
                </Link>
              ))}
            </div>

            {/* Following empty state */}
            {tab === 'following' && (
              <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-8 text-center">
                <div className="h-14 w-14 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-brand-violet" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">Start Following Creators</h3>
                <p className="text-white/40 text-sm mb-5">Follow creators to see their latest content here.</p>
                <Link href="/trending">
                  <button className="h-9 px-5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
                    Discover Creators
                  </button>
                </Link>
              </div>
            )}

            {/* Feed grid */}
            {tab !== 'following' && feedItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedItems.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Load more */}
            {tab !== 'following' && (
              <div className="text-center pt-4">
                <button className="h-10 px-8 rounded-xl border border-white/[0.06] text-white/50 hover:text-white hover:border-white/15 text-sm font-medium transition-all">
                  Load more content
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar — suggestions */}
          <aside className="hidden xl:block space-y-6">
            {/* Suggested creators */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Suggested Creators</h3>
                <Link href="/trending" className="text-xs text-brand-violet hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                {suggestedCreators?.map(creator => (
                  <div key={creator.id} className="flex items-center gap-3">
                    <Link href={`/@${creator.username}`}>
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/[0.06] cursor-pointer hover:border-white/20 transition-all">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt={creator.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-sm font-bold text-white">
                            {creator.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{creator.full_name || creator.username}</p>
                      <p className="text-xs text-white/35">{(creator.followers_count / 1000).toFixed(1)}K followers</p>
                    </div>
                    <button className="h-7 px-3 rounded-lg border border-white/20 text-xs font-medium text-white hover:bg-white/10 transition-all whitespace-nowrap">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending tags */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['#ai2024', '#buildinpublic', '#saas', '#productivity', '#design', '#coding', '#business', '#startup'].map(tag => (
                  <Link key={tag} href={`/search?q=${tag}`}>
                    <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/50 hover:text-brand-violet hover:border-brand-purple/30 cursor-pointer transition-all block">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform stats */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Platform Today</h3>
              <div className="space-y-3">
                {[
                  { label: 'Active Creators', value: '2,840', color: 'bg-brand-violet' },
                  { label: 'New Posts', value: '1,240', color: 'bg-blue-400' },
                  { label: 'Total Views', value: '842K', color: 'bg-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                      {s.label}
                    </div>
                    <span className="font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
