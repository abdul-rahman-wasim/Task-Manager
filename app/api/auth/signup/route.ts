import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await db.user.create({ data: { email, password: hashed } })
    const token = await signToken({ userId: user.id, role: user.role })
    await setAuthCookie(token)

    return Response.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
