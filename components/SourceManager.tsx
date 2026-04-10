'use client'

import { useState } from 'react'
import type { Source } from '@/lib/types'

type Props = {
  sources: Source[]
  onUpdate: (sources: Source[]) => void
}

export default function SourceManager({ sources, onUpdate }: Props) {
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'rss' | 'html'>('rss')

  function toggleSource(id: string) {
    onUpdate(sources.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s))
  }

  function removeSource(id: string) {
    onUpdate(sources.filter(s => s.id !== id))
  }

  function addSource() {
    if (!newName.trim() || !newUrl.trim()) return
    const newSource: Source = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
      type: newType,
      is_active: true,
      is_default: false,
      created_at: new Date().toISOString(),
    }
    onUpdate([...sources, newSource])
    setNewName('')
    setNewUrl('')
    setNewType('rss')
  }

  const defaultSources = sources.filter(s => s.is_default)
  const customSources = sources.filter(s => !s.is_default)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Regulatory Sources</h3>
        <p className="text-xs text-gray-500 mb-3">These sources are pre-configured. You can toggle them on or off but cannot delete them.</p>
        <div className="space-y-2">
          {defaultSources.map(source => (
            <div key={source.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{source.name}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{source.url}</div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${source.type === 'rss' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {source.type.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${source.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${source.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Sources</h3>
        {customSources.length === 0 ? (
          <p className="text-sm text-gray-400 italic mb-3">No custom sources added yet.</p>
        ) : (
          <div className="space-y-2 mb-3">
            {customSources.map(source => (
              <div key={source.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{source.name}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{source.url}</div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${source.type === 'rss' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {source.type.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSource(source.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${source.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${source.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSource(source.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete source"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg space-y-3">
          <p className="text-xs font-medium text-gray-600">Add a new source</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Source name (e.g. CISA Advisories)"
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://example.com/feed.rss"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as 'rss' | 'html')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="rss">RSS / Atom Feed</option>
              <option value="html">HTML Web Page</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addSource}
            disabled={!newName.trim() || !newUrl.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-40"
            style={{ background: '#0a1628' }}
          >
            + Add Source
          </button>
        </div>
      </div>
    </div>
  )
}
