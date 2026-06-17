'use client'

import Link from 'next/link'
import { Play, TrendingUp, Eye, MousePointerClick, IndianRupee, Sparkles, ArrowRight } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

const chartData = [
  { day: 'Mon', earnings: 3200 },
  { day: 'Tue', earnings: 4100 },
  { day: 'Wed', earnings: 3800 },
  { day: 'Thu', earnings: 5200 },
  { day: 'Fri', earnings: 4700 },
  { day: 'Sat', earnings: 6800 },
  { day: 'Sun', earnings: 7200 },
]

const FLOATING_ICONS = [
  { emoji: '🎬', style: 'top-6 left-4 animate-float', delay: '0s', size: 'h-12 w-12' },
  { emoji: '🎵', style: 'top-10 right-6 animate-float', delay: '0.5s', size: 'h-10 w-10' },
  { emoji: '🤖', style: 'bottom-20 left-8 animate-float', delay: '1s', size: 'h-10 w-10' },
  { emoji: '💼', style: 'bottom-10 right-4 animate-float', delay: '1.5s', size: 'h-12 w-12' },
  { emoji: '💻', style: 'top-32 right-24 animate-float', delay: '0.8s', size: 'h-9 w-9' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px]" />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(to right, rgba(139,92,246,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Content */}
          <div className="space-y-8 animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-purple/25 bg-brand-purple/8 text-brand-violet text-sm font-medium">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span>10,000+ Creators Earning Monthly</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Discover.{' '}
                <span className="text-gradient">Explore.</span>{' '}
                Earn.
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-white/70 font-display">
                Your Content, Your Website,
              </p>
              <p className="text-2xl md:text-3xl font-bold font-display">
                <span className="text-gradient">Your Earnings.</span>
              </p>
              <p className="text-white/50 text-lg max-w-lg leading-relaxed mt-4">
                Create your own category-based website. Share content, get views & earn money from your audience.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup">
                <button className="group flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 hover:shadow-2xl hover:shadow-brand-purple/40 transition-all active:scale-95">
                  Create Your Page
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <button className="flex items-center gap-2.5 h-12 px-6 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-purple/20 border border-brand-purple/30">
                  <Play className="h-3 w-3 fill-brand-violet text-brand-violet ml-0.5" />
                </div>
                How it Works
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {[
                    'from-purple-400 to-purple-600',
                    'from-violet-400 to-violet-600',
                    'from-fuchsia-400 to-fuchsia-600',
                    'from-pink-400 to-pink-600'
                  ].map((g, i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-dark-bg bg-gradient-to-br ${g}`} />
                  ))}
                </div>
                <span className="text-white/50">10K+ creators</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">₹2.4Cr+</span>
                <span className="text-white/50">earned</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard preview card */}
          <div className="relative flex items-center justify-center">
            {/* Floating icon badges */}
            {FLOATING_ICONS.map((item, i) => (
              <div
                key={i}
                className={`absolute ${item.style} ${item.size} rounded-2xl glass shadow-xl flex items-center justify-center text-2xl`}
                style={{ animationDelay: item.delay }}
              >
                {item.emoji}
              </div>
            ))}

            {/* Main card */}
            <div className="relative w-full max-w-sm rounded-3xl glass shadow-2xl shadow-black/60 p-6 animate-pulse_glow">
              {/* Glow border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-accent/5 opacity-50 blur-xl -z-10" />

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Total Earnings</p>
                  <p className="text-4xl font-display font-black text-white">₹48,768</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12.5%
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Eye, label: 'Views', value: '125.6K', color: 'text-brand-violet', bg: 'bg-brand-purple/10' },
                  { icon: MousePointerClick, label: 'Clicks', value: '32.4K', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
                  { icon: IndianRupee, label: 'Earned', value: '₹48.7K', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                    <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1.5`}>
                      <stat.icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="h-24 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        background: '#111118',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#ffffff80' }}
                      itemStyle={{ color: '#8B5CF6' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                    />
                    <Area type="monotone" dataKey="earnings" stroke="#7C3AED" strokeWidth={2} fill="url(#earningsGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-white/25 text-center mt-2">Last 7 days performance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
