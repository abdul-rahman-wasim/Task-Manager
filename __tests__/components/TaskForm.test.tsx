import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskForm } from '@/components/tasks/TaskForm'

jest.mock('@/hooks/useTasks', () => ({
  useCreateTask: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), error: null }),
  useUpdateTask: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), error: null }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('TaskForm', () => {
  it('renders the form when open', () => {
    render(<TaskForm open={true} onClose={() => {}} />, { wrapper })
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
  })

  it('shows validation error when title is empty', async () => {
    render(<TaskForm open={true} onClose={() => {}} />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /create task/i }))
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
  })

  it('calls onClose after successful create', async () => {
    const onClose = jest.fn()
    render(<TaskForm open={true} onClose={onClose} />, { wrapper })
    await userEvent.type(screen.getByLabelText(/title/i), 'My new task')
    fireEvent.click(screen.getByRole('button', { name: /create task/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
