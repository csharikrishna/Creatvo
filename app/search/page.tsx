import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { Search, Users, FileText, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatNumber, timeAgo } from '@/lib/utils/index'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search creators, articles, and content on Creatvo',
}

interface Props {
  searchParams: { q?: string; type?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const supabase = createClient()
  const query = searchParams.q?.trim() || ''
  const activeType = searchParams.type || 'all'

  const [{ data: { user } }] = await Promise.all([supabase.auth.getUser()])

  let profiles: Array<{ id: string; username: string; full_name: string | null; avatar_url: string | null; bio: string | null; followers_count: number; is_verified: boolean }> = []
  let articles: Array<{ id: string; slug: string; title: string; excerpt: string | null; cover_image: string | null; reading_time: number; views_count: number; likes_count: number; published_at: string | null; tags: string[]; profiles: { username: string; full_name: string | null; avatar_url: string | null } | null }> = []

  if (query.length >= 2) {
    const [profilesRes, articlesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, followers_count, is_verified')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(12),
      supabase
        .from('articles')
        .select('id, slug, title, excerpt, cover_image, reading_time, views_count, likes_count, published_at, tags, profiles(username, full_name, avatar_url)')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('views_count', { ascending: false })
        .limit(12),
    ])

    profiles = profilesRes.data || []
    // The typed client returns SelectQueryError for the profiles join — cast via unknown to resolve
    articles = (articlesRes.data as unknown as typeof articles) || []
  }

  const totalResults = profiles.length + articles.length
  const TRENDING_SEARCHES = ['AI tools', 'startup', 'coding', 'design', 'marketing', 'productivity', 'finance', 'python']

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-10">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <form method="GET" action="/search">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-brand-violet transition-colors" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search creators, articles, tags..."
                autoFocus
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/40 text-base transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold"
              >
                Search
              </button>
            </div>
          </form>

          {/* Trending searches */}
          {!query && (
            <div className="mt-4">
              <p className="text-xs text-white/30 mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Trending searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map(s => (
                  <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}>
                    <span className="px-3 py-1.5 rounded-xl text-sm text-white/50 border border-white/[0.06] bg-white/[0.02] hover:text-brand-violet hover:border-brand-purple/25 transition-all cursor-pointer">
                      {s}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {query.length >= 2 && (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-white/40 text-sm">
                {totalResults > 0
                  ? `Found ${totalResults} results for "${query}"`
                  : `No results for "${query}"`}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'All', count: totalResults },
                { id: 'creators', label: 'Creators', count: profiles.length, icon: Users },
                { id: 'articles', label: 'Articles', count: articles.length, icon: FileText },
              ].map(tab => (
                <Link key={tab.id} href={`/search?q=${encodeURIComponent(query)}&type=${tab.id}`}>
                  <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeType === tab.id
                      ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/25'
                      : 'text-white/50 border border-white/[0.06] hover:text-white'
                  }`}>
                    {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
                    {tab.label}
                    <span className="text-xs opacity-60">({tab.count})</span>
                  </button>
                </Link>
              ))}
            </div>

            {/* Creators */}
            {profiles.length > 0 && (activeType === 'all' || activeType === 'creators') && (
              <section className="mb-10">
                <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-violet" />
                  Creators
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profiles.map(p => (
                    <Link key={p.id} href={`/@${p.username}`}>
                      <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-dark-card hover:border-brand-purple/20 transition-all cursor-pointer group">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-brand-purple to-brand-accent shrink-0">
                          {p.avatar_url ? (
                            <Image src={p.avatar_url} alt="" width={48} height={48} className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white font-bold">
                              {(p.full_name || p.username)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate group-hover:text-brand-violet transition-colors">
                            {p.full_name || p.username}
                          </p>
                          <p className="text-xs text-white/40 truncate">@{p.username}</p>
                          <p className="text-xs text-white/25">{formatNumber(p.followers_count)} followers</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {articles.length > 0 && (activeType === 'all' || activeType === 'articles') && (
              <section>
                <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-violet" />
                  Articles
                </h2>
                <div className="space-y-3">
                  {articles.map(a => {
                    const authorProfile = a.profiles
                    return (
                      <Link key={a.id} href={`/blog/${a.slug}`}>
                        <article className="flex gap-4 p-4 rounded-2xl border border-white/[0.06] bg-dark-card hover:border-brand-purple/20 transition-all cursor-pointer group">
                          <div className="w-24 h-20 rounded-xl bg-gradient-to-br from-brand-purple/15 to-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                            {a.cover_image ? (
                              <Image src={a.cover_image} alt="" width={96} height={80} className="object-cover w-full h-full" />
                            ) : (
                              <FileText className="h-6 w-6 text-white/10" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 group-hover:text-brand-violet transition-colors">
                              {a.title}
                            </h3>
                            {a.excerpt && (
                              <p className="text-white/40 text-xs line-clamp-1 mb-2">{a.excerpt}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-white/25">
                              {authorProfile && <span>@{authorProfile.username}</span>}
                              <span>{a.reading_time}m read</span>
                              <span>{formatNumber(a.views_count)} views</span>
                              {a.published_at && <span>{timeAgo(a.published_at)}</span>}
                            </div>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {totalResults === 0 && (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <h3 className="font-display font-bold text-white text-xl mb-2">No results found</h3>
                <p className="text-white/40">Try different keywords or browse our categories</p>
                <Link href="/categories">
                  <button className="mt-4 px-5 py-2.5 rounded-xl bg-brand-purple/20 text-brand-violet border border-brand-purple/25 text-sm font-medium hover:opacity-80 transition-all">
                    Browse Categories
                  </button>
                </Link>
              </div>
            )}
          </>
        )}

        {query.length > 0 && query.length < 2 && (
          <p className="text-center text-white/30 py-10">Type at least 2 characters to search</p>
        )}
      </div>

      <Footer />
    </div>
  )
}
