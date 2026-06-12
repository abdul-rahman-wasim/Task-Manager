import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { logActivity } from '@/lib/logActivity'
import { taskEmitter } from '@/lib/taskEvents'
import { pusherServer } from '@/lib/pusher'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export async function POST(
  request: NextRequest,
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

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'File size exceeds 5 MB limit' }, { status: 413 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({ error: 'File type not allowed' }, { status: 415 })
    }

    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', id)
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/${id}/${filename}`
    const attachment = await db.attachment.create({
      data: { taskId: id, filename: file.name, mimetype: file.type, url },
    })

    await logActivity(id, auth.userId, 'attachment_added', { filename: file.name })
    taskEmitter.emit('task:updated', { taskId: id, userId: auth.userId })
    pusherServer?.trigger('tasks', 'task:updated', { taskId: id }).catch(() => {})

    return Response.json({ attachment }, { status: 201 })
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
