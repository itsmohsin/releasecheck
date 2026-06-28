'use client'

import { useState } from 'react'
import type { Release } from '@/lib/types'
import { useToast } from './Toast'
import ConfirmModal from './Modal'

interface Props {
  releases: Release[]
  onSelect: (id: number) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

export default function ReleaseList({ releases, onSelect, onDelete, onCreate }: Props) {
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    toast('Release deleted', 'success')
    setDeleteTarget(null)
  }

  return (
    <>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete release"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="card-header">
        <h2>All releases</h2>
        <button className="btn btn-primary" onClick={onCreate}>
          New release <PlusIcon />
        </button>
      </div>
      <div className="card-body">
        {releases.length === 0 ? (
          <div className="empty-state">
            <p>No releases yet.</p>
            <button className="btn btn-primary" onClick={onCreate} style={{ marginTop: 12 }}>
              Create your first release <PlusIcon />
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Release</th>
                <th>Date</th>
                <th>Status</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(r.due_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className={`status-badge status-${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => onSelect(r.id)} title="View release">
                      <EyeIcon />
                    </button>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => setDeleteTarget(r)} title="Delete release">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
