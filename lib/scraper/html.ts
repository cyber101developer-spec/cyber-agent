import type { RawArticle } from '../types'

const KEYWORDS = [
  'cyber', 'security', 'regulation', 'regulatory', 'enforcement',
  'fine', 'sanction', 'penalty', 'guidance', 'compliance',
  'breach', 'incident', 'risk', 'AI', 'artificial intelligence',
  'data protection', 'privacy',
]

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))
}

export async function scrapeHTML(url: string, sourceName: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 CyberBriefingBot/1.0' },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const origin = new URL(url).origin
  const articles: RawArticle[] = []
  const seen = new Set<string>()

  const anchorPattern = /<a[^>]+href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1].trim()
    const rawText = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

    if (rawText.length < 15 || rawText.length > 300) continue
    if (!matchesKeyword(rawText)) continue

    const fullUrl = href.startsWith('http') ? href : `${origin}${href.startsWith('/') ? '' : '/'}${href}`

    if (seen.has(fullUrl)) continue
    seen.add(fullUrl)

    articles.push({ title: rawText, url: fullUrl, description: '', source: sourceName })

    if (articles.length >= 15) break
  }

  return articles
}
