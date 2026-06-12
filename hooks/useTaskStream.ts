'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useTaskStream() {
  const qc = useQueryClient()

  useEffect(() => {
    const es = new EventSource('/api/tasks/stream')

    es.onmessage = () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }

    es.onerror = () => {
      // Browser auto-reconnects on error; no action needed
    }

    return () => es.close()
  }, [qc])
}
