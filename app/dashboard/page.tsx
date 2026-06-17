import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import {
  Eye, TrendingUp, Users, FileText, IndianRupee,
  MousePointerClick, ArrowUpRight, Plus, Flame,
  BarChart3, Bookmark, Share2, Clock, Heart
} from 'lucide-react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils/index'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

function formatStat(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}



function StatCard({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType
  label: string
  value: string
  change: string
  color: string
}) {
  const isPositive = change.startsWith('+')
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-display font-black text-white mb-1">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  // Fetch user's top content items
  const { data: topItems } = await supabase
    .from('content_items')
    .select('id, title, views_count, likes_count')
    .eq('user_id', user.id)
    .order('views_count', { ascending: false })
    .limit(5)

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <DashboardSidebar profile={profile} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-xl text-white">
                Welcome back, {profile.full_name?.split(' ')[0] || profile.username} 👋
              </h1>
              <p className="text-sm text-white/40 mt-0.5">Here's what's happening with your content</p>
            </div>
            <Link href="/dashboard/content/new">
              <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
                <Plus className="h-4 w-4" />
                New Content
              </button>
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Eye} label="Total Views" value={formatStat(profile.views_count)} change="—" color="bg-brand-purple/15 text-brand-violet" />
            <StatCard icon={IndianRupee} label="Earnings" value="Coming Soon" change="—" color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={Users} label="Followers" value={formatStat(profile.followers_count)} change="—" color="bg-blue-500/15 text-blue-400" />
            <StatCard icon={FileText} label="Content Items" value={formatStat(profile.posts_count)} change="—" color="bg-orange-500/15 text-orange-400" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Earnings chart */}
            <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] bg-dark-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-white">Performance Overview</h3>
                  <p className="text-xs text-white/40 mt-0.5">Your content statistics</p>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">Detailed analytics charts coming soon</p>
                  <p className="text-xs text-white/20 mt-1">Start publishing content to see your performance data</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6">
              <h3 className="font-display font-bold text-white mb-5">This Month</h3>
              <div className="space-y-4">
                {[
                  { label: 'Click-through Rate', value: '4.2%', icon: MousePointerClick, color: 'text-brand-violet' },
                  { label: 'Avg. Saves per Post', value: '1.8K', icon: Bookmark, color: 'text-blue-400' },
                  { label: 'Content Shared', value: '3.4K', icon: Share2, color: 'text-emerald-400' },
                  { label: 'Avg. Read Time', value: '2m 34s', icon: Clock, color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-2.5 text-sm text-white/50">
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      {stat.label}
                    </div>
                    <span className="text-sm font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Content */}
          <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-orange-400" />
                <h3 className="font-display font-bold text-white">Top Performing Content</h3>
              </div>
              <Link href="/dashboard/content" className="text-xs text-brand-violet hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {!topItems || topItems.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No content yet. Start publishing to see your top performers!
                </div>
              ) : topItems.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.02] transition-all cursor-pointer group">
                  <span className="text-sm font-bold text-white/20 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-violet transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-xs">
                    <div className="flex items-center gap-1 text-white/40">
                      <Eye className="h-3 w-3" />
                      <span>{formatStat(item.views_count)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-violet">
                      <Heart className="h-3 w-3" />
                      <span>{formatStat(item.likes_count)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
