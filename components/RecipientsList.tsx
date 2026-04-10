'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function RecipientsList({ value, onChange }: Props) {
  const [input, setInput] = useState('')

  const recipients = value
    ? value.split(',').map(r => r.trim()).filter(Boolean)
    : []

  function addRecipient() {
    const email = input.trim().toLowerCase()
    if (!email || !email.includes('@')) return
    if (recipients.includes(email)) {
      setInput('')
      return
    }
    onChange([...recipients, email].join(','))
    setInput('')
  }

  function removeRecipient(email: string) {
    onChange(recipients.filter(r => r !== email).join(','))
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
          placeholder="colleague@company.com"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addRecipient}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ background: '#0a1628' }}
        >
          Add
        </button>
      </div>

      {recipients.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No recipients added yet.</p>
      ) : (
        <div className="space-y-2">
          {recipients.map(email => (
            <div key={email} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700">{email}</span>
              <button
                type="button"
                onClick={() => removeRecipient(email)}
                className="text-gray-400 hover:text-red-500 ml-2"
                title="Remove"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Press Enter or click Add to add an email. All recipients receive the same briefing email.
      </p>
    </div>
  )
}
