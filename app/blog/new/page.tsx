'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RichEditor } from '@/components/content/RichEditor'
import { slugify, readingTime } from '@/lib/utils/index'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'
import {
  Save, Send, Eye, X, Plus, ChevronDown, Camera,
  AlertCircle, Loader2, ArrowLeft, Clock, Tag
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Save as Draft' },
  { value: 'published', label: 'Publish Now' },
]

export default function NewBlogPage() {
  const router = useRouter()
  const supabase = createClient()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showSEO, setShowSEO] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [articleId, setArticleId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login')
      else setUserId(data.user.id)
    })
  }, [])

  // Auto-generate slug from title
  const slug = slugify(title || 'untitled')
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200))

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }, [tagInput, tags])

  // Auto-save logic
  useEffect(() => {
    if (!userId || !title.trim() || status === 'published') return
    
    const timer = setTimeout(() => {
      handleSave('draft', true)
    }, 30000) // Auto-save every 30s of inactivity
    
    return () => clearTimeout(timer)
  }, [title, content, excerpt, category, tags, userId, status])

  const handleCoverSelect = (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error('Cover image must be under 2MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image'); return }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile || !userId) return null

    const ext = coverFile.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('article-images')
      .upload(path, coverFile, { contentType: coverFile.type, upsert: false })

    if (error) throw error

    const { data } = supabase.storage.from('article-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async (publishStatus: 'draft' | 'published' = status, isAutoSave = false) => {
    if (!userId) { if (!isAutoSave) toast.error('Not authenticated'); return }
    if (!title.trim()) { if (!isAutoSave) toast.error('Please add a title'); return }
    if (publishStatus === 'published' && !content.trim()) {
      toast.error('Content cannot be empty to publish')
      return
    }

    if (!isAutoSave) setSaving(true)
    const toastId = isAutoSave ? undefined : toast.loading(publishStatus === 'published' ? 'Publishing...' : 'Saving draft...')

    try {
      let coverUrl: string | null = null
      if (coverFile) {
        coverUrl = await uploadCover()
      }

      const articleSlug = articleId ? slug : await ensureUniqueSlug(slug, userId)

      const articleData = {
        user_id: userId,
        title: title.trim(),
        slug: articleSlug,
        excerpt: excerpt.trim() || null,
        content,
        cover_image: coverUrl,
        tags,
        category: category || null,
        status: publishStatus,
        reading_time: estimatedReadTime,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDesc.trim() || null,
        published_at: publishStatus === 'published' ? new Date().toISOString() : null,
      }

      let query = supabase.from('articles')
      if (articleId) {
        query = query.update(articleData).eq('id', articleId)
      } else {
        query = query.insert(articleData)
      }

      const { data, error } = await query.select('id, slug').single()

      if (error) throw error
      
      if (!articleId) {
        setArticleId(data.id)
      }

      if (!isAutoSave) {
        toast.success(
          publishStatus === 'published' ? '🎉 Article published!' : '📁 Draft saved!',
          { id: toastId }
        )
        router.push(publishStatus === 'published' ? `/blog/${data.slug}` : '/dashboard/content')
      } else {
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 3000)
      }
    } catch (err: unknown) {
      if (!isAutoSave) {
        const msg = err instanceof Error ? err.message : 'Save failed'
        toast.error(msg, { id: toastId })
        setSaving(false)
      }
    }
  }

  const ensureUniqueSlug = async (base: string, uid: string): Promise<string> => {
    let candidate = base
    let counter = 0
    while (true) {
      const { data } = await supabase
        .from('articles')
        .select('id')
        .eq('user_id', uid)
        .eq('slug', candidate)
        .single()
      if (!data) return candidate
      counter++
      candidate = `${base}-${counter}`
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/blog">
              <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <p className="text-xs text-white/30 font-medium">New Article</p>
              <div className="flex items-center gap-2 text-xs text-white/20">
                <Clock className="h-3 w-3" />
                {estimatedReadTime} min read · {wordCount} words
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {autoSaved && <span className="text-xs text-white/25">Auto-saved</span>}

            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>

            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Cover Image */}
        <div
          className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-white/[0.08] cursor-pointer group hover:border-brand-purple/30 transition-all"
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreview ? (
            <>
              <Image src={coverPreview} alt="Cover" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
                <span className="ml-2 text-white font-medium">Change Cover</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null) }}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20 group-hover:text-brand-violet/50 transition-colors">
              <Camera className="h-8 w-8" />
              <p className="text-sm">Add a cover image</p>
              <p className="text-xs">JPG, PNG or WebP · max 2MB</p>
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
        />

        {/* Title */}
        <div>
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Your article title..."
            rows={2}
            className="w-full bg-transparent text-4xl md:text-5xl font-display font-black text-white placeholder:text-white/15 focus:outline-none resize-none leading-tight"
          />
        </div>

        {/* Excerpt */}
        <div>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="A short summary that appears in previews and search results..."
            rows={2}
            className="w-full bg-transparent text-lg text-white/40 placeholder:text-white/15 focus:outline-none resize-none leading-relaxed border-b border-white/[0.06] pb-4"
          />
          <p className="text-xs text-white/20 text-right mt-1">{excerpt.length}/300</p>
        </div>

        {/* Tags & Category row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 text-sm focus:outline-none focus:border-brand-purple/40 appearance-none cursor-pointer"
            >
              <option value="" className="bg-dark-card">Select category</option>
              {PLATFORM_CATEGORIES.map(c => (
                <option key={c.slug} value={c.label} className="bg-dark-card">{c.icon} {c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-purple/15 text-brand-violet border border-brand-purple/20">
                #{tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {tags.length < 8 && (
              <div className="flex items-center gap-1">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
                  }}
                  placeholder="Add tag..."
                  className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-purple/40 w-28 transition-all"
                />
                <button onClick={addTag} className="h-8 w-8 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <RichEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your story... (paste an image or YouTube URL to embed)"
        />

        {/* SEO Settings */}
        <div className="rounded-2xl border border-white/[0.06] bg-dark-card overflow-hidden">
          <button
            onClick={() => setShowSEO(!showSEO)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm text-white/60 hover:text-white transition-colors"
          >
            <span className="font-medium">SEO Settings (optional)</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showSEO ? 'rotate-180' : ''}`} />
          </button>
          {showSEO && (
            <div className="px-6 pb-6 space-y-4 border-t border-white/[0.06]">
              <div className="space-y-1.5 pt-4">
                <label className="text-xs font-medium text-white/50">SEO Title</label>
                <input
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value.slice(0, 70))}
                  placeholder={title || 'Custom title for search engines'}
                  className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-purple/40"
                />
                <p className="text-xs text-white/25 text-right">{seoTitle.length}/70</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Meta Description</label>
                <textarea
                  value={seoDesc}
                  onChange={e => setSeoDesc(e.target.value.slice(0, 160))}
                  placeholder={excerpt || 'Short description for search results'}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-purple/40 resize-none"
                />
                <p className="text-xs text-white/25 text-right">{seoDesc.length}/160</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-white/30 mb-1">Preview slug</p>
                <p className="text-xs text-brand-violet font-mono">/blog/{slug}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
