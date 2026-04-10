import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'

async function logout() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { redirect } = await import('next/navigation')
  redirect('/login')
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ background: '#0a1628' }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">Mapro Cyber</div>
            <div className="text-blue-300 text-xs">Regulatory Intelligence Briefing</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-blue-300 hover:text-white transition-colors">Dashboard</a>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure your briefing agent. All settings are saved securely — no code editing required.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SettingsForm />
        </div>
      </main>
    </div>
  )
}
