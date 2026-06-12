/**
 * @jest-environment node
 */

jest.mock('@/lib/auth', () => ({
  getAuthUser: jest.fn().mockResolvedValue(null),
  setAuthCookie: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    task: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/logActivity', () => ({ logActivity: jest.fn() }))
jest.mock('@/lib/taskEvents', () => ({ taskEmitter: { emit: jest.fn() } }))
jest.mock('@/lib/pusher', () => ({ pusherServer: null }))

import { POST } from '@/app/api/tasks/route'
import { getAuthUser } from '@/lib/auth'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

describe('POST /api/tasks', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getAuthUser as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeRequest({ title: 'Test' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    ;(getAuthUser as jest.Mock).mockResolvedValue({ userId: 'u1', role: 'USER' })
    const res = await POST(makeRequest({ description: 'no title' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
  })
})
