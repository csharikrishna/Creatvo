import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import Link from 'next/link'
import {
  Plus, FileText, Eye, Heart, Clock, Edit3, Trash2,
  BookOpen, Send, Archive, MoreHorizontal
} from 'lucide-react'
import { formatNumber, timeAgo } from '@/lib/utils/index'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Content' }

export default async function ContentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const [{ data: articles }, { data: posts }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, slug, status, reading_time, views_count, likes_count, comments_count, published_at, created_at, cover_image, tags')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('posts')
      .select('id, content, post_type, likes_count, comments_count, views_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const drafts = articles?.filter(a => a.status === 'draft') || []
  const published = articles?.filter(a => a.status === 'published') || []

  const STATUS_BADGE: Record<string, string> = {
    published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    draft: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    archived: 'bg-white/10 text-white/40 border-white/10',
  }

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-xl text-white">My Content</h1>
              <p className="text-sm text-white/40 mt-0.5">{(articles?.length || 0)} articles · {(posts?.length || 0)} posts</p>
            </div>
            <Link href="/blog/new">
              <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
                <Plus className="h-4 w-4" />
                New Article
              </button>
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Published', value: published.length, icon: Send, color: 'bg-emerald-500/15 text-emerald-400' },
              { label: 'Drafts', value: drafts.length, icon: FileText, color: 'bg-yellow-500/15 text-yellow-400' },
              { label: 'Total Views', value: formatNumber(articles?.reduce((s, a) => s + a.views_count, 0) || 0), icon: Eye, color: 'bg-brand-purple/15 text-brand-violet' },
              { label: 'Total Likes', value: formatNumber(articles?.reduce((s, a) => s + a.likes_count, 0) || 0), icon: Heart, color: 'bg-red-500/15 text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="font-display font-black text-white text-2xl">{stat.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Articles Table */}
          <div className="rounded-2xl border border-white/[0.06] bg-dark-card">
            <div className="p-6 border-b border-white/[0.04]">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-violet" />
                Articles
              </h2>
            </div>

            {!articles?.length ? (
              <div className="text-center py-16">
                <FileText className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 mb-4">No articles yet</p>
                <Link href="/blog/new">
                  <button className="px-4 py-2 rounded-xl bg-brand-purple/20 text-brand-violet text-sm font-medium border border-brand-purple/25 hover:opacity-80 transition-all">
                    Write your first article
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {articles.map(article => (
                  <div key={article.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white text-sm truncate group-hover:text-brand-violet transition-colors">
                          {article.title}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[article.status] || STATUS_BADGE.draft}`}>
                          {article.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time}m</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(article.views_count)}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(article.likes_count)}</span>
                        <span>{timeAgo(article.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Link href={`/blog/${article.slug}`}>
                        <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
