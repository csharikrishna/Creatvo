import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { Flame, Tag, Monitor, Briefcase, Zap, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Exclusive Offers',
  description: 'Exclusive software discounts, hardware deals, and sponsorships for Creatvo creators.',
}

const TABS = [
  { id: 'all', label: 'All Deals', icon: Zap },
  { id: 'software', label: 'Software', icon: Flame },
  { id: 'hardware', label: 'Hardware', icon: Monitor },
  { id: 'sponsorships', label: 'Sponsorships', icon: Briefcase },
]

type Offer = {
  id: string
  title: string
  brand: string
  description: string
  discount: string
  category: string
  color: string
}

const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Notion Plus for Creators',
    brand: 'Notion',
    description: 'Get 6 months of Notion Plus for free. Organize your content calendar, scripts, and brand deals in one place.',
    discount: '6 Months Free',
    category: 'software',
    color: 'bg-zinc-100 text-zinc-900',
  },
  {
    id: '2',
    title: 'Figma Professional',
    brand: 'Figma',
    description: 'Design your thumbnails, channel art, and digital products with a free year of Figma Pro.',
    discount: '1 Year Free',
    category: 'software',
    color: 'bg-purple-500 text-white',
  },
  {
    id: '3',
    title: 'Rode Wireless GO II',
    brand: 'Rode',
    description: 'Exclusive 20% discount on the industry-leading wireless microphone system for vloggers.',
    discount: '20% OFF',
    category: 'hardware',
    color: 'bg-red-500 text-white',
  },
  {
    id: '4',
    title: 'Sony ZV-E10 Creator Kit',
    brand: 'Sony',
    description: 'Get $100 cashback and a free 64GB SD card when you purchase the ultimate vlogging camera.',
    discount: '$100 Cashback',
    category: 'hardware',
    color: 'bg-blue-600 text-white',
  },
  {
    id: '5',
    title: 'Tech Sponsorship Pilot',
    brand: 'Logitech',
    description: 'Seeking tech reviewers for the new MX Master series. Free gear in exchange for an honest review.',
    discount: 'Free Gear',
    category: 'sponsorships',
    color: 'bg-teal-500 text-white',
  },
  {
    id: '6',
    title: 'Epidemic Sound Commercial',
    brand: 'Epidemic Sound',
    description: 'Never worry about copyright claims again. Enjoy 50% off your first year of unlimited music.',
    discount: '50% OFF',
    category: 'software',
    color: 'bg-rose-500 text-white',
  },
  {
    id: '7',
    title: 'Vercel Pro',
    brand: 'Vercel',
    description: 'Hosting a portfolio or digital product? Get $500 in Vercel credits for your first project.',
    discount: '$500 Credits',
    category: 'software',
    color: 'bg-zinc-900 text-white border border-zinc-700',
  },
  {
    id: '8',
    title: 'Fitness Brand Ambassador',
    brand: 'Gymshark',
    description: 'Looking for fitness creators with 10k+ followers. Paid campaigns and free apparel drops.',
    discount: 'Paid + Perks',
    category: 'sponsorships',
    color: 'bg-black text-white',
  },
]

export default async function OffersPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tab = searchParams.tab || 'all'

  const filteredOffers = tab === 'all' 
    ? MOCK_OFFERS 
    : MOCK_OFFERS.filter(offer => offer.category === tab)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-dark-card pt-16 pb-20">
        <div className="absolute inset-0 bg-gradient-hero mix-blend-screen opacity-50" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
            <Flame className="h-4 w-4" />
            Exclusive Deals
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Level up your toolkit. <br className="hidden md:block" />
            <span className="text-gradient">For less.</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Discounts on industry-leading software, hardware deals, and exclusive brand sponsorships available only to Creatvo creators.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/offers?tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="group relative rounded-3xl border border-white/5 bg-dark-card p-6 flex flex-col card-hover">
              <div className="flex items-start justify-between mb-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-display font-black text-xl shadow-lg ${offer.color}`}>
                  {offer.brand[0]}
                </div>
                <div className="px-3 py-1 rounded-full bg-brand-purple/10 text-brand-light text-xs font-bold border border-brand-purple/20">
                  {offer.discount}
                </div>
              </div>

              <h3 className="text-white/50 text-sm font-medium mb-1">{offer.brand}</h3>
              <h2 className="font-display text-xl font-bold text-white mb-3 group-hover:text-brand-light transition-colors">
                {offer.title}
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-8 flex-1">
                {offer.description}
              </p>

              <button className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5">
                <Tag className="h-4 w-4" />
                Claim Offer
              </button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl border border-brand-purple/20 bg-dark-card p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-10" />
          <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-4 relative z-10">
            Are you a brand looking to sponsor creators?
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto relative z-10">
            Get your product in front of thousands of highly engaged creators on Creatvo.
          </p>
          <button className="relative z-10 inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 transition-all">
            Partner with us
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
