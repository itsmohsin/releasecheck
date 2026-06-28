export interface Step {
  index: number
  label: string
  completed: boolean
}

export interface Release {
  id: number
  name: string
  due_date: string
  additional_info: string | null
  steps: Step[]
  status: 'planned' | 'ongoing' | 'done'
  created_at: string
  updated_at: string
}

export type ReleaseStatus = 'planned' | 'ongoing' | 'done'
