import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { ContentCard } from '@/components/content-card/ContentCard'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'
import { LayoutGrid, Search } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ContentItem, Profile } from '@/types'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse content by category — AI, Business, Coding, Design, and more.',
}

const mockProfile: Profile = {
  id: '1', username: 'techguru', full_name: 'TechGuru', bio: null,
  avatar_url: null, banner_url: null, creator_type: 'Tech Creator',
  website_url: null, twitter_url: null, instagram_url: null,
  followers_count: 86300, following_count: 120, views_count: 1200000,
  posts_count: 245, is_verified: true, interests: [],
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}

function getMockItemsForCategory(catSlug: string): ContentItem[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `${catSlug}-${i}`,
    category_id: catSlug,
    user_id: '1',
    title: `Top ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} Resource #${i + 1}`,
    thumbnail_url: null,
    description: 'High value resource for creators and builders.',
    external_link: null,
    download_link: null,
    content_type: 'resource' as const,
    tags: [catSlug],
    views_count: Math.floor(50000 - i * 8000),
    clicks_count: Math.floor(3000 - i * 400),
    likes_count: Math.floor(1200 - i * 200),
    saves_count: Math.floor(800 - i * 100),
    shares_count: Math.floor(200 - i * 30),
    engagement_score: 500 - i * 60,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: mockProfile,
  }))
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const activeFilter = searchParams.filter

  const displayCats = activeFilter
    ? PLATFORM_CATEGORIES.filter(c => c.slug === activeFilter)
    : PLATFORM_CATEGORIES

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-brand-violet" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white">
                {activeFilter ? PLATFORM_CATEGORIES.find(c => c.slug === activeFilter)?.label : 'All Categories'}
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                {activeFilter ? `Browse ${PLATFORM_CATEGORIES.find(c => c.slug === activeFilter)?.label} content` : 'Explore content across all niches'}
              </p>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/categories">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              !activeFilter
                ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-white/[0.06]'
            }`}>
              All
            </div>
          </Link>
          {PLATFORM_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categories?filter=${cat.slug}`}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeFilter === cat.slug
                  ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-white/[0.06]'
              }`}>
                <span>{cat.icon}</span>
                {cat.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Category sections */}
        <div className="space-y-14">
          {displayCats.map((cat) => (
            <section key={cat.slug}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-2xl border border-white/[0.06]"
                    style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)` }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-black text-white">{cat.label}</h2>
                    <p className="text-xs text-white/40">{getMockItemsForCategory(cat.slug).length} resources</p>
                  </div>
                </div>
                <Link
                  href={`/categories?filter=${cat.slug}`}
                  className="text-sm text-brand-violet hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {getMockItemsForCategory(cat.slug).map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
