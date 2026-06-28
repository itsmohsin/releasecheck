import { getAllReleases, createRelease, ensureDb } from '@/lib/db'

export async function GET() {
  try {
    await ensureDb()
    const releases = await getAllReleases()
    return Response.json(releases)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb()
    const body = await request.json()
    const { name, due_date, additional_info } = body

    if (!name || !due_date) {
      return Response.json({ error: 'Name and due_date are required' }, { status: 400 })
    }

    const release = await createRelease({ name, due_date, additional_info })
    return Response.json(release, { status: 201 })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
