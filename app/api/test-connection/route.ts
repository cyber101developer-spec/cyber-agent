import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const { type, apiKey } = await req.json()

  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'API key is required' }, { status: 400 })
  }

  try {
    if (type === 'openai') {
      const openai = new OpenAI({ apiKey })
      const models = await openai.models.list()
      if (!models.data.length) throw new Error('No models returned')
      return NextResponse.json({ success: true })
    }

    if (type === 'resend') {
      const resend = new Resend(apiKey)
      const { data, error } = await resend.domains.list()
      if (error) throw new Error(error.message)
      return NextResponse.json({ success: true, domains: data?.data?.length || 0 })
    }

    return NextResponse.json({ success: false, error: 'Unknown test type' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed'
    return NextResponse.json({ success: false, error: message }, { status: 200 })
  }
}
