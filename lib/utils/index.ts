import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
    return `₹${amount}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function readingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateEngagementScore(
  likes: number,
  comments: number,
  saves: number,
  shares: number,
  views: number,
  createdAt: string
): number {
  const recencyHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  const recencyBoost = Math.max(0, 100 - recencyHours * 2)

  return (
    likes * 2 +
    comments * 3 +
    saves * 5 +
    shares * 4 +
    views * 0.1 +
    recencyBoost
  )
}

export const PLATFORM_CATEGORIES = [
  { slug: 'ai', label: 'AI Tools', icon: '🤖', description: 'Artificial intelligence tools and resources', color: '#7C3AED' },
  { slug: 'business', label: 'Business', icon: '💼', description: 'Business ideas, strategies, and resources', color: '#2563EB' },
  { slug: 'coding', label: 'Coding', icon: '💻', description: 'Programming tutorials and dev resources', color: '#059669' },
  { slug: 'design', label: 'Design', icon: '🎨', description: 'UI/UX, graphic design, and creative tools', color: '#DC2626' },
  { slug: 'productivity', label: 'Productivity', icon: '⚡', description: 'Tools and hacks for getting more done', color: '#D97706' },
  { slug: 'finance', label: 'Finance', icon: '💰', description: 'Money, investing, and financial literacy', color: '#16A34A' },
  { slug: 'marketing', label: 'Marketing', icon: '📢', description: 'Growth hacks and marketing strategies', color: '#EA580C' },
  { slug: 'startup', label: 'Startup', icon: '🚀', description: 'Startup ideas, tools, and founder stories', color: '#7C3AED' },
  { slug: 'movies', label: 'Movies', icon: '🎬', description: 'Movie recommendations and reviews', color: '#BE185D' },
  { slug: 'music', label: 'Music', icon: '🎵', description: 'Music apps, playlists, and artists', color: '#0891B2' },
  { slug: 'games', label: 'Games', icon: '🎮', description: 'Gaming apps, tools, and resources', color: '#4F46E5' },
  { slug: 'education', label: 'Education', icon: '📚', description: 'Learning resources and courses', color: '#B45309' },
  { slug: 'travel', label: 'Travel', icon: '✈️', description: 'Travel tips, guides, and destinations', color: '#0284C7' },
  { slug: 'fitness', label: 'Fitness', icon: '💪', description: 'Health, fitness, and wellness content', color: '#DC2626' },
  { slug: 'editing', label: 'Editing', icon: '✂️', description: 'Video and photo editing tools', color: '#7C3AED' },
]

