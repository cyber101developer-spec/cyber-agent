import type { Source, RawArticle } from '../types'
import { parseRSS } from './rss'
import { scrapeHTML } from './html'

export async function fetchAllArticles(sources: Source[]): Promise<RawArticle[]> {
  const activeSources = sources.filter(s => s.is_active)

  const results = await Promise.allSettled(
    activeSources.map(source =>
      source.type === 'rss'
        ? parseRSS(source.url, source.name)
        : scrapeHTML(source.url, source.name)
    )
  )

  const allArticles: RawArticle[] = []
  const seenUrls = new Set<string>()

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      for (const article of result.value) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url)
          allArticles.push(article)
        }
      }
    } else {
      console.error(`Source "${activeSources[i].name}" failed:`, result.reason)
    }
  }

  return allArticles
}
