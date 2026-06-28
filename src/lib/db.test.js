import { describe, it } from 'node:test'
import assert from 'node:assert'

// Pure function tests (no DB needed)
function computeStatus(steps) {
  const completed = steps.filter((s) => s.completed).length
  if (completed === 0) return 'planned'
  if (completed === steps.length) return 'done'
  return 'ongoing'
}

const STEP_LABELS = [
  'All relevant GitHub pull requests have been merged',
  'CHANGELOG.md files have been updated',
  'All tests are passing',
  'Release in GitHub created',
  'Deployed in demo',
  'Tested thoroughly in demo',
  'Deployed in production',
]

describe('computeStatus', () => {
  it('returns planned when no steps completed', () => {
    const steps = STEP_LABELS.map((_, i) => ({ index: i, completed: false }))
    assert.strictEqual(computeStatus(steps), 'planned')
  })

  it('returns ongoing when some steps completed', () => {
    const steps = STEP_LABELS.map((_, i) => ({ index: i, completed: i === 0 }))
    assert.strictEqual(computeStatus(steps), 'ongoing')
  })

  it('returns ongoing when middle steps completed', () => {
    const steps = STEP_LABELS.map((_, i) => ({ index: i, completed: i === 3 }))
    assert.strictEqual(computeStatus(steps), 'ongoing')
  })

  it('returns done when all steps completed', () => {
    const steps = STEP_LABELS.map((_, i) => ({ index: i, completed: true }))
    assert.strictEqual(computeStatus(steps), 'done')
  })
})

describe('STEP_LABELS', () => {
  it('has correct number of steps', () => {
    assert.strictEqual(STEP_LABELS.length, 7)
  })

  it('has descriptive step labels', () => {
    STEP_LABELS.forEach((label) => {
      assert.ok(label.length > 5, `Step label too short: ${label}`)
    })
  })
})
