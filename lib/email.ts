import type { SummarizedArticle } from './types'

const categoryConfig: Record<string, { color: string; label: string }> = {
  'Cyber Regulatory Update': { color: '#0a1628', label: 'Cyber Regulatory Update' },
  'Regulatory Fine / Sanction': { color: '#b91c1c', label: 'Regulatory Fine / Sanction' },
  'AI Safety': { color: '#1e3a8a', label: 'AI Safety' },
}

function renderSection(category: string, items: SummarizedArticle[]): string {
  if (!items.length) return ''
  const { color } = categoryConfig[category] || { color: '#0a1628' }

  const cards = items
    .map(
      a => `
    <div style="margin-bottom:20px;padding:18px 20px;background:#f9fafb;border-radius:8px;border-left:4px solid ${color};">
      <div style="font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">${category}</div>
      <div style="font-size:16px;font-weight:600;color:#111827;margin-bottom:10px;line-height:1.4;">${a.title}</div>
      <div style="font-size:14px;color:#4b5563;line-height:1.65;margin-bottom:12px;">${a.summary}</div>
      <a href="${a.source_url}" style="font-size:13px;color:${color};text-decoration:none;font-weight:600;">Read full article &rarr; <span style="font-weight:400;color:#6b7280;">${a.source_name}</span></a>
    </div>`
    )
    .join('')

  const emoji =
    category === 'Cyber Regulatory Update'
      ? '📋'
      : category === 'Regulatory Fine / Sanction'
      ? '⚠️'
      : '🤖'

  return `
  <div style="margin-bottom:36px;">
    <h2 style="font-size:17px;font-weight:700;color:${color};border-bottom:2px solid ${color};padding-bottom:10px;margin-bottom:18px;margin-top:0;">${emoji}&nbsp;&nbsp;${category}</h2>
    ${cards}
  </div>`
}

export function buildEmailHtml(articles: SummarizedArticle[], date: string): string {
  const byCategory: Record<string, SummarizedArticle[]> = {
    'Cyber Regulatory Update': [],
    'Regulatory Fine / Sanction': [],
    'AI Safety': [],
  }

  for (const article of articles) {
    if (byCategory[article.category]) {
      byCategory[article.category].push(article)
    } else {
      byCategory['Cyber Regulatory Update'].push(article)
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Cyber Regulatory Briefing</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:680px;margin:28px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <div style="background:#0a1628;padding:28px 32px;">
      <div style="font-size:10px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Mapro Cyber</div>
      <div style="font-size:24px;font-weight:700;color:#ffffff;line-height:1.2;">Cyber Regulatory TLDR Briefing</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:6px;">${date} &mdash; ${articles.length} update${articles.length !== 1 ? 's' : ''}</div>
    </div>

    <div style="padding:32px 32px 8px;">
      <p style="font-size:14px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
        Your daily intelligence briefing on cybersecurity regulatory updates, enforcement actions, and AI safety developments affecting financial institutions.
      </p>

      ${renderSection('Cyber Regulatory Update', byCategory['Cyber Regulatory Update'])}
      ${renderSection('Regulatory Fine / Sanction', byCategory['Regulatory Fine / Sanction'])}
      ${renderSection('AI Safety', byCategory['AI Safety'])}
    </div>

    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <div style="font-size:12px;color:#9ca3af;">
        Mapro Cyber Intelligence &mdash; Automated Regulatory Briefing<br>
        <a href="mailto:unsubscribe@maprocyber.com" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>

  </div>
</body>
</html>`
}
