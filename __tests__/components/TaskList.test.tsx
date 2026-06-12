import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskList } from '@/components/tasks/TaskList'

jest.mock('@/hooks/useTasks', () => ({
  useTasksQuery: jest.fn(),
  useCreateTask: jest.fn(() => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false, error: null })),
  useUpdateTask: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn().mockResolvedValue({}), isPending: false, error: null })),
  useDeleteTask: jest.fn(() => ({ mutate: jest.fn(), isPending: false, error: null })),
}))
jest.mock('@/hooks/useTaskStream', () => ({ useTaskStream: jest.fn() }))
jest.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({ page: 1, setPage: jest.fn() }),
}))

import { useTasksQuery } from '@/hooks/useTasks'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('TaskList', () => {
  it('shows a loading spinner while fetching', () => {
    (useTasksQuery as jest.Mock).mockReturnValue({ isLoading: true, isError: false, data: null })
    render(<TaskList />, { wrapper })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    (useTasksQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { tasks: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
    })
    render(<TaskList />, { wrapper })
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
  })

  it('renders task titles when tasks are returned', () => {
    (useTasksQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        tasks: [
          { id: '1', title: 'Fix the bug', status: 'PENDING', priority: 'HIGH', dueDate: null, description: null, userId: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attachments: [] },
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    })
    render(<TaskList />, { wrapper })
    expect(screen.getByText('Fix the bug')).toBeInTheDocument()
  })
})
