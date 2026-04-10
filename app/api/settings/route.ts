import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Settings } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('settings').select('key, value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, string> = {}
  for (const row of data || []) {
    settings[row.key] = row.value ?? ''
  }

  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body: Settings = await req.json()

  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: value ?? '',
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
