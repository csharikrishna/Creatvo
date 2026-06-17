import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { HeroSection } from '@/components/hero/HeroSection'
import { CategoryGrid } from '@/components/category-grid/CategoryGrid'
import { Footer } from '@/components/Footer'
import { CreatorCard, CreatorCardSkeleton } from '@/components/creator-card/CreatorCard'
import { ContentCard, ContentCardSkeleton } from '@/components/content-card/ContentCard'
import { ChevronRight, TrendingUp, Flame, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function TrendingCreators() {
  const supabase = createClient()
  const { data: creators } = await supabase
    .from('profiles')
    .select('*')
    .order('followers_count', { ascending: false })
    .limit(6)

  if (!creators?.length) return null

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
      {creators.map(creator => (
        <div key={creator.id} className="snap-start shrink-0">
          <CreatorCard profile={creator} />
        </div>
      ))}
    </div>
  )
}

async function PopularContent() {
  const supabase = createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(4)

  if (!articles?.length) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <ContentCardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {articles.map(article => <ContentCard key={article.id} item={article} />)}
    </div>
  )
}

async function LatestContent() {
  const supabase = createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(4)

  if (!articles?.length) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <ContentCardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {articles.map(article => <ContentCard key={article.id} item={article} />)}
    </div>
  )
}

const HOW_IT_WORKS = [
  { icon: '👤', step: '01', title: 'Create Account', desc: 'Sign up and create your creator profile in seconds.' },
  { icon: '🎯', step: '02', title: 'Complete Onboarding', desc: 'Set your username, bio, avatar, and creator type.' },
  { icon: '📤', step: '03', title: 'Publish Content', desc: 'Write articles, share posts, and build your audience.' },
  { icon: '🚀', step: '04', title: 'Grow & Connect', desc: 'Get followers, likes, and engage with your community.' },
]

export default async function HomePage() {
  const supabase = createClient()
  const [{ data: { user } }] = await Promise.all([
    supabase.auth.getUser(),
  ])

  // Get profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} profile={profile} />

      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <CategoryGrid />

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Trending Creators */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-brand-violet" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">Trending Creators</h2>
                <p className="text-white/40 text-sm mt-0.5">Top creators this week</p>
              </div>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 4 }).map((_, i) => <CreatorCardSkeleton key={i} />)}
            </div>
          }>
            <TrendingCreators />
          </Suspense>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Popular This Week */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">Popular This Week</h2>
                <p className="text-white/40 text-sm mt-0.5">Most viewed articles</p>
              </div>
            </div>
            <Link href="/blog" className="flex items-center gap-1 text-brand-violet text-sm font-semibold hover:gap-2 transition-all group">
              View all <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <ContentCardSkeleton key={i} />)}
            </div>
          }>
            <PopularContent />
          </Suspense>
        </div>
      </section>

      {/* Latest Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-black text-white">Latest Articles</h2>
                <p className="text-white/40 text-sm mt-0.5">Fresh from our creators</p>
              </div>
            </div>
            <Link href="/blog" className="flex items-center gap-1 text-brand-violet text-sm font-semibold hover:gap-2 transition-all group">
              View all <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <ContentCardSkeleton key={i} />)}
            </div>
          }>
            <LatestContent />
          </Suspense>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">How Creatvo Works</h2>
            <p className="text-white/40 max-w-lg mx-auto">Start creating, sharing, and growing in just 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative group">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-brand-purple/30 to-transparent z-10 -translate-x-4" />
                )}
                <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6 text-center card-hover">
                  <div className="relative mx-auto mb-5 h-16 w-16">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-accent/10 border border-brand-purple/20 flex items-center justify-center text-3xl">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold text-brand-violet bg-brand-purple/15 border border-brand-purple/25 rounded-full h-5 w-5 flex items-center justify-center">
                      {step.step.slice(1)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden border border-brand-purple/20">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/15 via-dark-card to-dark-card" />
            <div className="absolute top-0 right-0 w-96 h-64 bg-brand-accent/10 rounded-full blur-3xl" />
            <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
                  Ready to Start Creating?
                </h2>
                <p className="text-white/50 text-lg">Join thousands of creators building their digital presence.</p>
              </div>
              <Link href={user ? '/blog/new' : '/auth/signup'} className="shrink-0">
                <button className="group flex items-center gap-2 h-14 px-8 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-bold text-base hover:opacity-90 hover:shadow-2xl hover:shadow-brand-purple/40 transition-all active:scale-95 whitespace-nowrap">
                  {user ? 'Write an Article' : 'Get Started Free'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
