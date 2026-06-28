import { toggleStep, ensureDb } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; stepIndex: string }> },
) {
  try {
    await ensureDb()
    const { id, stepIndex } = await params
    const body = await request.json()

    const result = await toggleStep(Number(id), Number(stepIndex), body.completed)
    if (!result) {
      return Response.json({ error: 'Step not found' }, { status: 404 })
    }

    return Response.json(result)
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
