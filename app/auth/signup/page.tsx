'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLATFORM_CATEGORIES } from '@/lib/utils/index'

const CREATOR_TYPES = ['Tech Creator', 'Business Expert', 'Design Creator', 'Finance Expert', 'Marketing Pro', 'Educator', 'Fitness Coach', 'Travel Creator', 'Other']

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [creatorType, setCreatorType] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const toggleInterest = (slug: string) => {
    setInterests(prev =>
      prev.includes(slug) ? prev.filter(i => i !== slug) : prev.length < 5 ? [...prev, slug] : prev
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    if (step === 2) { setStep(3); return }

    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: fullName,
          creator_type: creatorType || 'Other',
          // Pass interests so trigger can access them (stored via profile update below)
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If user is immediately confirmed (no email verification), update profile with interests
    if (data.session && data.user) {
      // User is auto-confirmed — update profile with interests
      await supabase
        .from('profiles')
        .update({ interests })
        .eq('id', data.user.id)
      router.push('/onboarding')
    } else {
      // Email verification required — show confirmation message
      router.push('/auth/login?message=check-email')
    }
  }


  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
            <span className="font-display font-black text-white">C</span>
          </div>
          <span className="font-display font-black text-xl text-white">Creatvo</span>
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-violet' : 'bg-white/[0.06]'}`} />
          ))}
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-dark-card p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">Create your account</h1>
                <p className="text-white/40 text-sm">Start earning from your knowledge today</p>
              </div>

              <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 hover:text-white hover:border-white/15 transition-all font-medium text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/25">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="johndoe"
                      required
                      minLength={3}
                      className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="w-full h-11 px-3.5 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="text-center text-xs text-white/30">
                By signing up you agree to our{' '}
                <Link href="/terms" className="text-brand-violet hover:underline">Terms</Link>
                {' & '}
                <Link href="/privacy" className="text-brand-violet hover:underline">Privacy Policy</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">What type of creator are you?</h1>
                <p className="text-white/40 text-sm">This helps us personalize your experience</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {CREATOR_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setCreatorType(type)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-center ${
                      creatorType === type
                        ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-violet border'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!creatorType}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">Choose your interests</h1>
                <p className="text-white/40 text-sm">Pick up to 5 categories to personalize your feed</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PLATFORM_CATEGORIES.map((cat) => {
                  const selected = interests.includes(cat.slug)
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => toggleInterest(cat.slug)}
                      className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition-all ${
                        selected
                          ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-violet border'
                          : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:border-white/15 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      {cat.label}
                      {selected && <Check className="h-3 w-3" />}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-white/25 text-center">{interests.length}/5 selected</p>

              <button
                onClick={handleSignup}
                disabled={loading || interests.length === 0}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Create My Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-white/30">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-violet font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
