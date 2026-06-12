/**
 * Unit tests for /api/tasks route handler.
 * These test validation and auth logic in isolation, with Prisma and auth mocked.
 */

// Mock next/headers (required for cookies())
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
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

import { POST } from '@/app/api/tasks/route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

describe('POST /api/tasks', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await POST(makeRequest({ title: 'Test' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    // Mock auth to return a valid user
    jest.resetModules()
    jest.doMock('@/lib/auth', () => ({
      getAuthUser: jest.fn().mockResolvedValue({ userId: 'u1', role: 'USER' }),
      setAuthCookie: jest.fn(),
    }))

    const { POST: authenticatedPOST } = await import('@/app/api/tasks/route')
    const res = await authenticatedPOST(makeRequest({ description: 'no title' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
  })
})
