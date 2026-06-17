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
            <div className="flex items-center gap-2">
              {['7D', '30D', '90D', '1Y'].map((range) => (
                <button
                  key={range}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition-all ${
                    range === '30D'
                      ? 'border border-brand-purple/30 bg-brand-purple/20 text-brand-violet'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <MetricCard icon={Eye} label="Total Views" value="1.2M" change={18} changeLabel="vs last month" color="bg-brand-purple/15 text-brand-violet" />
            <MetricCard icon={IndianRupee} label="Earnings" value="₹48,768" change={12.5} changeLabel="vs last month" color="bg-emerald-500/15 text-emerald-400" />
            <MetricCard icon={Users} label="New Followers" value="+3,420" change={24} changeLabel="vs last month" color="bg-blue-500/15 text-blue-400" />
            <MetricCard icon={MousePointerClick} label="Click Rate" value="4.2%" change={-1.8} changeLabel="vs last month" color="bg-orange-500/15 text-orange-400" />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white">Views, Clicks, Earnings</h3>
                <p className="mt-0.5 text-xs text-white/40">May 2024 daily breakdown</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-violet" />Views</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Earnings</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />Clicks</span>
              </div>
            </div>
            <div className="flex h-64 items-end gap-3 border-b border-white/[0.06]">
              {viewsData.map((item) => (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-52 w-full items-end justify-center gap-1.5">
                    <div className="w-3 rounded-t bg-brand-violet/80" style={{ height: `${Math.max(12, (item.views / 14500) * 100)}%` }} />
                    <div className="w-3 rounded-t bg-emerald-400/70" style={{ height: `${Math.max(12, (item.earnings / 9600) * 100)}%` }} />
                    <div className="w-3 rounded-t bg-blue-400/70" style={{ height: `${Math.max(12, (item.clicks / 4200) * 100)}%` }} />
                  </div>
                  <span className="text-[11px] text-white/30">{item.date.replace('May ', '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6">
              <h3 className="mb-5 font-display font-bold text-white">Views by Category</h3>
              <div className="space-y-3">
                {categoryData.map((category) => (
                  <div key={category.name} className="grid grid-cols-[88px_1fr_72px] items-center gap-3 text-xs">
                    <span className="text-white/50">{category.name}</span>
                    <div className="h-2 rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full" style={{ width: `${(category.views / 45000) * 100}%`, backgroundColor: category.color }} />
                    </div>
                    <span className="text-right font-semibold text-white">{category.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6">
              <h3 className="mb-5 font-display font-bold text-white">Top Traffic Sources</h3>
              <div className="space-y-3">
                {topReferrers.map((referrer) => (
                  <div key={referrer.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{referrer.source}</span>
                      <span className="text-xs text-white/40">{referrer.visits.toLocaleString()} visits</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-accent" style={{ width: `${referrer.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
            {[
              { label: 'Avg. Duration', value: '2m 34s', icon: Clock, color: 'text-brand-violet bg-brand-purple/15' },
              { label: 'Total Saves', value: '18.4K', icon: Bookmark, color: 'text-blue-400 bg-blue-500/15' },
              { label: 'Total Shares', value: '6.2K', icon: Share2, color: 'text-emerald-400 bg-emerald-500/15' },
              { label: 'Click Rate', value: '4.2%', icon: MousePointerClick, color: 'text-orange-400 bg-orange-500/15' },
              { label: 'Followers', value: '86.3K', icon: Users, color: 'text-pink-400 bg-pink-500/15' },
              { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/15' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/[0.04] bg-dark-card p-4">
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="font-display text-lg font-black text-white">{stat.value}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

