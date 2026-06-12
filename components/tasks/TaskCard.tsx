'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUpdateTask, useDeleteTask, type Task } from '@/hooks/useTasks'
import { TaskForm } from './TaskForm'
import { ActivityPanel } from './ActivityPanel'
import { AttachmentList } from './AttachmentList'

interface TaskCardProps {
  task: Task
}

const statusColor: Record<Task['status'], 'gray' | 'blue' | 'green'> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  DONE: 'green',
}

const priorityColor: Record<Task['priority'], 'gray' | 'yellow' | 'red'> = {
  LOW: 'gray',
  MEDIUM: 'yellow',
  HIGH: 'red',
}

const statusLabel: Record<Task['status'], string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export function TaskCard({ task }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const update = useUpdateTask()
  const del = useDeleteTask()

  const toggleDone = () =>
    update.mutate({
      id: task.id,
      data: { status: task.status === 'DONE' ? 'PENDING' : 'DONE' },
    })

  const handleDelete = () => {
    if (confirm('Delete this task?')) del.mutate(task.id)
  }

  const overdue =
    task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()

  return (
    <>
      <div className={`rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm transition-all ${
        task.status === 'DONE' ? 'opacity-60' : ''
      } ${overdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-start gap-3">
          {/* Complete toggle */}
          <button
            onClick={toggleDone}
            aria-label={task.status === 'DONE' ? 'Mark incomplete' : 'Mark complete'}
            className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
              task.status === 'DONE'
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
            }`}
          >
            {task.status === 'DONE' && (
              <svg className="h-full w-full text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`font-medium text-gray-900 dark:text-white truncate ${task.status === 'DONE' ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <Badge color={statusColor[task.status]}>{statusLabel[task.status]}</Badge>
              <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
              {task.attachments?.length > 0 && (
                <span className="text-xs text-gray-400">📎 {task.attachments.length}</span>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
              {task.dueDate && (
                <span className={overdue ? 'text-red-500 font-medium' : ''}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {overdue && ' (overdue)'}
                </span>
              )}
              {task.user && <span>By: {task.user.email}</span>}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} aria-label="Expand">
              {expanded ? '▲' : '▼'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Edit">
              ✏️
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} aria-label="Delete" disabled={del.isPending}>
              🗑️
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
            <AttachmentList taskId={task.id} attachments={task.attachments} />
            <ActivityPanel taskId={task.id} />
          </div>
        )}
      </div>

      <TaskForm open={editing} onClose={() => setEditing(false)} task={task} />
    </>
  )
}
