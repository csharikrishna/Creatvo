import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { ContentCard, ContentCardSkeleton } from '@/components/content-card/ContentCard'
import { Flame, TrendingUp, Clock, Zap, BarChart2 } from 'lucide-react'
import type { Metadata } from 'next'
import type { ContentItem, Profile } from '@/types'

export const metadata: Metadata = {
  title: 'Trending',
  description: 'Discover the most popular content on CreatoHub this week.',
}

const TABS = [
  { id: 'week', label: 'This Week', icon: Flame },
  { id: 'month', label: 'This Month', icon: TrendingUp },
  { id: 'alltime', label: 'All Time', icon: BarChart2 },
  { id: 'new', label: 'Rising', icon: Zap },
]

// Mock profiles for demo
const mockProfile: Profile = {
  id: '1', username: 'techguru', full_name: 'TechGuru', bio: null,
  avatar_url: null, banner_url: null, creator_type: 'Tech Creator',
  website_url: null, twitter_url: null, instagram_url: null,
  followers_count: 86300, following_count: 120, views_count: 1200000,
  posts_count: 245, is_verified: true, interests: ['ai', 'coding'],
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}

const MOCK_TRENDING: ContentItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  category_id: 'c1',
  user_id: '1',
  title: [
    'Top 10 Best Movie Apps For Android (2024)',
    'Best AI Tools For Content Creators',
    'Low Investment Business Ideas With High Profit',
    'Top 5 Best Music Apps For Android',
    'Free Design Tools That Replace Adobe',
    'Complete Python Roadmap 2024',
    '50 Micro-SaaS Ideas for Solopreneurs',
    'How to Build Passive Income Online',
    'Best Productivity Apps in 2024',
    'ChatGPT Prompts For Marketers',
    'Top Finance Apps for Indians',
    'Best Video Editing Apps For Mobile',
  ][i],
  thumbnail_url: null,
  description: 'High-value knowledge resource curated for creators and builders.',
  external_link: null,
  download_link: null,
  content_type: 'resource' as const,
  tags: [['movies', 'android'], ['ai', 'tools'], ['business', 'india'], ['music', 'apps']][i % 4],
  views_count: Math.floor(125000 - i * 8000),
  clicks_count: Math.floor(9000 - i * 600),
  likes_count: Math.floor(3200 - i * 200),
  saves_count: Math.floor(1800 - i * 120),
  shares_count: Math.floor(450 - i * 30),
  engagement_score: 980 - i * 60,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  profiles: mockProfile,
}))

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tab = searchParams.tab || 'week'

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white">Trending Content</h1>
              <p className="text-white/40 text-sm mt-0.5">The most popular content across all categories</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`/trending?tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
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

        {/* Top 3 Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {MOCK_TRENDING.slice(0, 3).map((item, i) => (
            <div key={item.id} className="relative">
              {/* Rank badge */}
              <div className={`absolute top-3 left-3 z-10 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black ${
                i === 0 ? 'bg-yellow-500 text-yellow-900' :
                i === 1 ? 'bg-slate-400 text-slate-900' :
                'bg-amber-600 text-amber-900'
              }`}>
                #{i + 1}
              </div>
              <ContentCard item={item} variant="featured" />
            </div>
          ))}
        </div>

        {/* Rest of list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_TRENDING.slice(3).map((item, i) => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 h-6 w-6 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                #{i + 4}
              </div>
              <ContentCard item={item} />
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
