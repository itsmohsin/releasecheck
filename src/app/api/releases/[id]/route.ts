import { getRelease, updateRelease, deleteRelease, ensureDb } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureDb()
    const { id } = await params
    const release = await getRelease(Number(id))
    if (!release) {
      return Response.json({ error: 'Release not found' }, { status: 404 })
    }
    return Response.json(release)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureDb()
    const { id } = await params
    const body = await request.json()
    const release = await updateRelease(Number(id), { name: body.name, additional_info: body.additional_info })
    if (!release) {
      return Response.json({ error: 'Release not found' }, { status: 404 })
    }
    return Response.json(release)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureDb()
    const { id } = await params
    const deleted = await deleteRelease(Number(id))
    if (!deleted) {
      return Response.json({ error: 'Release not found' }, { status: 404 })
    }
    return Response.json({ message: 'Release deleted' })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
