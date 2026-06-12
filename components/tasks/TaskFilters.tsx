'use client'

import { useEffect, useState } from 'react'
import { useAppStore, StatusFilter, SortField } from '@/store/useAppStore'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export function TaskFilters() {
  const { search, setSearch, status, setStatus, sortBy, setSortBy, sortOrder, setSortOrder } =
    useAppStore()

  // Debounce the search input
  const [localSearch, setLocalSearch] = useState(search)
  useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 300)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search tasks..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value as StatusFilter)}
        aria-label="Filter by status"
        className="w-40"
      >
        <option value="ALL">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </Select>

      <Select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortField)}
        aria-label="Sort by"
        className="w-40"
      >
        <option value="createdAt">Created date</option>
        <option value="updatedAt">Updated date</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </Select>

      <Select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        aria-label="Sort order"
        className="w-32"
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </Select>
    </div>
  )
}
