'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Release } from '@/lib/types'
import { fetchReleases, createRelease, deleteRelease } from '@/lib/api'
import { ToastProvider, useToast } from '@/components/Toast'
import ReleaseList from '@/components/ReleaseList'
import CreateRelease from '@/components/CreateRelease'
import ReleaseDetail from '@/components/ReleaseDetail'

type View =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'detail'; id: number }

function HomeInner() {
  const { toast } = useToast()
  const [releases, setReleases] = useState<Release[]>([])
  const [view, setView] = useState<View>({ type: 'list' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchReleases()
      setReleases(data)
    } catch {
      setError('Failed to load releases. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (data: {
    name: string
    due_date: string
    additional_info: string
  }) => {
    await createRelease(data)
    toast('Release created', 'success')
    await load()
    setView({ type: 'list' })
  }

  const handleDelete = async (id: number) => {
    await deleteRelease(id)
    toast('Release deleted', 'success')
    setReleases((prev) => prev.filter((r) => r.id !== id))
    if (view.type === 'detail' && view.id === id) {
      setView({ type: 'list' })
    }
  }

  const handleUpdate = (updated: Release) => {
    setReleases((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ReleaseCheck</h1>
        <p>Your all-in-one release checklist tool</p>
      </header>

      <div className="card">
        {view.type === 'create' ? (
          <CreateRelease
            releases={releases}
            onSubmit={handleCreate}
            onCancel={() => setView({ type: 'list' })}
          />
        ) : view.type === 'detail' ? (
          <ReleaseDetail
            release={releases.find((r) => r.id === view.id)}
            onBack={() => setView({ type: 'list' })}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToast={toast}
          />
        ) : loading ? (
          <div className="card-body">
            <div className="card-header">
              <h2>All releases</h2>
            </div>
            <div className="skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton skeleton-text w-40" />
                  <div className="skeleton skeleton-text w-32" />
                  <div className="skeleton skeleton-badge" />
                  <div className="skeleton skeleton-icon" />
                  <div className="skeleton skeleton-icon" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="card-header">
            <h2>All releases</h2>
          </div>
        ) : (
          <ReleaseList
            releases={releases}
            onSelect={(id) => setView({ type: 'detail', id })}
            onDelete={handleDelete}
            onCreate={() => setView({ type: 'create' })}
          />
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeInner />
    </ToastProvider>
  )
}
