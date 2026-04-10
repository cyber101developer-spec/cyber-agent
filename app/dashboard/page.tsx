import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RunNowButton from '@/components/RunNowButton'
import BriefingHistory from '@/components/BriefingHistory'

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ count }, { data: lastRun }] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('briefing_runs').select('ran_at, articles_sent').eq('status', 'success').order('ran_at', { ascending: false }).limit(1),
  ])

  return {
    totalArticles: count || 0,
    lastRun: lastRun?.[0] || null,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stats = await getStats(supabase)

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  function formatDate(iso: string | null) {
    if (!iso) return 'Never'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ background: '#0a1628' }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">Mapro Cyber</div>
            <div className="text-blue-300 text-xs">Regulatory Intelligence Briefing</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/settings" className="text-sm text-blue-300 hover:text-white transition-colors">Settings</a>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Signed in as <span className="font-medium">{user.email}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Articles Sent</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalArticles.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Successful Run</div>
            <div className="text-base font-semibold text-gray-800">{formatDate(stats.lastRun?.ran_at ?? null)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Schedule</div>
            <div className="text-base font-semibold text-gray-800">Weekdays 6:00 AM EST</div>
            <div className="text-xs text-gray-400 mt-0.5">Configurable in Settings</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Manual Trigger</h2>
          <p className="text-sm text-gray-500 mb-5">
            Run the full briefing pipeline right now — scrapes all active sources, summarizes with AI, and sends the email to all configured recipients.
          </p>
          <RunNowButton />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <BriefingHistory />
        </div>
      </main>
    </div>
  )
}
