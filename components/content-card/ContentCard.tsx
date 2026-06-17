"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, Clock, FileText } from 'lucide-react'
import { formatNumber, timeAgo } from '@/lib/utils/index'

// Flexible content card that works for both ContentItem and Article shapes
interface ContentCardItem {
  id: string
  title: string
  thumbnail_url?: string | null
  cover_image?: string | null
  description?: string | null
  excerpt?: string | null
  external_link?: string | null
  slug?: string | null
  content_type?: string
  tags?: string[]
  views_count: number
  likes_count: number
  saves_count?: number
  reading_time?: number
  created_at: string
  published_at?: string | null
  profiles?: {
    username: string
    full_name?: string | null
    avatar_url?: string | null
  } | null
}

interface ContentCardProps {
  item: ContentCardItem
  showCreator?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

function getItemHref(item: ContentCardItem): string {
  if (item.slug) return `/blog/${item.slug}`
  if (item.external_link) return item.external_link
  return '#'
}

function getItemImage(item: ContentCardItem): string | null {
  return item.cover_image || item.thumbnail_url || null
}

export function ContentCard({ item, showCreator = true, variant = 'default' }: ContentCardProps) {
  const href = getItemHref(item)
  const image = getItemImage(item)
  const isExternal = href.startsWith('http')
  const timeStr = item.published_at || item.created_at

  if (variant === 'featured') {
    return (
      <Link href={href} target={isExternal ? '_blank' : '_self'} rel={isExternal ? 'noopener noreferrer' : undefined}>
        <div className="relative rounded-3xl overflow-hidden group card-hover border border-white/[0.06] cursor-pointer aspect-[4/3]">
          {image ? (
            <Image src={image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-purple/30 to-dark-border flex items-center justify-center">
              <FileText className="h-12 w-12 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-display font-bold text-white text-lg leading-snug line-clamp-2 mb-2">{item.title}</h3>
            <div className="flex items-center justify-between text-xs text-white/50">
              {showCreator && item.profiles && <span>@{item.profiles.username}</span>}
              <div className="flex items-center gap-1"><Eye className="h-3 w-3" /><span>{formatNumber(item.views_count)}</span></div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} target={isExternal ? '_blank' : '_self'} rel={isExternal ? 'noopener noreferrer' : undefined}>
      <div className="group rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden card-hover cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-dark-bg">
          {image ? (
            <Image
              src={image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-dark-border">
              <FileText className="h-8 w-8 text-white/10" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-violet transition-colors">
            {item.title}
          </h3>

          {(item.description || item.excerpt) && (
            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
              {item.description || item.excerpt}
            </p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            {showCreator && item.profiles ? (
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full overflow-hidden bg-brand-purple/20 border border-white/10 shrink-0">
                  {item.profiles.avatar_url ? (
                    <Image src={item.profiles.avatar_url} alt="" width={20} height={20} className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-brand-violet">
                      {item.profiles.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/40">@{item.profiles.username}</span>
              </div>
            ) : (
              <span className="text-xs text-white/30">{timeAgo(timeStr)}</span>
            )}

            <div className="flex items-center gap-3 text-xs text-white/30">
              {item.reading_time && (
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{item.reading_time}m</span></div>
              )}
              <div className="flex items-center gap-1 hover:text-brand-violet cursor-pointer transition-colors">
                <Heart className="h-3 w-3" />
                <span>{formatNumber(item.likes_count || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(item.views_count)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden">
      <div className="aspect-video bg-white/[0.03] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-3 w-full bg-white/[0.03] rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-white/[0.03] rounded animate-pulse" />
        <div className="flex gap-2 pt-1 border-t border-white/[0.04]">
          <div className="h-5 w-5 rounded-full bg-white/[0.03] animate-pulse" />
          <div className="h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
