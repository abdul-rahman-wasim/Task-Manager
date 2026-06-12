'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import PusherClient from 'pusher-js'
import { usePusherConfig } from '@/contexts/PusherContext'

export function useTaskStream() {
  const qc = useQueryClient()
  const pusherConfig = usePusherConfig()

  useEffect(() => {
    if (pusherConfig) {
      console.log('[realtime] Pusher connected —', pusherConfig.cluster)
      const pusher = new PusherClient(pusherConfig.key, { cluster: pusherConfig.cluster })
      const channel = pusher.subscribe('tasks')
      const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] })
      channel.bind('task:created', invalidate)
      channel.bind('task:updated', invalidate)
      channel.bind('task:deleted', invalidate)
      return () => {
        channel.unbind_all()
        pusher.unsubscribe('tasks')
        pusher.disconnect()
      }
    }

    // SSE fallback — single-process dev mode (no Pusher keys)
    console.warn('[realtime] Pusher not configured — SSE fallback active')
    const es = new EventSource('/api/tasks/stream')
    es.onmessage = () => qc.invalidateQueries({ queryKey: ['tasks'] })
    es.onerror = () => {}
    return () => es.close()
  }, [qc, pusherConfig])
}
