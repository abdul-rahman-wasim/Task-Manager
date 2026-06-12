import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ theme: z.enum(['light', 'dark']) })

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) return Response.json({ error: 'Invalid theme' }, { status: 400 })

  await db.user.update({
    where: { id: auth.userId },
    data: { themePreference: result.data.theme },
  })

  return Response.json({ ok: true })
}
