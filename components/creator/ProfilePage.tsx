'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Globe, Twitter, Instagram, Calendar,
  Users, Eye, FileText, Heart, Bookmark,
  MoreHorizontal, Share2, BadgeCheck, Edit3
} from 'lucide-react'
import { toggleFollow } from '@/lib/actions/index'
import { formatNumber, timeAgo } from '@/lib/utils/index'
import { toast } from 'sonner'
import type { Profile } from '@/types'

interface Article {
  id: string; title: string; slug: string; excerpt: string | null
  cover_image: string | null; reading_time: number; views_count: number
  likes_count: number; published_at: string | null; tags: string[]; category: string | null
}

interface Post {
  id: string; content: string; images: string[]; post_type: string
  likes_count: number; comments_count: number; created_at: string; tags: string[]
}

interface Props {
  profile: Profile
  currentUserId?: string
  isFollowing: boolean
  articles: Article[]
  posts: Post[]
}

export function ProfilePage({ profile, currentUserId, isFollowing: initialFollowing, articles, posts }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(profile.followers_count)
  const [activeTab, setActiveTab] = useState<'articles' | 'posts'>('articles')
  const [isPending, startTransition] = useTransition()

  const isOwnProfile = currentUserId === profile.id

  const handleFollow = () => {
    if (!currentUserId) { toast.error('Sign in to follow creators'); return }

    startTransition(async () => {
      try {
        const result = await toggleFollow(profile.id)
        setFollowing(result.following)
        setFollowerCount(prev => result.following ? prev + 1 : Math.max(0, prev - 1))
        toast.success(result.following ? `Following @${profile.username}` : `Unfollowed @${profile.username}`)
      } catch {
        toast.error('Something went wrong')
      }
    })
  }

  const handleShare = () => {
    const url = `${window.location.origin}/@${profile.username}`
    if (navigator.share) {
      navigator.share({ title: profile.full_name || profile.username, url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Profile link copied!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-b-3xl overflow-hidden bg-gradient-to-br from-brand-purple/20 via-dark-card to-dark-bg">
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="Cover" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-16 px-4">
        <div className="flex items-end justify-between gap-4 mb-4">
          {/* Avatar */}
          <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-dark-bg overflow-hidden bg-gradient-to-br from-brand-purple to-brand-accent shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || profile.username} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-3xl font-black font-display">
                {(profile.full_name || profile.username)[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white text-sm transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {isOwnProfile ? (
              <Link href="/dashboard/settings">
                <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-medium hover:border-white/15 transition-all">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                disabled={isPending}
                className={`flex items-center gap-1.5 h-9 px-5 rounded-xl text-sm font-semibold transition-all ${
                  following
                    ? 'border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-gradient-to-r from-brand-purple to-brand-accent text-white hover:opacity-90'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Name & Username */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-black text-white">
              {profile.full_name || profile.username}
            </h1>
            {profile.is_verified && (
              <BadgeCheck className="h-5 w-5 text-brand-violet fill-brand-violet/20" />
            )}
          </div>
          <p className="text-white/40 text-sm">@{profile.username}</p>
          {profile.creator_type && (
            <span className="inline-block mt-1.5 text-xs font-medium px-3 py-1 rounded-full bg-brand-purple/15 text-brand-violet border border-brand-purple/20">
              {profile.creator_type}
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-xl">{profile.bio}</p>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 mb-6">
          {profile.website_url && (
            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-brand-violet transition-colors">
              <Globe className="h-3.5 w-3.5" />
              {profile.website_url.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile.twitter_url && (
            <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-brand-violet transition-colors">
              <Twitter className="h-3.5 w-3.5" />
              Twitter
            </a>
          )}
          {profile.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-brand-violet transition-colors">
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </a>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/[0.06]">
          {[
            { label: 'Followers', value: formatNumber(followerCount), icon: Users },
            { label: 'Following', value: formatNumber(profile.following_count), icon: Users },
            { label: 'Posts', value: formatNumber(profile.posts_count), icon: FileText },
            { label: 'Total Views', value: formatNumber(profile.views_count), icon: Eye },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-black text-white text-xl">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] w-fit">
          {(['articles', 'posts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/20'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            {articles.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No published articles yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {articles.map(article => (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article className="flex gap-4 p-4 rounded-2xl border border-white/[0.06] bg-dark-card hover:border-brand-purple/20 hover:-translate-y-0.5 transition-all cursor-pointer group">
                      <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-brand-purple/20 to-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                        {article.cover_image ? (
                          <Image src={article.cover_image} alt={article.title} width={80} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-2xl opacity-30">📄</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-white text-sm mb-1.5 line-clamp-2 group-hover:text-brand-violet transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-white/40 text-xs line-clamp-1 mb-2">{article.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-white/30">
                          <span>{article.reading_time}m read</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(article.views_count)}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(article.likes_count)}</span>
                          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No posts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="p-4 rounded-2xl border border-white/[0.06] bg-dark-card hover:border-white/10 transition-all">
                    <p className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4">
                      {post.content}
                    </p>
                    {post.images?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-dark-border">
                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/30">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(post.likes_count)}</span>
                      <span>{timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
