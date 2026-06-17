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

const MOCK_ARTICLES = [
  {
    id: '1', slug: 'how-to-build-saas-india', title: 'How to Build a SaaS Product in India with ₹0 in 2024',
    excerpt: 'A complete guide to building and launching a profitable SaaS product with no upfront investment. Learn the exact tools, strategies, and marketing tactics that work.',
    cover_image: null, reading_time: 12, views_count: 48500, likes_count: 1840, saves_count: 2100,
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(), tags: ['saas', 'startup', 'india'],
    category: 'Business', profiles: { username: 'builderwala', full_name: 'BuilderWala', avatar_url: null, is_verified: true }
  },
  {
    id: '2', slug: 'complete-guide-ai-tools-creators', title: 'The Complete Guide to AI Tools for Content Creators in 2024',
    excerpt: 'Every AI tool you need for writing, design, video, and automation. Tested and ranked by a creator with 100K+ followers.',
    cover_image: null, reading_time: 8, views_count: 36200, likes_count: 1240, saves_count: 1900,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(), tags: ['ai', 'tools', 'creators'],
    category: 'AI', profiles: { username: 'techguru', full_name: 'TechGuru', avatar_url: null, is_verified: true }
  },
  {
    id: '3', slug: 'instagram-growth-2024', title: '17 Instagram Growth Hacks That Actually Worked in 2024',
    excerpt: 'I grew from 2K to 50K followers using these exact tactics. No paid promotion, no bots, just strategy.',
    cover_image: null, reading_time: 6, views_count: 29100, likes_count: 980, saves_count: 1600,
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(), tags: ['instagram', 'growth', 'marketing'],
    category: 'Marketing', profiles: { username: 'growthHacker', full_name: 'GrowthHacker', avatar_url: null, is_verified: false }
  },
  {
    id: '4', slug: 'learn-python-free-resources', title: 'Learn Python for Free: 25 Resources Ranked by Quality',
    excerpt: 'Curated list of the best free Python learning resources. From absolute beginner to job-ready developer.',
    cover_image: null, reading_time: 5, views_count: 22800, likes_count: 870, saves_count: 2800,
    published_at: new Date(Date.now() - 86400000 * 10).toISOString(), tags: ['python', 'coding', 'free'],
    category: 'Coding', profiles: { username: 'coderlife', full_name: 'Coder Life', avatar_url: null, is_verified: false }
  },
  {
    id: '5', slug: 'notion-productivity-system', title: 'The Ultimate Notion Productivity System for Entrepreneurs',
    excerpt: 'How I manage my entire business, content pipeline, and personal life inside Notion. Full template included.',
    cover_image: null, reading_time: 10, views_count: 18900, likes_count: 720, saves_count: 2200,
    published_at: new Date(Date.now() - 86400000 * 14).toISOString(), tags: ['notion', 'productivity', 'templates'],
    category: 'Productivity', profiles: { username: 'pkmenthusiast', full_name: 'PKM Enthusiast', avatar_url: null, is_verified: false }
  },
]

const CATEGORY_FILTERS = ['All', 'AI', 'Business', 'Coding', 'Design', 'Marketing', 'Productivity', 'Finance']

export default async function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const activeCategory = searchParams.category || 'All'

  const featured = MOCK_ARTICLES[0]
  const rest = MOCK_ARTICLES.slice(1)

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
                          {featured.profiles.username[0].toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{featured.profiles.full_name}</p>
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
                        <span>@{article.profiles.username}</span>
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
                {MOCK_ARTICLES.map((a, i) => (
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
