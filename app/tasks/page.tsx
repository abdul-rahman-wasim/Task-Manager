'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/ui/Button'

export default function TasksPage() {
  const [creating, setCreating] = useState(false)

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <Button onClick={() => setCreating(true)}>+ New task</Button>
        </div>

        <TaskFilters />
        <TaskList />
      </main>

      <TaskForm open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
