import { db } from './db'

export async function logActivity(
  taskId: string,
  userId: string,
  action: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
): Promise<void> {
  await db.activityLog.create({
    // cast needed: Prisma v7 Json type is narrower than Record<string, any>
    data: { taskId, userId, action, metadata: metadata as never },
  })
}
