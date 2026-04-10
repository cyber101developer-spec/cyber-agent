import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { fetchAllArticles } from './scraper'
import { summarizeArticles } from './summarize'
import { buildEmailHtml } from './email'
import { DEFAULT_SOURCES } from './defaultSources'
import type { Settings, Source } from './types'

export type PipelineResult = {
  status: 'success' | 'error' | 'no_articles'
  articles_sent: number
  articles_fetched: number
  recipients: number
  error_message?: string
}

async function loadSettings(supabase: SupabaseClient): Promise<Settings> {
  const { data } = await supabase.from('settings').select('key, value')
  const settings: Settings = {}
  for (const row of data || []) {
    (settings as Record<string, string>)[row.key] = row.value ?? ''
  }
  return settings
}

async function loadSources(supabase: SupabaseClient): Promise<Source[]> {
  const { data } = await supabase.from('sources').select('*')
  if (!data || data.length === 0) {
    return DEFAULT_SOURCES.map((s, i) => ({
      ...s,
      id: `default-${i}`,
      created_at: new Date().toISOString(),
    })) as Source[]
  }
  return data as Source[]
}

export async function runBriefingPipeline(supabase: SupabaseClient): Promise<PipelineResult> {
  const [settings, sources] = await Promise.all([
    loadSettings(supabase),
    loadSources(supabase),
  ])

  if (!settings.openai_api_key) {
    throw new Error('OpenAI API key not configured. Go to Settings → API Keys.')
  }
  if (!settings.resend_api_key) {
    throw new Error('Resend API key not configured. Go to Settings → API Keys.')
  }
  if (!settings.recipients) {
    throw new Error('No recipients configured. Go to Settings → Recipients.')
  }

  const threshold = Number(settings.relevance_threshold ?? 6)

  const rawArticles = await fetchAllArticles(sources)
  console.log(`Fetched ${rawArticles.length} raw articles`)

  const urls = rawArticles.map(a => a.url)
  const { data: existing } = await supabase
    .from('articles')
    .select('url')
    .in('url', urls)

  const existingUrls = new Set((existing || []).map((r: { url: string }) => r.url))
  const newArticles = rawArticles.filter(a => !existingUrls.has(a.url))
  console.log(`${newArticles.length} new articles to process`)

  if (!newArticles.length) {
    await supabase.from('briefing_runs').insert({
      articles_sent: 0,
      articles_fetched: rawArticles.length,
      status: 'no_articles',
    })
    return { status: 'no_articles', articles_sent: 0, articles_fetched: rawArticles.length, recipients: 0 }
  }

  const summarized = await summarizeArticles(newArticles, settings.openai_api_key, threshold)
  console.log(`${summarized.length} articles passed relevance filter`)

  if (!summarized.length) {
    await supabase.from('briefing_runs').insert({
      articles_sent: 0,
      articles_fetched: rawArticles.length,
      status: 'no_articles',
    })
    return { status: 'no_articles', articles_sent: 0, articles_fetched: rawArticles.length, recipients: 0 }
  }

  await supabase.from('articles').upsert(
    summarized.map(a => ({
      url: a.source_url,
      title: a.title,
      category: a.category,
      summary: a.summary,
      relevance_score: a.relevance_score,
      source_name: a.source_name,
      source_url: a.source_url,
      sent_at: new Date().toISOString(),
    })),
    { onConflict: 'url' }
  )

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = buildEmailHtml(summarized, date)
  const recipients = settings.recipients.split(',').map(r => r.trim()).filter(Boolean)
  const senderEmail = settings.sender_email || 'briefing@maprocyber.com'

  const resend = new Resend(settings.resend_api_key)
  const { error: sendError } = await resend.emails.send({
    from: `Mapro Cyber Briefing <${senderEmail}>`,
    to: recipients,
    subject: `Cyber Regulatory Briefing | ${date} | ${summarized.length} update${summarized.length !== 1 ? 's' : ''}`,
    html,
  })

  if (sendError) {
    await supabase.from('briefing_runs').insert({
      articles_sent: 0,
      articles_fetched: rawArticles.length,
      status: 'error',
      error_message: sendError.message,
    })
    throw new Error(`Email send failed: ${sendError.message}`)
  }

  await supabase.from('briefing_runs').insert({
    articles_sent: summarized.length,
    articles_fetched: rawArticles.length,
    status: 'success',
  })

  return {
    status: 'success',
    articles_sent: summarized.length,
    articles_fetched: rawArticles.length,
    recipients: recipients.length,
  }
}
