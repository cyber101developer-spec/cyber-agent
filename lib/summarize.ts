import OpenAI from 'openai'
import type { RawArticle, SummarizedArticle } from './types'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function summarizeArticle(
  article: RawArticle,
  apiKey: string
): Promise<SummarizedArticle | null> {
  const openai = new OpenAI({ apiKey })

  const prompt = `You are a cybersecurity regulatory intelligence analyst for senior practitioners at financial institutions.

Analyze this article and return ONLY valid JSON with these exact fields:
{
  "category": "Cyber Regulatory Update" | "Regulatory Fine / Sanction" | "AI Safety",
  "title": "concise title under 12 words",
  "summary": "100-150 word plain English summary highlighting: what happened, which agency/regulation is involved, and the implication for financial institutions",
  "relevance_score": number from 1-10 (10 = highly relevant to capital markets cybersecurity)
}

Article title: ${article.title}
Article URL: ${article.url}
Article snippet: ${article.description.slice(0, 500)}
Source: ${article.source}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 400,
  })

  const content = response.choices[0].message.content || '{}'
  const result = JSON.parse(content)

  if (!result.category || !result.title || !result.summary || !result.relevance_score) {
    return null
  }

  return {
    category: result.category,
    title: result.title,
    summary: result.summary,
    relevance_score: Number(result.relevance_score),
    source_url: article.url,
    source_name: article.source,
  }
}

export async function summarizeArticles(
  articles: RawArticle[],
  apiKey: string,
  threshold: number
): Promise<SummarizedArticle[]> {
  const summarized: SummarizedArticle[] = []

  for (const article of articles.slice(0, 20)) {
    try {
      const result = await summarizeArticle(article, apiKey)
      if (result && result.relevance_score >= threshold) {
        summarized.push(result)
      }
    } catch (err) {
      console.error(`Failed to summarize "${article.title}":`, err)
    }
    await sleep(500)
  }

  return summarized
}
