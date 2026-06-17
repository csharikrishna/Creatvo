import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Creatvo — Social Publishing Platform',
    template: '%s | Creatvo',
  },
  description: 'Create, share, and grow. The modern platform for creators — write, publish, and build your audience.',
  keywords: ['creator platform', 'social publishing', 'blogging', 'content creation', 'AI tools', 'coding', 'design'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://creatvo.com'),
  openGraph: {
    type: 'website',
    siteName: 'Creatvo',
    title: 'Creatvo — Social Publishing Platform',
    description: 'Create, share, and grow. The modern platform for creators.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@creatvo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-dark-bg text-white antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0A0A0A',
              border: '1px solid #27272A',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
