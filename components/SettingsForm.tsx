'use client'

import { useState, useEffect } from 'react'
import type { Settings, Source } from '@/lib/types'
import RecipientsList from './RecipientsList'
import SourceManager from './SourceManager'
import { DEFAULT_SOURCES } from '@/lib/defaultSources'

const TABS = ['API Keys', 'Schedule', 'Sources', 'Recipients'] as const
type Tab = typeof TABS[number]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_VALUES = ['1', '2', '3', '4', '5', '6', '0']

const TIME_OPTIONS = [
  { label: '5:00 AM EST', utc: '10' },
  { label: '5:30 AM EST', utc: '10:30' },
  { label: '6:00 AM EST', utc: '11' },
  { label: '6:30 AM EST', utc: '11:30' },
  { label: '7:00 AM EST', utc: '12' },
  { label: '7:30 AM EST', utc: '12:30' },
  { label: '8:00 AM EST', utc: '13' },
  { label: '8:30 AM EST', utc: '13:30' },
  { label: '9:00 AM EST', utc: '14' },
]

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium toast-enter ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </div>
  )
}

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState<Tab>('API Keys')
  const [settings, setSettings] = useState<Settings>({})
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [testing, setTesting] = useState<'openai' | 'resend' | null>(null)
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})

  const selectedDays = settings.schedule_days ? settings.schedule_days.split(',') : ['1','2','3','4','5']

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, sourcesRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/sources'),
        ])
        const settingsData = await settingsRes.json()
        const sourcesData = await sourcesRes.json()
        setSettings(settingsData)
        setSources(sourcesData.sources?.length ? sourcesData.sources : DEFAULT_SOURCES.map((s, i) => ({ ...s, id: `default-${i}`, created_at: new Date().toISOString() })) as Source[])
      } catch {
        showToast('Failed to load settings', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      showToast('Settings saved successfully', 'success')
    } catch {
      showToast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function saveSources() {
    setSaving(true)
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await saveSettings()
    } catch {
      showToast('Failed to save sources', 'error')
      setSaving(false)
    }
  }

  async function testConnection(type: 'openai' | 'resend') {
    setTesting(type)
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, apiKey: type === 'openai' ? settings.openai_api_key : settings.resend_api_key }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`${type === 'openai' ? 'OpenAI' : 'Resend'} connection successful`, 'success')
      } else {
        showToast(data.error || 'Connection failed', 'error')
      }
    } catch {
      showToast('Connection test failed', 'error')
    } finally {
      setTesting(null)
    }
  }

  function toggleDay(val: string) {
    const current = selectedDays
    const next = current.includes(val)
      ? current.filter(d => d !== val)
      : [...current, val].sort()
    setSettings(s => ({ ...s, schedule_days: next.join(',') }))
  }

  function scheduleSummary() {
    const days = selectedDays.map(v => DAYS[DAY_VALUES.indexOf(v)]).filter(Boolean)
    const timeOption = TIME_OPTIONS.find(t => t.utc === settings.schedule_time) || TIME_OPTIONS[2]
    if (!days.length) return 'No days selected'
    return `Briefing will run ${days.join(', ')} at ${timeOption.label}`
  }

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading settings...</div>
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'API Keys' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get API key →</a>
            </div>
            <p className="text-xs text-gray-400 mb-2">Used for AI summarization of articles. Costs ~$8–12/month.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey.openai ? 'text' : 'password'}
                  value={settings.openai_api_key || ''}
                  onChange={e => setSettings(s => ({ ...s, openai_api_key: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowKey(k => ({ ...k, openai: !k.openai }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {showKey.openai ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => testConnection('openai')}
                disabled={!settings.openai_api_key || testing === 'openai'}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 whitespace-nowrap"
              >
                {testing === 'openai' ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Resend API Key</label>
              <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get API key →</a>
            </div>
            <p className="text-xs text-gray-400 mb-2">Used to send emails. Free up to 3,000 emails/month.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey.resend ? 'text' : 'password'}
                  value={settings.resend_api_key || ''}
                  onChange={e => setSettings(s => ({ ...s, resend_api_key: e.target.value }))}
                  placeholder="re_..."
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowKey(k => ({ ...k, resend: !k.resend }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {showKey.resend ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => testConnection('resend')}
                disabled={!settings.resend_api_key || testing === 'resend'}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 whitespace-nowrap"
              >
                {testing === 'resend' ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email Address</label>
            <p className="text-xs text-gray-400 mb-2">Must be a verified domain in your Resend account (e.g. briefing@maprocyber.com).</p>
            <input
              type="email"
              value={settings.sender_email || ''}
              onChange={e => setSettings(s => ({ ...s, sender_email: e.target.value }))}
              placeholder="briefing@maprocyber.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button onClick={saveSettings} disabled={saving} className="mt-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60" style={{ background: '#0a1628' }}>
            {saving ? 'Saving...' : 'Save API Keys'}
          </button>
        </div>
      )}

      {activeTab === 'Schedule' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send Time (EST)</label>
            <select
              value={settings.schedule_time || '11'}
              onChange={e => setSettings(s => ({ ...s, schedule_time: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.utc} value={opt.utc}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Days of Week</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day, i) => {
                const val = DAY_VALUES[i]
                const active = selectedDays.includes(val)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(val)}
                    className={`w-12 h-12 rounded-lg text-sm font-semibold border-2 transition-all ${active ? 'text-white border-transparent' : 'text-gray-500 border-gray-200 hover:border-gray-300'}`}
                    style={active ? { background: '#0a1628' } : {}}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
            {scheduleSummary()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relevance Score Threshold</label>
            <p className="text-xs text-gray-400 mb-3">
              Only articles scoring <strong>{settings.relevance_threshold || '6'}/10</strong> or above will be included. Higher = stricter filtering.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.relevance_threshold || '6'}
                onChange={e => setSettings(s => ({ ...s, relevance_threshold: e.target.value }))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-lg font-bold text-gray-700 w-8 text-center">{settings.relevance_threshold || '6'}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 — Include most articles</span>
              <span>10 — Only highest relevance</span>
            </div>
          </div>

          <button onClick={saveSettings} disabled={saving} className="mt-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60" style={{ background: '#0a1628' }}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      )}

      {activeTab === 'Sources' && (
        <div>
          <SourceManager sources={sources} onUpdate={setSources} />
          <button onClick={saveSources} disabled={saving} className="mt-6 px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60" style={{ background: '#0a1628' }}>
            {saving ? 'Saving...' : 'Save Sources'}
          </button>
        </div>
      )}

      {activeTab === 'Recipients' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Briefing Recipients</label>
            <p className="text-xs text-gray-400 mb-4">Add the email addresses that should receive the daily briefing.</p>
            <RecipientsList
              value={settings.recipients || ''}
              onChange={val => setSettings(s => ({ ...s, recipients: val }))}
            />
          </div>
          <button onClick={saveSettings} disabled={saving} className="mt-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60" style={{ background: '#0a1628' }}>
            {saving ? 'Saving...' : 'Save Recipients'}
          </button>
        </div>
      )}
    </div>
  )
}
