import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 0)
  const limit = Number(searchParams.get('limit') || 10)

  const from = page * limit
  const to = from + limit - 1

  const { data: runs, count } = await supabase
    .from('briefing_runs')
    .select('*', { count: 'exact' })
    .order('ran_at', { ascending: false })
    .range(from, to)

  return NextResponse.json({ runs: runs || [], total: count || 0 })
}
