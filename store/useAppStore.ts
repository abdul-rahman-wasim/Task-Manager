'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'
export type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DONE'

interface AppState {
  isDark: boolean
  toggleDark: () => void

  search: string
  setSearch: (v: string) => void

  status: StatusFilter
  setStatus: (v: StatusFilter) => void

  sortBy: SortField
  setSortBy: (v: SortField) => void

  sortOrder: SortOrder
  setSortOrder: (v: SortOrder) => void

  page: number
  setPage: (v: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),

      search: '',
      setSearch: (search) => set({ search, page: 1 }),

      status: 'ALL',
      setStatus: (status) => set({ status, page: 1 }),

      sortBy: 'createdAt',
      setSortBy: (sortBy) => set({ sortBy }),

      sortOrder: 'desc',
      setSortOrder: (sortOrder) => set({ sortOrder }),

      page: 1,
      setPage: (page) => set({ page }),
    }),
    {
      name: 'task-app-store',
      partialize: (s) => ({ isDark: s.isDark }),
    }
  )
)
