'use client'

import { useState, useMemo } from 'react'
import type { Release } from '@/lib/types'

interface Props {
  releases?: Release[]
  onSubmit: (data: { name: string; due_date: string; additional_info: string }) => void
  onCancel: () => void
}

function nextVersion(releases?: Release[]): string {
  if (!releases || releases.length === 0) return 'Version 1.0.0'

  const versions = releases
    .map((r) => {
      const match = r.name.match(/(?:Version\s*|v)?(\d+)\.(\d+)\.(\d+)/i)
      if (!match) return null
      return { major: parseInt(match[1]), minor: parseInt(match[2]), patch: parseInt(match[3]) }
    })
    .filter(Boolean) as { major: number; minor: number; patch: number }[]

  if (versions.length === 0) return 'Version 1.0.0'

  const latest = versions.reduce((a, b) => {
    if (a.major !== b.major) return a.major > b.major ? a : b
    if (a.minor !== b.minor) return a.minor > b.minor ? a : b
    return a.patch > b.patch ? a : b
  })

  return `Version ${latest.major}.${latest.minor}.${latest.patch + 1}`
}

export default function CreateRelease({ releases, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(() => nextVersion(releases))
  const [dueDate, setDueDate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !dueDate) return
    onSubmit({
      name,
      due_date: new Date(dueDate).toISOString(),
      additional_info: additionalInfo,
    })
  }

  return (
    <>
      <div className="card-header">
        <h2>New release</h2>
      </div>
      <div className="card-body" style={{ padding: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Release</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Version 2.0"
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Additional remarks / tasks</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Please enter any other important notes for the release."
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
