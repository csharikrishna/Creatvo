'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-accent flex items-center justify-center">
            <span className="font-display font-black text-white">C</span>
          </div>
          <span className="font-display font-black text-xl text-white">CreatoHub</span>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-dark-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-2">Check your email</h1>
                <p className="text-white/50 text-sm leading-relaxed">
                  We sent a password reset link to <span className="text-white font-medium">{email}</span>. 
                  Click the link to reset your password.
                </p>
              </div>
              <p className="text-xs text-white/25">
                Didn&apos;t receive it? Check spam or{' '}
                <button onClick={() => setSent(false)} className="text-brand-violet hover:underline">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-black text-white mb-1">Forgot password?</h1>
                <p className="text-white/40 text-sm">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/60">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-white/25 focus:outline-none focus:border-brand-purple/50 text-sm transition-all"
                    />
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
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-brand-purple to-brand-accent text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
