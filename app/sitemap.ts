import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://creatvo.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ]

  try {
    const supabase = createClient()

    // Creator profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .order('followers_count', { ascending: false })
      .limit(1000)

    const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map(p => ({
      url: `${baseUrl}/@${p.username}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, profiles(username)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5000)

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((a: any) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...profileRoutes, ...articleRoutes]
  } catch {
    return staticRoutes
  }
}
