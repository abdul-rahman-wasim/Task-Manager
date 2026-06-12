import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { taskEmitter, TaskEvent } from '@/lib/taskEvents'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: TaskEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      taskEmitter.on('task:created', send)
      taskEmitter.on('task:updated', send)
      taskEmitter.on('task:deleted', send)

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'))
      }, 30_000)

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        taskEmitter.off('task:created', send)
        taskEmitter.off('task:updated', send)
        taskEmitter.off('task:deleted', send)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
