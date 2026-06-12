import { logActivity } from '@/lib/logActivity'

// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  db: {
    activityLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}))

import { db } from '@/lib/db'

describe('logActivity', () => {
  afterEach(() => jest.clearAllMocks())

  it('creates an activity log entry with correct fields', async () => {
    await logActivity('task-1', 'user-1', 'created')
    expect(db.activityLog.create).toHaveBeenCalledWith({
      data: { taskId: 'task-1', userId: 'user-1', action: 'created', metadata: undefined },
    })
  })

  it('passes metadata when provided', async () => {
    const meta = { field: 'status', from: 'PENDING', to: 'DONE' }
    await logActivity('task-2', 'user-2', 'status_changed', meta)
    expect(db.activityLog.create).toHaveBeenCalledWith({
      data: { taskId: 'task-2', userId: 'user-2', action: 'status_changed', metadata: meta },
    })
  })
})
