'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BarChart3, Settings, Plus,
  Users, TrendingUp, Bookmark, Bell, Zap, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils/index'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/dashboard/content', icon: FileText, label: 'Content' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/followers', icon: Users, label: 'Followers' },
  { href: '/dashboard/trending', icon: TrendingUp, label: 'Trending' },
  { href: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface DashboardSidebarProps {
  profile?: { username: string; full_name: string | null; avatar_url: string | null } | null
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/[0.04] bg-dark-nav/40">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
            <span className="font-display font-black text-white">C</span>
          </div>
          <span className="font-display font-black text-lg text-white">
            Creato<span className="text-brand-violet">Hub</span>
          </span>
        </Link>
      </div>

      {/* Create button */}
      <div className="p-4">
        <Link href="/dashboard/content/new">
          <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" />
            Create Content
          </button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-purple/15 text-brand-violet border border-brand-purple/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              )}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-4">
        <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/8 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-semibold text-white">Go Pro</span>
          </div>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">Unlock advanced analytics, custom domains & more.</p>
          <button className="w-full h-8 rounded-lg bg-gradient-to-r from-brand-purple to-brand-accent text-white text-xs font-semibold hover:opacity-90 transition-all">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/10 shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-accent text-white text-xs font-bold">
                {profile?.full_name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Creator'}</p>
            <p className="text-xs text-white/40 truncate">@{profile?.username}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
