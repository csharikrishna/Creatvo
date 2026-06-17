import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { ContentCard, ContentCardSkeleton } from '@/components/content-card/ContentCard'
import { Flame, TrendingUp, Clock, Zap, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ContentItem, Profile } from '@/types'

export const metadata: Metadata = {
  title: 'Trending',
  description: 'Discover the most popular content on Creatvo this week.',
}

const TABS = [
  { id: 'week', label: 'This Week', icon: Flame },
  { id: 'month', label: 'This Month', icon: TrendingUp },
  { id: 'alltime', label: 'All Time', icon: BarChart2 },
  { id: 'new', label: 'Rising', icon: Zap },
]

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tab = searchParams.tab || 'week'

  let query = supabase.from('content_items').select('*, profiles(*)')
  
  const now = new Date()
  if (tab === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', weekAgo).order('engagement_score', { ascending: false })
  } else if (tab === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', monthAgo).order('engagement_score', { ascending: false })
  } else if (tab === 'new') {
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', twoDaysAgo).order('engagement_score', { ascending: false })
  } else {
    query = query.order('engagement_score', { ascending: false })
  }

  const { data: trendingItems } = await query.limit(20)

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
            <Link
              key={t.id}
              href={`/trending?tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-white text-black border border-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Top 3 Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {trendingItems?.slice(0, 3).map((item, i) => (
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
          {trendingItems?.slice(3).map((item, i) => (
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
