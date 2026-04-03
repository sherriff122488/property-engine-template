'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account and application settings."
      />

      <div className="space-y-4 max-w-2xl">
        {/* Sign out */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">Session</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Sign out of your account on this device.</p>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {/* Placeholder */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">Further settings</h2>
          <p className="text-sm text-stone-400 dark:text-stone-500">Additional settings will be added here over time.</p>
        </div>
      </div>
    </div>
  )
}
