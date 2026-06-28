'use client'

import { useState } from 'react'
import type { Release } from '@/lib/types'
import { toggleStep, updateRelease } from '@/lib/api'
import ConfirmModal from './Modal'

interface Props {
  release: Release | undefined
  onBack: () => void
  onUpdate: (r: Release) => void
  onDelete: (id: number) => void
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

export default function ReleaseDetail({ release, onBack, onUpdate, onDelete, onToast }: Props) {
  const [name, setName] = useState(release?.name ?? '')
  const [info, setInfo] = useState(release?.additional_info ?? '')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (!release) {
    return (
      <div className="not-found">
        <p>Release not found.</p>
        <button className="back-link" onClick={onBack} style={{ marginTop: 12 }}>
          &larr; Back to releases
        </button>
      </div>
    )
  }

  const handleToggle = async (stepIndex: number, completed: boolean) => {
    try {
      const result = await toggleStep(release.id, stepIndex, completed)
      onUpdate({ ...release, steps: result.steps, status: result.status })
    } catch {
      onToast('Failed to update step', 'error')
    }
  }

  const saveField = async (field: 'name' | 'additional_info', value: string) => {
    setSaving(true)
    try {
      const payload: { name?: string; additional_info?: string } = {}
      if (field === 'name') payload.name = value
      if (field === 'additional_info') payload.additional_info = value
      const updated = await updateRelease(release.id, payload)
      onUpdate(updated)
      onToast(field === 'name' ? 'Name saved' : 'Additional info saved', 'success')
    } catch {
      onToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ConfirmModal
        open={showDelete}
        title="Delete release"
        message={`Are you sure you want to delete "${release.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setShowDelete(false); onDelete(release.id) }}
        onCancel={() => setShowDelete(false)}
      />

      <div className="detail-header">
        <div className="breadcrumb">
          <a onClick={onBack}>All Releases</a>
          <span>&gt;</span>
          <span className="current">{name || release.name}</span>
        </div>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
          Delete
        </button>
      </div>

      <div className="card-body" style={{ padding: 20 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Release</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== release.name) saveField('name', e.target.value)
              }}
              placeholder="Version 2.0"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              value={new Date(release.due_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="card-body" style={{ padding: '4px 0' }}>
        <div className="checklist">
          {release.steps.map((step) => (
            <label key={step.index} className={`checklist-item ${step.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                className="checklist-checkbox"
                checked={step.completed}
                onChange={(e) => handleToggle(step.index, e.target.checked)}
              />
              <span className="checklist-label">{step.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section">
        <label className="section-label">Additional remarks / tasks</label>
        <textarea
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            fontFamily: 'Inter, sans-serif',
            minHeight: 80,
            resize: 'vertical',
            marginBottom: 0,
          }}
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          placeholder="Please enter any other important notes for the release."
        />
        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={() => saveField('additional_info', info)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
