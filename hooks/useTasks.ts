'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import type { TaskInput, UpdateTaskInput } from '@/lib/validations'

const API = '/api/tasks'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export function useTasksQuery() {
  const { search, status, sortBy, sortOrder, page } = useAppStore()
  const params = new URLSearchParams({
    ...(status !== 'ALL' && { status }),
    ...(search && { search }),
    sortBy,
    sortOrder,
    page: String(page),
    limit: '10',
  })
  return useQuery({
    queryKey: ['tasks', { search, status, sortBy, sortOrder, page }],
    queryFn: () => apiFetch<{ tasks: Task[]; pagination: Pagination }>(`${API}?${params}`),
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiFetch<{ task: Task }>(`${API}/${id}`),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskInput) =>
      apiFetch<{ task: Task }>(API, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      apiFetch<{ task: Task }>(`${API}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueriesData({ queryKey: ['tasks'] })
      qc.setQueriesData({ queryKey: ['tasks'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const o = old as { tasks: Task[] }
        return { ...o, tasks: o.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`${API}/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueriesData({ queryKey: ['tasks'] })
      qc.setQueriesData({ queryKey: ['tasks'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const o = old as { tasks: Task[]; pagination: Pagination }
        return { ...o, tasks: o.tasks.filter((t) => t.id !== id) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

// Types
export type Task = {
  id: string
  title: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  userId: string
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
  user?: { email: string }
}

export type Attachment = {
  id: string
  filename: string
  mimetype: string
  url: string
  createdAt: string
}

export type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
}
