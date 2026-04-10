'use client'

import { useEffect, useState } from 'react'
import type { BriefingRun } from '@/lib/types'

const PAGE_SIZE = 10

export default function BriefingHistory() {
  const [runs, setRuns] = useState<BriefingRun[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  async function load(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/runs?page=${p}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      setRuns(data.runs || [])
      setTotal(data.total || 0)
    } catch {
      setRuns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Briefing Runs</h2>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading history...</div>
      ) : runs.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
          No briefing runs yet. Use the &quot;Send Briefing Now&quot; button above to run your first briefing.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Fetched</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Sent</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map(run => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(run.ran_at)}</td>
                    <td className="px-4 py-3">
                      {run.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Success
                        </span>
                      ) : run.status === 'no_articles' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          No New Articles
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{run.articles_fetched}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{run.articles_sent}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {run.error_message || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
