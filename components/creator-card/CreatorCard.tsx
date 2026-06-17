import Link from 'next/link'
import { CheckCircle2, Eye, Users } from 'lucide-react'
import { formatNumber } from '@/lib/utils/index'
import type { Profile } from '@/types'

interface CreatorCardProps {
  profile: Profile
}

export function CreatorCard({ profile }: CreatorCardProps) {
  return (
    <Link href={`/@${profile.username}`}>
      <div className="shrink-0 w-56 rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden group card-hover cursor-pointer">
        {/* Banner */}
        <div className="relative h-24 overflow-hidden">
          {profile.banner_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, hsl(${Math.abs(profile.username.charCodeAt(0) * 12) % 360}, 60%, 20%), hsl(${Math.abs(profile.username.charCodeAt(0) * 12 + 60) % 360}, 50%, 10%))`
            }} />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
        </div>

        {/* Avatar overlapping banner */}
        <div className="relative px-4 pb-4">
          <div className="-mt-7 mb-3">
            <div className="h-14 w-14 rounded-xl border-2 border-dark-card overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name || ''} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-accent text-white text-xl font-black">
                  {(profile.full_name || profile.username)?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white text-sm truncate max-w-[140px]">
                  {profile.full_name || profile.username}
                </h3>
                {profile.is_verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0 fill-blue-400/20" />
                )}
              </div>
              <p className="text-xs text-white/40">@{profile.username}</p>
              {profile.creator_type && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/12 text-brand-violet border border-brand-purple/20">
                  {profile.creator_type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(profile.views_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{formatNumber(profile.followers_count)}</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="w-full h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-xs font-medium text-white/60 group-hover:border-brand-purple/40 group-hover:text-brand-violet group-hover:bg-brand-purple/8 transition-all">
                View Page
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function CreatorCardSkeleton() {
  return (
    <div className="shrink-0 w-56 rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden">
      <div className="h-24 bg-white/[0.03] animate-pulse" />
      <div className="px-4 pb-4">
        <div className="-mt-7 mb-3">
          <div className="h-14 w-14 rounded-xl bg-white/[0.05] animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/[0.03] rounded animate-pulse" />
          <div className="h-8 w-full bg-white/[0.03] rounded-lg animate-pulse mt-2" />
        </div>
      </div>
    </div>
  )
}
