import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, role: true, themePreference: true, createdAt: true },
  })

  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })
  return Response.json({ user })
}
