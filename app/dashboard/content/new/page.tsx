'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Link2, Image, FileText, LayoutGrid, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'

const CONTENT_TYPES = [
  { id: 'link', label: 'Link / Resource', icon: Link2, desc: 'Share an external tool or website' },
  { id: 'image', label: 'Image', icon: Image, desc: 'Share a visual or infographic' },
  { id: 'text', label: 'Text Post', icon: FileText, desc: 'Share an idea or insight' },
  { id: 'carousel', label: 'Carousel', icon: LayoutGrid, desc: 'Multiple images in one post' },
]

export default function NewContentPage() {
  const [contentType, setContentType] = useState('link')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() && tags.length < 8) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (tag && !tags.includes(tag)) setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    // Get or create category
    let categoryId = selectedCategory
    if (!categoryId) {
      const defaultCat = PLATFORM_CATEGORIES[0]
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', defaultCat.slug)
        .single()

      if (cat) {
        categoryId = cat.id
      } else {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            title: defaultCat.label,
            slug: defaultCat.slug,
            icon: defaultCat.icon,
            banner_url: null,
            description: defaultCat.description || null,
            order_index: 0,
          })
          .select('id')
          .single()
        if (newCat) categoryId = newCat.id
      }
    }

    if (!categoryId) { setError('Could not create category'); setLoading(false); return }

    const { error: insertError } = await supabase.from('content_items').insert({
      user_id: user.id,
      category_id: categoryId,
      title: title.trim(),
      thumbnail_url: null,
      description: description.trim() || null,
      external_link: externalLink.trim() || null,
      download_link: null,
      content_type: contentType as 'link' | 'image' | 'video' | 'carousel' | 'text' | 'resource',
      tags,
    })

    if (insertError) { setError(insertError.message); setLoading(false) }
    else router.push('/dashboard/content')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-4">
        <div className="container mx-auto max-w-3xl flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="font-display font-black text-lg text-white">Add Content</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="ml-auto flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <><Upload className="h-4 w-4" /> Publish</>
            )}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Content type */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-3">Content Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setContentType(ct.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                    contentType === ct.id
                      ? 'border-brand-purple/40 bg-brand-purple/15 text-brand-violet'
                      : 'border-white/[0.06] bg-dark-card text-white/40 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <ct.icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-3">Thumbnail</label>
            <div className="aspect-video rounded-2xl border-2 border-dashed border-white/[0.08] bg-dark-card flex flex-col items-center justify-center gap-3 hover:border-brand-purple/30 transition-all cursor-pointer group">
              <div className="h-12 w-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center group-hover:bg-brand-purple/20 transition-all">
                <Upload className="h-6 w-6 text-brand-violet" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/60">Click to upload thumbnail</p>
                <p className="text-xs text-white/30 mt-1">PNG, JPG up to 5MB · 16:9 recommended</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your content a clear, descriptive title..."
              required
              maxLength={200}
              className="w-full h-12 px-4 rounded-xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
            />
            <p className="text-xs text-white/25 mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this content is about..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm resize-none transition-all leading-relaxed"
            />
          </div>

          {/* External Link */}
          {(contentType === 'link' || contentType === 'resource') && (
            <div>
              <label className="text-sm font-medium text-white/60 block mb-2">External Link</label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="url"
                  value={externalLink}
                  onChange={e => setExternalLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30'
                      : 'bg-dark-card border border-white/[0.06] text-white/50 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-white/60 block mb-2">Tags (up to 8)</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-dark-card border border-white/[0.06] focus-within:border-brand-purple/50 transition-all min-h-[52px]">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand-purple/15 text-brand-violet border border-brand-purple/25">
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {tags.length < 8 && (
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'Add tags (press Enter)...' : 'Add more...'}
                  className="flex-1 min-w-24 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
