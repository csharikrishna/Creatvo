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

const mockProfile: Profile = {
  id: '1', username: 'techguru', full_name: 'TechGuru', bio: null,
  avatar_url: null, banner_url: null, creator_type: 'Tech Creator',
  website_url: null, twitter_url: null, instagram_url: null,
  followers_count: 86300, following_count: 120, views_count: 1200000,
  posts_count: 245, is_verified: true, interests: ['ai', 'coding'],
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}

const MOCK_FEED_ITEMS: ContentItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  category_id: 'c1',
  user_id: '1',
  title: [
    'Top 10 Best AI Tools For Creators 2024',
    'How I Made ₹1L from a Side Project in 60 Days',
    'Complete Next.js 14 App Router Guide',
    'Free Design Resources Every Creator Needs',
    'ChatGPT Prompts for Business Growth',
    'Best Productivity System for Entrepreneurs',
    'Micro-SaaS Ideas You Can Build This Weekend',
    'How to Build a Personal Brand on Twitter',
    'Python for Data Science — Full Roadmap',
    'Top Finance Apps to Track Your Money',
    'Video Editing Workflow for Solo Creators',
    'Building an Audience Without Paid Ads',
  ][i],
  thumbnail_url: null,
  description: 'High-value resource curated for builders and creators.',
  external_link: null,
  download_link: null,
  content_type: 'resource' as const,
  tags: [['ai', 'tools'], ['business', 'money'], ['coding', 'nextjs'], ['design', 'free']][i % 4],
  views_count: Math.floor(120000 - i * 9000),
  clicks_count: Math.floor(8000 - i * 600),
  likes_count: Math.floor(3000 - i * 230),
  saves_count: Math.floor(1500 - i * 115),
  shares_count: Math.floor(400 - i * 30),
  engagement_score: 900 - i * 65,
  created_at: new Date(Date.now() - i * 3600000 * 8).toISOString(),
  updated_at: new Date().toISOString(),
  profiles: mockProfile,
}))

const SUGGESTED_CREATORS: Profile[] = [
  { ...mockProfile, id: '2', username: 'businesspro', full_name: 'BusinessPro', creator_type: 'Business Expert', followers_count: 52000 },
  { ...mockProfile, id: '3', username: 'designwiz', full_name: 'DesignWiz', creator_type: 'Design Creator', followers_count: 38000, is_verified: false },
  { ...mockProfile, id: '4', username: 'financeflow', full_name: 'FinanceFlow', creator_type: 'Finance Expert', followers_count: 29000 },
]

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
                <a
                  key={t.id}
                  href={`/feed?tab=${t.id}`}
                  className={`flex items-center gap-1.5 flex-1 justify-center py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/25'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">{t.label}</span>
                </a>
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
            {tab !== 'following' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_FEED_ITEMS.map(item => (
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
                {SUGGESTED_CREATORS.map(creator => (
                  <div key={creator.id} className="flex items-center gap-3">
                    <Link href={`/@${creator.username}`}>
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-brand-purple/20 shrink-0 border border-white/[0.06] cursor-pointer hover:border-brand-purple/30 transition-all">
                        <div className="h-full w-full flex items-center justify-center text-sm font-bold text-brand-violet">
                          {creator.username[0].toUpperCase()}
                        </div>
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{creator.full_name}</p>
                      <p className="text-xs text-white/35">{(creator.followers_count / 1000).toFixed(0)}K followers</p>
                    </div>
                    <button className="h-7 px-3 rounded-lg border border-brand-purple/30 text-xs font-medium text-brand-violet hover:bg-brand-purple/15 transition-all whitespace-nowrap">
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
