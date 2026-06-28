import type { Release } from './types'

const GQL = '/api/graphql'

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0]?.message ?? 'GraphQL error')
  return data as T
}

export async function fetchReleases(): Promise<Release[]> {
  const data = await gql<{ releases: Release[] }>(`
    query Releases {
      releases {
        id name due_date additional_info created_at updated_at status
        steps { index label completed }
      }
    }
  `)
  return data.releases
}

export async function fetchRelease(id: number): Promise<Release> {
  const data = await gql<{ release: Release }>(
    `
    query Release($id: ID!) {
      release(id: $id) {
        id name due_date additional_info created_at updated_at status
        steps { index label completed }
      }
    }
  `,
    { id: String(id) },
  )
  return data.release
}

export async function createRelease(input: {
  name: string
  due_date: string
  additional_info?: string
}): Promise<Release> {
  const data = await gql<{ createRelease: Release }>(
    `
    mutation CreateRelease($name: String!, $due_date: String!, $additional_info: String) {
      createRelease(name: $name, due_date: $due_date, additional_info: $additional_info) {
        id name due_date additional_info created_at updated_at status
        steps { index label completed }
      }
    }
  `,
    input,
  )
  return data.createRelease
}

export async function updateRelease(
  id: number,
  input: { name?: string; additional_info?: string },
): Promise<Release> {
  const data = await gql<{ updateRelease: Release }>(
    `
    mutation UpdateRelease($id: ID!, $name: String, $additional_info: String) {
      updateRelease(id: $id, name: $name, additional_info: $additional_info) {
        id name due_date additional_info created_at updated_at status
        steps { index label completed }
      }
    }
  `,
    { id: String(id), ...input },
  )
  return data.updateRelease
}

export async function toggleStep(
  id: number,
  stepIndex: number,
  completed: boolean,
): Promise<{ steps: Release['steps']; status: Release['status'] }> {
  const data = await gql<{ toggleStep: { steps: Release['steps']; status: Release['status'] } }>(
    `
    mutation ToggleStep($id: ID!, $stepIndex: Int!, $completed: Boolean!) {
      toggleStep(id: $id, stepIndex: $stepIndex, completed: $completed) {
        steps { index label completed }
        status
      }
    }
  `,
    { id: String(id), stepIndex, completed },
  )
  return data.toggleStep
}

export async function deleteRelease(id: number): Promise<void> {
  await gql<{ deleteRelease: boolean }>(
    `
    mutation DeleteRelease($id: ID!) {
      deleteRelease(id: $id)
    }
  `,
    { id: String(id) },
  )
}
