import type { RawArticle } from '../types'

function extractText(tag: string, xml: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  if (cdataMatch) return cdataMatch[1].trim()
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (match) return match[1].replace(/<[^>]+>/g, '').trim()
  return ''
}

function extractAttr(attr: string, tag: string): string {
  const match = tag.match(new RegExp(`${attr}="([^"]+)"`))
  return match ? match[1].trim() : ''
}

export async function parseRSS(url: string, sourceName: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 CyberBriefingBot/1.0' },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()

  const articles: RawArticle[] = []

  const items =
    text.match(/<item>([\s\S]*?)<\/item>/g) ||
    text.match(/<entry>([\s\S]*?)<\/entry>/g) ||
    []

  for (const item of items.slice(0, 10)) {
    const title = extractText('title', item)

    let link =
      extractText('link', item) ||
      extractAttr('href', item.match(/<link[^>]+>/)?.[0] || '') ||
      ''

    const description =
      extractText('description', item) ||
      extractText('summary', item) ||
      extractText('content', item)

    if (title && link) {
      articles.push({ title, url: link, description, source: sourceName })
    }
  }

  return articles
}
