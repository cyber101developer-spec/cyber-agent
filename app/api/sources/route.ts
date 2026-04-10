import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DEFAULT_SOURCES } from '@/lib/defaultSources'
import type { Source } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    const defaults = DEFAULT_SOURCES.map((s, i) => ({
      ...s,
      id: `default-${i}`,
      created_at: new Date().toISOString(),
    }))
    return NextResponse.json({ sources: defaults })
  }

  return NextResponse.json({ sources: data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { sources }: { sources: Source[] } = await req.json()

  await supabase.from('sources').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const toInsert = sources.map(s => ({
    name: s.name,
    url: s.url,
    type: s.type,
    is_active: s.is_active,
    is_default: s.is_default,
  }))

  const { error } = await supabase.from('sources').insert(toInsert)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
