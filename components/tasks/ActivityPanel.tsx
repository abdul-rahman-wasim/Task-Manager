'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface LogEntry {
  id: string
  action: string
  metadata: Record<string, unknown> | null
  createdAt: string
  user: { email: string }
}

function actionLabel(entry: LogEntry): string {
  switch (entry.action) {
    case 'created': return 'Created task'
    case 'deleted': return 'Deleted task'
    case 'attachment_added': return `Added attachment: ${(entry.metadata as Record<string,string>)?.filename ?? ''}`
    case 'attachment_removed': return `Removed attachment: ${(entry.metadata as Record<string,string>)?.filename ?? ''}`
    case 'status_changed': return `Status: ${entry.metadata?.from} → ${entry.metadata?.to}`
    case 'updated': return `Updated ${entry.metadata?.field}`
    default: return entry.action
  }
}

export function ActivityPanel({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['activity', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/activity`)
      if (!res.ok) throw new Error('Failed to load activity')
      return res.json() as Promise<{ logs: LogEntry[] }>
    },
    enabled: open,
  })

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {open ? '▼ Hide activity' : '▶ Show activity log'}
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {isLoading && <p className="text-xs text-gray-400">Loading...</p>}
          {data?.logs.length === 0 && <p className="text-xs text-gray-400">No activity yet</p>}
          {data?.logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-gray-300 dark:text-gray-600 shrink-0">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
              <span>{entry.user.email}:</span>
              <span>{actionLabel(entry)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
