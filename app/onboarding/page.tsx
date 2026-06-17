'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Camera, Check, ArrowRight, AtSign, User, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'dashboard', 'support', 'login', 'signup', 'create',
  'root', 'official', 'system', 'moderator', 'mod', 'help', 'about',
  'contact', 'terms', 'privacy', 'onboarding', 'settings', 'auth',
])

const CREATOR_TYPES = [
  { label: 'Tech Creator', icon: '💻' },
  { label: 'Business Expert', icon: '💼' },
  { label: 'Design Creator', icon: '🎨' },
  { label: 'Finance Expert', icon: '💰' },
  { label: 'Marketing Pro', icon: '📢' },
  { label: 'Educator', icon: '📚' },
  { label: 'Fitness Coach', icon: '💪' },
  { label: 'Travel Creator', icon: '✈️' },
  { label: 'Lifestyle Creator', icon: '🌟' },
  { label: 'Other', icon: '🎯' },
]

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

type Step = 'profile' | 'creator' | 'avatar' | 'done'

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'Must be at least 3 characters'
  if (u.length > 20) return 'Must be 20 characters or less'
  if (!/^[a-z0-9_]+$/.test(u)) return 'Only lowercase letters, numbers, and underscores'
  if (RESERVED_USERNAMES.has(u)) return 'This username is reserved'
  return null
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('profile')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Profile fields
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'taken' | 'valid' | 'error'>('idle')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [creatorType, setCreatorType] = useState('')
  const [website, setWebsite] = useState('')

  // Images
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUserId(data.user.id)
      // Pre-fill from auth metadata
      const meta = data.user.user_metadata
      if (meta?.full_name) setDisplayName(meta.full_name)
      if (meta?.name) setDisplayName(prev => prev || meta.name)
      if (meta?.avatar_url) setAvatarPreview(meta.avatar_url)
    })
  }, [])

  // Debounced username check
  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); setUsernameError(null); return }

    const validationError = validateUsername(username)
    if (validationError) {
      setUsernameStatus('error')
      setUsernameError(validationError)
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (data) {
        setUsernameStatus('taken')
        setUsernameError('This username is already taken')
      } else {
        setUsernameStatus('valid')
        setUsernameError(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const handleImageSelect = (
    file: File,
    type: 'avatar' | 'cover'
  ) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }
    const url = URL.createObjectURL(file)
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url) }
    else { setCoverFile(file); setCoverPreview(url) }
    setError(null)
  }

  const uploadImage = async (file: File, bucket: string, userId: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleFinish = async () => {
    if (!userId) return
    if (usernameStatus !== 'valid') { setError('Please choose a valid username'); return }
    if (!displayName.trim()) { setError('Display name is required'); return }

    setLoading(true)
    setError(null)

    try {
      let avatarUrl: string | null = avatarPreview
      let coverUrl: string | null = coverPreview

      if (avatarFile) {
        setAvatarUploading(true)
        try {
          avatarUrl = await uploadImage(avatarFile, 'avatars', userId)
        } finally {
          setAvatarUploading(false)
        }
      }

      if (coverFile) {
        setCoverUploading(true)
        try {
          coverUrl = await uploadImage(coverFile, 'banners', userId)
        } finally {
          setCoverUploading(false)
        }
      }

      const ageNum = age ? parseInt(age, 10) : null
      if (ageNum !== null && (ageNum < 13 || ageNum > 120)) {
        setError('Please enter a valid age (13-120)')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          full_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          banner_url: coverUrl,
          creator_type: creatorType || 'Other',
          website_url: website.trim() || null,
          twitter_url: null,
          instagram_url: null,
          interests: [],
          onboarding_completed: true,
        }, { onConflict: 'id' })

      if (updateError) {
        console.error('Onboarding upsert error:', updateError)
        throw updateError
      }

      setStep('done')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setLoading(false)
    }
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'creator', label: 'Creator' },
    { id: 'avatar', label: 'Photos' },
  ]

  const stepIndex = steps.findIndex(s => s.id === step)

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-black text-white">You&apos;re all set!</h1>
          <p className="text-white/50">Taking you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.04] p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
              <span className="font-display font-black text-white text-sm">C</span>
            </div>
            <span className="font-display font-black text-white">Creatvo</span>
          </div>
          <p className="text-sm text-white/40">Complete your profile to continue</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-xs font-bold transition-all ${
                  i < stepIndex
                    ? 'bg-brand-purple border-brand-purple text-white'
                    : i === stepIndex
                    ? 'border-brand-purple text-brand-violet'
                    : 'border-white/10 text-white/20'
                }`}>
                  {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === stepIndex ? 'text-white' : 'text-white/30'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${i < stepIndex ? 'bg-brand-purple' : 'bg-white/[0.06]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Profile */}
          {step === 'profile' && (
            <div className="rounded-3xl border border-white/[0.06] bg-dark-card p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">Set up your profile</h1>
                <p className="text-white/40 text-sm">This is how others will find and know you</p>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/60">Username *</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
                    placeholder="yourname"
                    className="w-full h-12 pl-10 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-white/30 animate-spin" />}
                    {usernameStatus === 'valid' && <Check className="h-4 w-4 text-emerald-400" />}
                    {(usernameStatus === 'taken' || usernameStatus === 'error') && <AlertCircle className="h-4 w-4 text-red-400" />}
                  </div>
                </div>
                {usernameError && <p className="text-xs text-red-400">{usernameError}</p>}
                {usernameStatus === 'valid' && (
                  <p className="text-xs text-emerald-400">✓ Available — your page will be creatvo.com/@{username}</p>
                )}
                <p className="text-xs text-white/25">3-20 chars, lowercase letters, numbers, underscores only</p>
              </div>

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/60">Display Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/60">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white focus:outline-none focus:border-brand-purple/50 text-sm transition-all appearance-none"
                  >
                    <option value="" className="bg-dark-card">Select...</option>
                    {GENDERS.map(g => <option key={g} value={g} className="bg-dark-card">{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/60">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="Your age"
                    min={13}
                    max={120}
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/60">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 200))}
                    placeholder="Tell the world what you're about..."
                    rows={3}
                    className="w-full pl-10 pr-4 pt-3 pb-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all resize-none"
                  />
                </div>
                <p className="text-xs text-white/25 text-right">{bio.length}/200</p>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/60">Website (optional)</label>
                <input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                />
              </div>

              <button
                onClick={() => {
                  if (usernameStatus !== 'valid') { setError('Please choose a valid username'); return }
                  if (!displayName.trim()) { setError('Display name is required'); return }
                  setError(null)
                  setStep('creator')
                }}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Creator Type */}
          {step === 'creator' && (
            <div className="rounded-3xl border border-white/[0.06] bg-dark-card p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">What type of creator are you?</h1>
                <p className="text-white/40 text-sm">This shapes your dashboard and recommendations</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CREATOR_TYPES.map(type => (
                  <button
                    key={type.label}
                    onClick={() => setCreatorType(type.label)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-sm font-medium transition-all ${
                      creatorType === type.label
                        ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-violet'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('profile')}
                  className="flex-1 h-12 rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:border-white/15 text-sm font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!creatorType) { setError('Please select a creator type'); return }
                    setError(null)
                    setStep('avatar')
                  }}
                  className="flex-2 flex-grow-[2] flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 transition-all"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Avatar & Cover */}
          {step === 'avatar' && (
            <div className="rounded-3xl border border-white/[0.06] bg-dark-card p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">Add your photos</h1>
                <p className="text-white/40 text-sm">A profile photo and cover image make your profile stand out</p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Cover Image</label>
                <div
                  className="relative w-full h-36 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-brand-purple/40 transition-all group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Cover" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Upload className="h-6 w-6 text-white/20 group-hover:text-brand-violet transition-colors" />
                      <p className="text-xs text-white/30">Click to upload cover image</p>
                    </div>
                  )}
                  {coverPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'cover')}
                />
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden cursor-pointer hover:border-brand-purple/40 transition-all group shrink-0"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <Camera className="h-5 w-5 text-white/20 group-hover:text-brand-violet transition-colors" />
                        <p className="text-[9px] text-white/25 text-center px-1">Upload</p>
                      </div>
                    )}
                    {avatarPreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-white/40 space-y-1">
                    <p>Upload a photo that represents you</p>
                    <p className="text-xs">JPG, PNG or WebP — max 2MB</p>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-brand-violet hover:underline text-xs"
                    >
                      Browse files
                    </button>
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0], 'avatar')}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('creator')}
                  className="flex-1 h-12 rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:border-white/15 text-sm font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-2 flex-grow-[2] flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {avatarUploading ? 'Uploading avatar...' : coverUploading ? 'Uploading cover...' : 'Saving...'}
                    </>
                  ) : (
                    <>Complete Setup <Check className="h-4 w-4" /></>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-white/25">
                You can update these later in your profile settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
