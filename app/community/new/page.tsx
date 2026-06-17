'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, MessageSquare, Link2, Image, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: MessageSquare, desc: 'Share thoughts, insights, or stories' },
  { id: 'link', label: 'Link', icon: Link2, desc: 'Share a useful resource or article' },
  { id: 'image', label: 'Image', icon: Image, desc: 'Share a screenshot or visual' },
  { id: 'question', label: 'Question', icon: HelpCircle, desc: 'Ask the community for help' },
]

export default function NewCommunityPostPage() {
  const [postType, setPostType] = useState('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() && tags.length < 5) {
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
    if (!user) { setError('You must be logged in'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!profile) { setError('Profile not found'); setLoading(false); return }

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim() || null,
      post_type: postType as 'text' | 'link' | 'image' | 'question',
      link_url: postType === 'link' ? linkUrl.trim() || null : null,
      image_url: null,
      tags,
    })

    if (error) { setError(error.message); setLoading(false) }
    else router.push('/community')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/community">
            <button className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="font-display font-black text-lg text-white">Create Post</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <><Send className="h-4 w-4" /> Post</>
            )}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Post type selector */}
          <div className="grid grid-cols-4 gap-3">
            {POST_TYPES.map(pt => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setPostType(pt.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                  postType === pt.id
                    ? 'border-brand-purple/40 bg-brand-purple/15 text-brand-violet'
                    : 'border-white/[0.06] bg-dark-card text-white/40 hover:border-white/15 hover:text-white'
                }`}
              >
                <pt.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{pt.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">
              Title <span className="text-red-400">*</span>
            </label>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Write a clear, descriptive title..."
              required
              rows={2}
              maxLength={300}
              className="w-full px-4 py-3 rounded-2xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm resize-none transition-all leading-relaxed"
            />
            <p className="text-xs text-white/25 text-right">{title.length}/300</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                postType === 'question' ? 'Provide more context for your question...' :
                postType === 'link' ? 'Add your thoughts about this resource...' :
                'Share your insights, story, or knowledge...'
              }
              rows={8}
              className="w-full px-4 py-3 rounded-2xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Link URL (for link type) */}
          {postType === 'link' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 px-4 rounded-xl bg-dark-card border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Tags (up to 5)</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-dark-card border border-white/[0.06] focus-within:border-brand-purple/50 transition-all min-h-[52px]">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand-purple/15 text-brand-violet border border-brand-purple/25"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="hover:text-white transition-colors"
                  >×</button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'Type a tag and press Enter...' : 'Add tag...'}
                  className="flex-1 min-w-24 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
              )}
            </div>
            <p className="text-xs text-white/25">Pick from: ai, business, coding, design, productivity, startup, tools, marketing</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Guidelines */}
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-4 text-xs text-white/30 leading-relaxed space-y-1">
            <p className="font-medium text-white/50 mb-2">Community Guidelines</p>
            <p>✅ Share useful, high-value content that helps others</p>
            <p>✅ Be specific and provide context in your posts</p>
            <p>❌ No spam, excessive self-promotion, or low-effort posts</p>
          </div>
        </form>
      </div>
    </div>
  )
}
