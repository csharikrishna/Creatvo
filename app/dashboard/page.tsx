import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import {
  Eye, TrendingUp, Users, FileText, IndianRupee,
  MousePointerClick, ArrowUpRight, Plus, Flame,
  BarChart3, Bookmark, Share2, Clock
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const earningsData = [
  { day: 'Mon', earnings: 3200, views: 4800 },
  { day: 'Tue', earnings: 4100, views: 5900 },
  { day: 'Wed', earnings: 3800, views: 5200 },
  { day: 'Thu', earnings: 5200, views: 7100 },
  { day: 'Fri', earnings: 4700, views: 6400 },
  { day: 'Sat', earnings: 6800, views: 9200 },
  { day: 'Sun', earnings: 7200, views: 9800 },
]

const topContent = [
  { title: 'Top 10 Best Movie Apps', views: 125000, earnings: 8900, change: '+12%' },
  { title: 'Best AI Tools For Creators', views: 98000, earnings: 7200, change: '+8%' },
  { title: 'Low Investment Business Ideas', views: 76000, earnings: 5600, change: '+23%' },
  { title: 'Complete Python Roadmap 2024', views: 62000, earnings: 4800, change: '+5%' },
  { title: 'Free Design Tools 2024', views: 52000, earnings: 3900, change: '+17%' },
]

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
            <StatCard icon={Eye} label="Total Views" value="1.2M" change="+18%" color="bg-brand-purple/15 text-brand-violet" />
            <StatCard icon={IndianRupee} label="Total Earnings" value="₹48,768" change="+12.5%" color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={Users} label="Followers" value="86.3K" change="+340" color="bg-blue-500/15 text-blue-400" />
            <StatCard icon={FileText} label="Content Items" value="245" change="+12" color="bg-orange-500/15 text-orange-400" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Earnings chart */}
            <div className="xl:col-span-2 rounded-2xl border border-white/[0.06] bg-dark-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-white">Earnings & Views</h3>
                  <p className="text-xs text-white/40 mt-0.5">Last 7 days performance</p>
                </div>
                <select className="text-xs bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-lg px-3 py-1.5 focus:outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-48">
                <div className="flex h-full items-end gap-3 border-b border-white/[0.06]">
                  {earningsData.map((item) => {
                    const viewsHeight = Math.max(16, (item.views / 9800) * 100)
                    const earningsHeight = Math.max(16, (item.earnings / 7200) * 100)

                    return (
                      <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-36 w-full items-end justify-center gap-1.5">
                          <div
                            className="w-3 rounded-t bg-blue-400/60"
                            style={{ height: `${viewsHeight}%` }}
                            title={`${item.views.toLocaleString()} views`}
                          />
                          <div
                            className="w-3 rounded-t bg-brand-violet/80"
                            style={{ height: `${earningsHeight}%` }}
                            title={`₹${item.earnings.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-[11px] text-white/30">{item.day}</span>
                      </div>
                    )
                  })}
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
              {topContent.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.02] transition-all cursor-pointer group">
                  <span className="text-sm font-bold text-white/20 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-violet transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-xs">
                    <div className="flex items-center gap-1 text-white/40">
                      <Eye className="h-3 w-3" />
                      <span>{(item.views / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <IndianRupee className="h-3 w-3" />
                      <span>{(item.earnings / 1000).toFixed(1)}K</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">{item.change}</span>
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
