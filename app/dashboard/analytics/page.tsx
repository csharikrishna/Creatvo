import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Clock,
  Eye,
  IndianRupee,
  MousePointerClick,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

const viewsData = [
  { date: 'May 1', views: 4200, clicks: 1200, earnings: 2800 },
  { date: 'May 5', views: 5800, clicks: 1600, earnings: 3600 },
  { date: 'May 10', views: 7200, clicks: 2100, earnings: 4500 },
  { date: 'May 15', views: 6100, clicks: 1800, earnings: 3900 },
  { date: 'May 20', views: 9400, clicks: 2900, earnings: 6200 },
  { date: 'May 25', views: 11200, clicks: 3400, earnings: 7800 },
  { date: 'May 30', views: 14500, clicks: 4200, earnings: 9600 },
]

const categoryData = [
  { name: 'AI Tools', views: 45000, color: '#7C3AED' },
  { name: 'Business', views: 32000, color: '#2563EB' },
  { name: 'Coding', views: 28000, color: '#059669' },
  { name: 'Design', views: 18000, color: '#DC2626' },
  { name: 'Finance', views: 12000, color: '#D97706' },
  { name: 'Marketing', views: 9000, color: '#EA580C' },
]

const topReferrers = [
  { source: 'Google Search', visits: 18400, pct: 34 },
  { source: 'Direct', visits: 12100, pct: 22 },
  { source: 'Twitter', visits: 8900, pct: 16 },
  { source: 'Instagram', visits: 7200, pct: 13 },
  { source: 'WhatsApp', visits: 5400, pct: 10 },
  { source: 'Other', visits: 2700, pct: 5 },
]

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  change: number
  changeLabel: string
  color: string
}) {
  const isPositive = change >= 0

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="mb-0.5 font-display text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-[10px] text-white/25">{changeLabel}</p>
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  // Fetch real basic stats
  const { data: contentStats } = await supabase
    .from('content_items')
    .select('views_count, clicks_count, saves_count, shares_count')
    .eq('user_id', user.id)

  const totalSaves = contentStats?.reduce((acc, item) => acc + item.saves_count, 0) || 0
  const totalShares = contentStats?.reduce((acc, item) => acc + item.shares_count, 0) || 0
  const totalClicks = contentStats?.reduce((acc, item) => acc + item.clicks_count, 0) || 0
  
  const clickRate = profile.views_count > 0 ? ((totalClicks / profile.views_count) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      <DashboardSidebar profile={profile} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-white/[0.04] bg-dark-bg/80 px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-violet" />
              <div>
                <h1 className="font-display text-xl font-black text-white">Analytics</h1>
                <p className="text-xs text-white/40">Performance, audience, and traffic health</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <MetricCard icon={Eye} label="Total Views" value={profile.views_count.toLocaleString()} change={0} changeLabel="Real data active" color="bg-brand-purple/15 text-brand-violet" />
            <MetricCard icon={Users} label="Followers" value={profile.followers_count.toLocaleString()} change={0} changeLabel="Real data active" color="bg-blue-500/15 text-blue-400" />
            <MetricCard icon={Bookmark} label="Total Saves" value={totalSaves.toLocaleString()} change={0} changeLabel="Real data active" color="bg-emerald-500/15 text-emerald-400" />
            <MetricCard icon={MousePointerClick} label="Click Rate" value={`${clickRate}%`} change={0} changeLabel="Real data active" color="bg-orange-500/15 text-orange-400" />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6 flex items-center justify-center h-64 text-white/30">
            More detailed chart analytics are being connected to your live database...
          </div>
        </div>
      </main>
    </div>
  )
}

