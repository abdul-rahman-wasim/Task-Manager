'use client'

import { useTasksQuery } from '@/hooks/useTasks'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStream } from '@/hooks/useTaskStream'
import { TaskCard } from './TaskCard'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export function TaskList() {
  useTaskStream()
  const { page, setPage } = useAppStore()
  const { data, isLoading, isError, error } = useTasksQuery()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Loading tasks">
        <Spinner className="h-8 w-8 text-blue-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error?.message ?? 'Failed to load tasks'}</p>
      </div>
    )
  }

  const { tasks = [], pagination } = data ?? {}

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-16 text-center">
        <p className="text-gray-400 text-lg">No tasks found</p>
        <p className="text-gray-300 dark:text-gray-500 text-sm mt-1">Create your first task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
