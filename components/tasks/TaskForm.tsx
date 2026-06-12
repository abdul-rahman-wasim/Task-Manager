'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { taskSchema, type TaskInput } from '@/lib/validations'
import { useCreateTask, useUpdateTask, type Task } from '@/hooks/useTasks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  task?: Task
}

// The form uses a slightly relaxed schema (dueDate as string)
const formSchema = taskSchema.extend({
  dueDate: z.string().optional(),
})
type FormValues = z.infer<typeof formSchema>

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const create = useCreateTask()
  const update = useUpdateTask()
  const isEditing = !!task

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        }
      : { status: 'PENDING', priority: 'MEDIUM' },
  })

  useEffect(() => {
    if (task && !open) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      })
    }
  }, [task, open, reset])

  async function onSubmit(values: FormValues) {
    const data: TaskInput = {
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    }
    try {
      if (isEditing) {
        await update.mutateAsync({ id: task.id, data })
      } else {
        await create.mutateAsync(data)
      }
      reset()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const errorMsg = create.error?.message ?? update.error?.message

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Title *"
          id="title"
          placeholder="Task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Optional description..."
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" id="status" error={errors.status?.message} {...register('status')}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </Select>

          <Select label="Priority" id="priority" error={errors.priority?.message} {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </div>

        <Input
          label="Due date"
          id="dueDate"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        {errorMsg && (
          <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
