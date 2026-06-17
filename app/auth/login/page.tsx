'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Inner component that uses useSearchParams (must be inside Suspense)
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
            <span className="font-display font-black text-white">C</span>
          </div>
          <span className="font-display font-black text-xl text-white">Creatvo</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-white/40">Sign in to continue to your dashboard</p>
        </div>

        {message === 'check-email' && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            <Mail className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Check your email!</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">We sent a confirmation link. Click it to activate your account, then sign in.</p>
            </div>
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-white/25">or continue with email</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 focus:bg-white/[0.06] transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/60">Password</label>
              <Link href="/auth/forgot" className="text-xs text-brand-violet hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 focus:bg-white/[0.06] transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 hover:shadow-xl hover:shadow-brand-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-brand-violet font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

// Outer page wraps LoginForm in Suspense (required for useSearchParams)
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-brand-purple/15 via-dark-card to-dark-bg border-r border-white/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center shadow-lg shadow-brand-purple/30">
            <span className="font-display font-black text-white text-xl">C</span>
          </div>
          <span className="font-display font-black text-2xl text-white">
            Creatvo
          </span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <h2 className="font-display text-4xl font-black text-white leading-tight mb-4">
              Share knowledge,<br />
              <span className="text-gradient">earn revenue.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Join 10,000+ creators building their digital presence and earning from their expertise.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Creators', value: '10K+' },
              { label: 'Monthly Views', value: '50M+' },
              { label: 'Earned', value: '₹2.4Cr+' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                <p className="font-display font-black text-white text-2xl">{stat.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/25 text-sm">
          &copy; 2024 Creatvo. Social publishing platform.
        </p>
      </div>

      {/* Right panel - form (wrapped in Suspense for useSearchParams) */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand-purple/30 border-t-brand-violet animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
