import { Pool } from 'pg'
import { STEP_LABELS } from './steps'
import type { Release, Step, ReleaseStatus } from './types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('local')
      ? { rejectUnauthorized: false }
      : false,
})

let initialized = false
export async function ensureDb() {
  if (initialized) return
  initialized = true
  await initDb()
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS releases (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      due_date TIMESTAMP NOT NULL,
      additional_info TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS release_steps (
      id SERIAL PRIMARY KEY,
      release_id INTEGER NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
      step_index INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      UNIQUE(release_id, step_index)
    )
  `)
}

export function computeStatus(steps: Pick<Step, 'completed'>[]): ReleaseStatus {
  const completed = steps.filter((s) => s.completed).length
  if (completed === 0) return 'planned'
  if (completed === steps.length) return 'done'
  return 'ongoing'
}

function formatRelease(
  row: any,
  steps: Step[],
): Release {
  return {
    id: row.id,
    name: row.name,
    due_date: row.due_date.toISOString(),
    additional_info: row.additional_info,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    status: computeStatus(steps),
    steps,
  }
}

export async function getAllReleases(): Promise<Release[]> {
  const { rows } = await pool.query(
    'SELECT id, name, due_date, additional_info, created_at, updated_at FROM releases ORDER BY created_at DESC',
  )

  return Promise.all(
    rows.map(async (row) => {
      const { rows: stepRows } = await pool.query(
        'SELECT step_index, completed FROM release_steps WHERE release_id = $1 ORDER BY step_index',
        [row.id],
      )
      const steps = stepRows.map((s) => ({
        index: s.step_index,
        label: STEP_LABELS[s.step_index] ?? `Step ${s.step_index + 1}`,
        completed: s.completed,
      }))
      return formatRelease(row, steps)
    }),
  )
}

export async function getRelease(id: number): Promise<Release | null> {
  const { rows } = await pool.query('SELECT * FROM releases WHERE id = $1', [id])
  if (rows.length === 0) return null

  const { rows: stepRows } = await pool.query(
    'SELECT step_index, completed FROM release_steps WHERE release_id = $1 ORDER BY step_index',
    [id],
  )
  const steps = stepRows.map((s) => ({
    index: s.step_index,
    label: STEP_LABELS[s.step_index] ?? `Step ${s.step_index + 1}`,
    completed: s.completed,
  }))
  return formatRelease(rows[0], steps)
}

export async function createRelease(data: {
  name: string
  due_date: string
  additional_info?: string
}): Promise<Release> {
  const { rows } = await pool.query(
    'INSERT INTO releases (name, due_date, additional_info) VALUES ($1, $2, $3) RETURNING *',
    [data.name, data.due_date, data.additional_info ?? null],
  )

  for (let i = 0; i < STEP_LABELS.length; i++) {
    await pool.query(
      'INSERT INTO release_steps (release_id, step_index, completed) VALUES ($1, $2, FALSE)',
      [rows[0].id, i],
    )
  }

  const steps = STEP_LABELS.map((label, i) => ({ index: i, label, completed: false }))
  return formatRelease(rows[0], steps)
}

export async function updateRelease(
  id: number,
  data: { name?: string; additional_info?: string },
): Promise<Release | null> {
  const sets: string[] = []
  const values: (string | number)[] = []
  let idx = 1

  if (data.name !== undefined) {
    sets.push(`name = $${idx++}`)
    values.push(data.name)
  }
  if (data.additional_info !== undefined) {
    sets.push(`additional_info = $${idx++}`)
    values.push(data.additional_info)
  }
  if (sets.length === 0) return null

  sets.push(`updated_at = NOW()`)
  values.push(id)

  const { rows } = await pool.query(
    `UPDATE releases SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  )
  if (rows.length === 0) return null

  const { rows: stepRows } = await pool.query(
    'SELECT step_index, completed FROM release_steps WHERE release_id = $1 ORDER BY step_index',
    [id],
  )
  const steps = stepRows.map((s) => ({
    index: s.step_index,
    label: STEP_LABELS[s.step_index] ?? `Step ${s.step_index + 1}`,
    completed: s.completed,
  }))
  return formatRelease(rows[0], steps)
}

export async function toggleStep(
  id: number,
  stepIndex: number,
  completed: boolean,
): Promise<{ steps: Step[]; status: ReleaseStatus } | null> {
  const { rowCount } = await pool.query(
    'UPDATE release_steps SET completed = $1 WHERE release_id = $2 AND step_index = $3',
    [completed, id, stepIndex],
  )
  if (rowCount === 0) return null

  await pool.query('UPDATE releases SET updated_at = NOW() WHERE id = $1', [id])

  const { rows: stepRows } = await pool.query(
    'SELECT step_index, completed FROM release_steps WHERE release_id = $1 ORDER BY step_index',
    [id],
  )
  const steps = stepRows.map((s) => ({
    index: s.step_index,
    label: STEP_LABELS[s.step_index] ?? `Step ${s.step_index + 1}`,
    completed: s.completed,
  }))
  return { steps, status: computeStatus(steps) }
}

export async function deleteRelease(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM releases WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}

export default pool
