'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'

export function CategoryGrid() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-black text-white">Explore Top Categories</h2>
            <p className="text-white/40 mt-1 text-sm">Find content across all niches</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-brand-violet text-sm font-semibold hover:gap-2 transition-all group">
            View all
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {PLATFORM_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categories?filter=${cat.slug}`} className="snap-start shrink-0">
              <div className="flex flex-col items-center gap-3 w-[88px] group cursor-pointer">
                <div
                  className="w-16 h-16 rounded-2xl border border-white/[0.06] flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110 group-hover:border-opacity-60 shadow-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}15, ${cat.color}08)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)` }}
                  />
                  <span className="relative">{cat.icon}</span>
                </div>
                <span className="text-xs text-white/40 group-hover:text-white text-center font-medium transition-colors leading-tight">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}

          {/* More */}
          <div className="snap-start shrink-0 flex flex-col items-center gap-3 w-[88px] cursor-pointer group">
            <Link href="/categories">
              <div className="w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center group-hover:border-white/20 group-hover:scale-110 transition-all shadow-lg">
                <span className="text-white/30 text-xl tracking-widest">···</span>
              </div>
            </Link>
            <span className="text-xs text-white/40 text-center font-medium">More</span>
          </div>
        </div>
      </div>
    </section>
  )
}
