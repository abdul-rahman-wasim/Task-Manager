import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { taskSchema } from '@/lib/validations'
import { logActivity } from '@/lib/logActivity'
import { taskEmitter } from '@/lib/taskEvents'
import type { TaskStatus } from '@/app/generated/prisma/enums'
import type { TaskWhereInput } from '@/app/generated/prisma/models'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') as TaskStatus | null
  const search = searchParams.get('search') ?? ''
  const sortBy = searchParams.get('sortBy') ?? 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
  const skip = (page - 1) * limit

  const allowedSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const where: TaskWhereInput = {
    ...(auth.role !== 'ADMIN' && { userId: auth.userId }),
    ...(status && { status }),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
  }

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      orderBy: { [safeSortBy]: sortOrder },
      skip,
      take: limit,
      include: { attachments: true, user: { select: { email: true } } },
    }),
    db.task.count({ where }),
  ])

  return Response.json({
    tasks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = taskSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: { ...result.data, userId: auth.userId },
      include: { attachments: true },
    })

    await logActivity(task.id, auth.userId, 'created')
    taskEmitter.emit('task:created', { taskId: task.id, userId: auth.userId })

    return Response.json({ task }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
