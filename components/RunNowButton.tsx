'use client'

import { useState } from 'react'

type Result = {
  status: string
  articles_sent: number
  articles_fetched: number
  recipients: number
  error?: string
}

export default function RunNowButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleRun() {
    setShowConfirm(false)
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/trigger', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ status: 'error', articles_sent: 0, articles_fetched: 0, recipients: 0, error: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Send Briefing Now?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will scrape all active sources, summarize articles with AI, and send the email to all configured recipients immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRun}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#0a1628' }}
              >
                Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        style={{ background: loading ? '#4b5563' : '#0a1628' }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Running briefing pipeline...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Briefing Now
          </>
        )}
      </button>

      {result && !loading && (
        <div className={`mt-4 p-4 rounded-lg border text-sm ${
          result.status === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : result.status === 'no_articles'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {result.status === 'success' && (
            <span>Briefing sent — <strong>{result.articles_sent}</strong> articles delivered to <strong>{result.recipients}</strong> recipient{result.recipients !== 1 ? 's' : ''}. ({result.articles_fetched} total fetched)</span>
          )}
          {result.status === 'no_articles' && (
            <span>No new relevant articles found today. All sources have been checked ({result.articles_fetched} articles seen, already in database).</span>
          )}
          {result.status === 'error' && (
            <span>{result.error || 'An error occurred. Check Settings to make sure all API keys are configured.'}</span>
          )}
        </div>
      )}
    </div>
  )
}
