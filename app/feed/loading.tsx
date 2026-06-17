import { Navbar } from '@/components/navbar/Navbar'
import { Sparkles, Users, Flame, Clock } from 'lucide-react'

export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mock Navbar */}
      <nav className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] h-16" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar Skeleton */}
          <aside className="hidden xl:block space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-4 animate-pulse h-96" />
          </aside>

          {/* Main Feed Skeleton */}
          <div className="xl:col-span-2 space-y-6">
            {/* Tabs skeleton */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-dark-card border border-white/[0.06] h-12 animate-pulse" />
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-dark-card border border-white/[0.06] p-4 aspect-square animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <aside className="hidden xl:block space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5 animate-pulse h-64" />
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5 animate-pulse h-48" />
          </aside>
        </div>
      </div>
    </div>
  )
}
