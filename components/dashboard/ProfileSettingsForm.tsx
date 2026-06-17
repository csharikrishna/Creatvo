'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { Camera, Save, Loader2, AlertCircle, Check } from 'lucide-react'
import { updateProfile } from '@/lib/actions/index'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  userEmail: string
}

const CREATOR_TYPES = [
  'Tech Creator', 'Business Expert', 'Design Creator', 'Finance Expert',
  'Marketing Pro', 'Educator', 'Fitness Coach', 'Travel Creator', 'Lifestyle Creator', 'Other'
]

export function ProfileSettingsForm({ profile, userEmail }: Props) {
  const supabase = createClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [creatorType, setCreatorType] = useState(profile.creator_type || '')
  const [website, setWebsite] = useState(profile.website_url || '')
  const [twitter, setTwitter] = useState(profile.twitter_url || '')
  const [instagram, setInstagram] = useState(profile.instagram_url || '')
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url)
  const [bannerPreview, setBannerPreview] = useState(profile.banner_url)
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Invalid file type'); return }

    setUploading(type)
    const bucket = type === 'avatar' ? 'avatars' : 'banners'
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${profile.id}/${Date.now()}.${ext}`

    const toastId = toast.loading(`Uploading ${type}...`)

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = data.publicUrl

      const column = type === 'avatar' ? 'avatar_url' : 'banner_url'

      if (column === 'avatar_url') {
        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      } else {
        await supabase.from('profiles').update({ banner_url: publicUrl }).eq('id', profile.id)
      }

      if (type === 'avatar') setAvatarPreview(publicUrl)
      else setBannerPreview(publicUrl)

      toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover'} updated!`, { id: toastId })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: toastId })
    } finally {
      setUploading(null)
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile({
          full_name: fullName,
          bio,
          creator_type: creatorType,
          website_url: website,
          twitter_url: twitter,
          instagram_url: instagram,
        })
        toast.success('Profile updated!')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Update failed')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/60">Cover Image</label>
        <div
          className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-dashed border-white/[0.08] cursor-pointer hover:border-brand-purple/30 transition-all group"
          onClick={() => bannerInputRef.current?.click()}
        >
          {bannerPreview ? (
            <Image src={bannerPreview} alt="Cover" fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-white/20 group-hover:text-brand-violet/40 transition-colors">
              <Camera className="h-5 w-5" />
              <span className="text-sm">Add cover image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading === 'banner'
              ? <Loader2 className="h-6 w-6 text-white animate-spin" />
              : <Camera className="h-6 w-6 text-white" />
            }
          </div>
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
        />
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/60">Profile Photo</label>
        <div className="flex items-center gap-4">
          <div
            className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-white/[0.08] cursor-pointer hover:border-brand-purple/30 transition-all group shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center text-white font-bold text-xl">
                {(profile.full_name || profile.username)[0].toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading === 'avatar'
                ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                : <Camera className="h-5 w-5 text-white" />
              }
            </div>
          </div>
          <div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-sm text-brand-violet hover:underline"
            >
              Change photo
            </button>
            <p className="text-xs text-white/30 mt-1">JPG, PNG or WebP · max 2MB</p>
          </div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
        />
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6 space-y-5">
        <h3 className="font-display font-bold text-white">Profile Info</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">Display Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/40 text-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">Username (read-only)</label>
            <div className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/40 text-sm flex items-center">
              @{profile.username}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Email (read-only)</label>
          <div className="w-full h-11 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/40 text-sm flex items-center">
            {userEmail}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 200))}
            placeholder="Write something about yourself..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/40 text-sm transition-all resize-none"
          />
          <p className="text-xs text-white/25 text-right">{bio.length}/200</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Creator Type</label>
          <select
            value={creatorType}
            onChange={e => setCreatorType(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:border-brand-purple/40 text-sm transition-all"
          >
            <option value="" className="bg-dark-card">Select type</option>
            {CREATOR_TYPES.map(t => <option key={t} value={t} className="bg-dark-card">{t}</option>)}
          </select>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-2xl border border-white/[0.06] bg-dark-card p-6 space-y-4">
        <h3 className="font-display font-bold text-white">Social Links</h3>
        {[
          { label: 'Website', value: website, onChange: setWebsite, placeholder: 'https://yoursite.com' },
          { label: 'Twitter / X', value: twitter, onChange: setTwitter, placeholder: 'https://twitter.com/username' },
          { label: 'Instagram', value: instagram, onChange: setInstagram, placeholder: 'https://instagram.com/username' },
        ].map(field => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-xs font-medium text-white/50">{field.label}</label>
            <input
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/40 text-sm transition-all"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
      >
        {isPending
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          : <><Save className="h-4 w-4" /> Save Changes</>
        }
      </button>
    </div>
  )
}
