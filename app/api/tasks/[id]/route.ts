import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { updateTaskSchema } from '@/lib/validations'
import { logActivity } from '@/lib/logActivity'
import { taskEmitter } from '@/lib/taskEvents'
import { pusherServer } from '@/lib/pusher'

async function getTaskOrFail(id: string, userId: string, role: string) {
  const task = await db.task.findUnique({ where: { id } })
  if (!task) return { error: 'Task not found', status: 404 }
  if (task.userId !== userId && role !== 'ADMIN') return { error: 'Forbidden', status: 403 }
  return { task }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await getTaskOrFail(id, auth.userId, auth.role)
  if ('error' in result) return Response.json({ error: result.error }, { status: result.status })

  const task = await db.task.findUnique({
    where: { id },
    include: { attachments: true, activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 } },
  })

  return Response.json({ task })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const check = await getTaskOrFail(id, auth.userId, auth.role)
  if ('error' in check) return Response.json({ error: check.error }, { status: check.status })

  try {
    const body = await request.json()
    const result = updateTaskSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: 'Validation failed', issues: result.error.issues }, { status: 400 })
    }

    const prev = check.task
    const updated = await db.task.update({
      where: { id },
      data: result.data,
      include: { attachments: true },
    })

    const changedFields = Object.keys(result.data)
    for (const field of changedFields) {
      const action = field === 'status' ? 'status_changed' : 'updated'
      await logActivity(id, auth.userId, action, {
        field,
        from: (prev as Record<string, unknown>)[field],
        to: (result.data as Record<string, unknown>)[field],
      })
    }

    taskEmitter.emit('task:updated', { taskId: id, userId: auth.userId })
    pusherServer?.trigger('tasks', 'task:updated', { taskId: id }).catch(console.error)
    return Response.json({ task: updated })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const check = await getTaskOrFail(id, auth.userId, auth.role)
  if ('error' in check) return Response.json({ error: check.error }, { status: check.status })

  await db.task.delete({ where: { id } })
  taskEmitter.emit('task:deleted', { taskId: id, userId: auth.userId })
  pusherServer?.trigger('tasks', 'task:deleted', { taskId: id }).catch(console.error)

  return Response.json({ message: 'Task deleted' })
}
