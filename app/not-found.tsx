import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <p className="font-display font-black text-[120px] leading-none text-white/[0.04] select-none">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center font-display font-black text-[120px] leading-none text-gradient opacity-20 blur-2xl select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-display font-black text-6xl text-gradient">404</p>
          </div>
        </div>

        {/* Content */}
        <h1 className="font-display font-black text-2xl text-white mb-3">
          Page not found
        </h1>
        <p className="text-white/40 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <button className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 transition-all">
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </Link>
          <Link href="/search">
            <button className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 font-medium transition-all">
              <Search className="h-4 w-4" />
              Search Content
            </button>
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-12 flex items-center justify-center gap-6">
          {['AI Tools', 'Business', 'Coding', 'Design'].map(cat => (
            <Link key={cat} href={`/categories?filter=${cat.toLowerCase()}`}>
              <span className="text-xs text-white/25 hover:text-brand-violet transition-colors cursor-pointer">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
