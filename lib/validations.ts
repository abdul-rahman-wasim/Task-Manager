import * as z from 'zod'

export const signupSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(8, { error: 'Password must be at least 8 characters' }),
})

export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
})

export const taskSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }).max(255),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const updateTaskSchema = taskSchema.partial()

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
