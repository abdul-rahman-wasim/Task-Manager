import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const task = await db.task.findUnique({ where: { id }, select: { userId: true } })
  if (!task) return Response.json({ error: 'Task not found' }, { status: 404 })
  if (task.userId !== auth.userId && auth.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const logs = await db.activityLog.findMany({
    where: { taskId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { email: true } } },
  })

  return Response.json({ logs })
}
