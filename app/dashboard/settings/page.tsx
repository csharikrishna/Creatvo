import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { ProfileSettingsForm } from '@/components/dashboard/ProfileSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile Settings' }

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.04] px-8 py-4">
          <h1 className="font-display font-black text-xl text-white">Profile Settings</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage your public profile and account</p>
        </div>
        <div className="p-8 max-w-2xl">
          <ProfileSettingsForm profile={profile} userEmail={user.email || ''} />
        </div>
      </main>
    </div>
  )
}
