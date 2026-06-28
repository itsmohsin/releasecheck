import {
  getAllReleases,
  getRelease,
  createRelease,
  updateRelease,
  toggleStep,
  deleteRelease,
  ensureDb,
} from '@/lib/db'

export const resolvers = {
  releases: async () => {
    await ensureDb()
    return getAllReleases()
  },
  release: async ({ id }: { id: string }) => {
    await ensureDb()
    return getRelease(Number(id))
  },
  createRelease: async ({ name, due_date, additional_info }: { name: string; due_date: string; additional_info?: string }) => {
    await ensureDb()
    return createRelease({ name, due_date, additional_info })
  },
  updateRelease: async ({ id, name, additional_info }: { id: string; name?: string; additional_info?: string }) => {
    await ensureDb()
    return updateRelease(Number(id), { name, additional_info })
  },
  toggleStep: async ({ id, stepIndex, completed }: { id: string; stepIndex: number; completed: boolean }) => {
    await ensureDb()
    return toggleStep(Number(id), stepIndex, completed)
  },
  deleteRelease: async ({ id }: { id: string }) => {
    await ensureDb()
    return deleteRelease(Number(id))
  },
}
