export type Source = {
  id: string
  name: string
  url: string
  type: 'rss' | 'html'
  is_active: boolean
  is_default: boolean
  created_at: string
}

export type RawArticle = {
  title: string
  url: string
  description: string
  source: string
}

export type SummarizedArticle = {
  category: 'Cyber Regulatory Update' | 'Regulatory Fine / Sanction' | 'AI Safety'
  title: string
  summary: string
  relevance_score: number
  source_url: string
  source_name: string
}

export type BriefingRun = {
  id: string
  articles_sent: number
  articles_fetched: number
  status: 'success' | 'error' | 'no_articles'
  error_message: string | null
  ran_at: string
}

export type Settings = {
  openai_api_key?: string
  resend_api_key?: string
  sender_email?: string
  recipients?: string
  schedule_time?: string
  schedule_days?: string
  relevance_threshold?: string
}
