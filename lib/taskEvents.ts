import { EventEmitter } from 'events'

export type TaskEvent = {
  type: 'task:created' | 'task:updated' | 'task:deleted'
  taskId: string
  userId: string
}

// Singleton EventEmitter for SSE — in-memory, single-process only.
// For multi-process/production use Redis pub/sub instead.
const globalForEmitter = globalThis as unknown as { taskEmitter: EventEmitter }

export const taskEmitter =
  globalForEmitter.taskEmitter ?? new EventEmitter()

if (process.env.NODE_ENV !== 'production') {
  globalForEmitter.taskEmitter = taskEmitter
}

taskEmitter.setMaxListeners(100)
