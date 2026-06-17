import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { BookOpen, Clock, Eye, Heart, ChevronRight, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatNumber, timeAgo } from '@/lib/utils/index'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read in-depth articles, tutorials, and guides from top creators on CreatoHub.',
}

// Mock data removed in favor of real database query

const CATEGORY_FILTERS = ['All', 'AI', 'Business', 'Coding', 'Design', 'Marketing', 'Productivity', 'Finance']

export default async function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const activeCategory = searchParams.category || 'All'

  let query = supabase.from('articles').select('*, profiles(*)').eq('status', 'published')
  
  if (activeCategory !== 'All') {
    query = query.eq('category', activeCategory)
  }
  
  const { data: articles } = await query.order('published_at', { ascending: false }).limit(20)

  const featured = articles && articles.length > 0 ? articles[0] : null
  const rest = articles && articles.length > 1 ? articles.slice(1) : []

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white">Blog</h1>
              <p className="text-white/40 text-sm mt-0.5">In-depth articles from top creators</p>
            </div>
          </div>
          <Link href="/blog/new">
            <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
              <Plus className="h-4 w-4" />
              Write Article
            </button>
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-10 overflow-x-auto scrollbar-hide">
          {CATEGORY_FILTERS.map(cat => (
            <a
              key={cat}
              href={cat === 'All' ? '/blog' : `/blog?category=${cat}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-white/[0.06]'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured article */}
            {!featured ? (
              <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-10 text-center text-white/50">
                No articles found in this category yet.
              </div>
            ) : (
              <Link href={`/blog/${featured.slug}`}>
                <article className="rounded-3xl border border-white/[0.06] bg-dark-card overflow-hidden card-hover cursor-pointer group">
                {/* Thumbnail placeholder */}
                <div className="aspect-video bg-gradient-to-br from-brand-purple/20 via-dark-border to-dark-bg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-20">📝</span>
                  </div>
                  <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-brand-purple/30 text-brand-violet border border-brand-purple/30">
                    {featured.category}
                  </span>
                  <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-medium">
                    ⭐ Featured
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-display font-black text-white text-xl mb-3 group-hover:text-brand-violet transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl overflow-hidden bg-brand-purple/20">
                        <div className="h-full w-full flex items-center justify-center text-sm font-bold text-brand-violet">
                          {featured.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{featured.profiles?.full_name || featured.profiles?.username || 'Unknown'}</p>
                        <p className="text-xs text-white/30">{timeAgo(featured.published_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/30">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.reading_time}m</div>
                      <div className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(featured.views_count)}</div>
                      <div className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(featured.likes_count)}</div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
            )}

            {/* Article list */}
            <div className="space-y-3">
              {rest.map(article => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="flex gap-4 p-4 rounded-2xl border border-white/[0.06] bg-dark-card card-hover cursor-pointer group">
                    {/* Mini thumb */}
                    <div className="w-24 h-20 rounded-xl bg-gradient-to-br from-brand-purple/15 to-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="text-3xl opacity-30">📄</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-purple/12 text-brand-violet border border-brand-purple/20">
                          {article.category}
                        </span>
                        <span className="text-xs text-white/25">{timeAgo(article.published_at)}</span>
                      </div>
                      <h3 className="font-display font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-violet transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-white/30">
                        <span>@{article.profiles?.username || 'unknown'}</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {article.reading_time}m read</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {formatNumber(article.views_count)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Trending articles */}
            <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-brand-violet" />
                <h3 className="font-display font-bold text-white">Trending</h3>
              </div>
              <div className="space-y-3">
                {!articles || articles.length === 0 ? (
                  <div className="text-xs text-white/50 text-center py-4">No trending articles</div>
                ) : null}
                {articles?.slice(0, 5).map((a, i) => (
                  <Link key={a.id} href={`/blog/${a.slug}`}>
                    <div className="flex gap-3 hover:bg-white/[0.02] p-2 rounded-xl transition-all cursor-pointer">
                      <span className="font-display font-black text-2xl text-white/10 w-7 shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-white/70 line-clamp-2 leading-snug hover:text-brand-violet transition-colors">
                          {a.title}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">{a.reading_time}m · {formatNumber(a.views_count)} views</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Write CTA */}
            <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/8 p-5">
              <h3 className="font-display font-bold text-white mb-2">Start Writing</h3>
              <p className="text-sm text-white/50 mb-4 leading-relaxed">Share your knowledge with 50,000+ readers on CreatoHub.</p>
              <Link href="/blog/new">
                <button className="w-full h-9 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-all">
                  Write an Article
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
