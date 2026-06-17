import Link from 'next/link'
import { Twitter, Github, Instagram, Linkedin, ArrowUpRight } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Explore', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Trending', href: '/trending' },
    { label: 'Top Creators', href: '/creators' },
    { label: 'Blog', href: '/blog' },
  ],
  Creators: [
    { label: 'Start Creating', href: '/auth/signup' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/dashboard/analytics' },
    { label: 'Monetization', href: '/monetization' },
    { label: 'Creator Guide', href: '/guide' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
    { label: 'Advertise', href: '/advertise' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Guidelines', href: '/guidelines' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-dark-nav/40 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
                <span className="font-display font-black text-white text-lg">C</span>
              </div>
              <span className="font-display font-black text-xl text-white">
                Creato<span className="text-brand-violet">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              The knowledge discovery platform for creators, builders, and learners. Share what matters.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Github, href: 'https://github.com', label: 'GitHub' },
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map((social) => (
                <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                  <div className="h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all">
                    <social.icon className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-1 group">
                      {link.label}
                      {link.href.startsWith('http') && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-12 mt-12 border-t border-white/[0.04]">
          <p className="text-xs text-white/25">
            © 2024 CreatoHub. All rights reserved. Built with ❤️ for creators.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
