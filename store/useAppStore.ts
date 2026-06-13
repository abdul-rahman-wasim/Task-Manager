'use client'

import { create } from 'zustand'

export type SortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'
export type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DONE'

interface AppState {
  isDark: boolean
  setDark: (dark: boolean) => void
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

export const useAppStore = create<AppState>()((set, get) => ({
  isDark: false,
  setDark: (dark) => set({ isDark: dark }),
  toggleDark: () => {
    const isDark = !get().isDark
    set({ isDark })
    fetch('/api/auth/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: isDark ? 'dark' : 'light' }),
    }).catch(console.error)
  },

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
}))
