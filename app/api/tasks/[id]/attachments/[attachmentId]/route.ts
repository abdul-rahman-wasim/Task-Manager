import { NextRequest } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { logActivity } from '@/lib/logActivity'
import { taskEmitter } from '@/lib/taskEvents'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, attachmentId } = await params
  const task = await db.task.findUnique({ where: { id }, select: { userId: true } })
  if (!task) return Response.json({ error: 'Task not found' }, { status: 404 })
  if (task.userId !== auth.userId && auth.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const attachment = await db.attachment.findUnique({ where: { id: attachmentId } })
  if (!attachment || attachment.taskId !== id) {
    return Response.json({ error: 'Attachment not found' }, { status: 404 })
  }

  // Delete file from disk (ignore errors if file missing)
  const filePath = path.join(process.cwd(), 'public', attachment.url)
  await unlink(filePath).catch(() => {})

  await db.attachment.delete({ where: { id: attachmentId } })
  await logActivity(id, auth.userId, 'attachment_removed', { filename: attachment.filename })
  taskEmitter.emit('task:updated', { taskId: id, userId: auth.userId })

  return Response.json({ message: 'Attachment deleted' })
}
