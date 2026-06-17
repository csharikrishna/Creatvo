'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, Plus, Search, Menu, X, LogOut, Settings,
  User, LayoutDashboard, Sparkles, TrendingUp, Flame,
  BookOpen, Users2, ChevronDown, Compass
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/index'

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Compass },
  { href: '/categories', label: 'Categories', icon: Sparkles },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/community', label: 'Community', icon: Users2 },
  { href: '/blog', label: 'Blog', icon: BookOpen },
]

interface NavbarProps {
  user?: { id: string; email?: string } | null
  profile?: {
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.username?.[0]?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-dark-nav/80 backdrop-blur-2xl border-b border-white/[0.04]" />

      {/* Main bar */}
      <div className="relative container mx-auto flex h-16 items-center gap-3 px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-accent" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-accent opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
            <span className="relative font-display font-black text-white text-lg leading-none">C</span>
          </div>
          <span className="font-display font-black text-xl text-white tracking-tight hidden sm:block">
            Creato<span className="text-brand-violet">Hub</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-brand-violet transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for apps, tools, creators, articles..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <Search className="h-5 w-5" />
          </button>

          {user ? (
            <>
              <Link href="/dashboard/content/new">
                <button className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-brand-purple/30 transition-all active:scale-95">
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </Link>

              <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-dark-nav" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/10 group-hover:border-brand-purple/40 transition-colors">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={profile.full_name || ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-accent text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform', profileOpen && 'rotate-180')} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-60 rounded-2xl glass shadow-2xl shadow-black/60 p-2 z-50 animate-fade-up">
                    <div className="px-3 py-2.5 border-b border-white/5 mb-1.5">
                      <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Creator'}</p>
                      <p className="text-xs text-white/40 truncate">@{profile?.username}</p>
                    </div>
                    {[
                      { href: `/@${profile?.username}`, icon: User, label: 'My Page' },
                      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)}>
                        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-white/5 mt-1.5 pt-1.5">
                      <form action="/auth/signout" method="post">
                        <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer transition-all">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="h-9 px-4 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all">
                  Log In
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-brand-purple/30 transition-all active:scale-95">
                  Get Started
                </button>
              </Link>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="relative md:hidden border-t border-white/5 px-4 py-3 bg-dark-nav/95">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple/50"
              />
            </div>
          </form>
        </div>
      )}

      {/* Nav links bar */}
      <nav className="relative hidden md:block border-t border-white/[0.04] bg-dark-nav/40">
        <div className="container mx-auto flex items-center gap-0.5 px-4 h-10">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'text-brand-violet'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-brand-violet rounded-full" />
                )}
                {link.label}
              </Link>
            )
          })}

          {/* Offers tab */}
          <Link href="/offers" className={cn(
            'relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/offers' ? 'text-brand-violet' : 'text-white/50 hover:text-white hover:bg-white/5'
          )}>
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Offers
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="relative md:hidden border-t border-white/5 bg-dark-nav/95 backdrop-blur-xl p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === link.href
                  ? 'text-brand-violet bg-brand-purple/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard/content/new" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-accent mt-2">
                <Plus className="h-4 w-4" />
                Create Content
              </div>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
