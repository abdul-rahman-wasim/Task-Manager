import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, role: user.role })
    await setAuthCookie(token)

    return Response.json({ user: { id: user.id, email: user.email, role: user.role, themePreference: user.themePreference } })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
