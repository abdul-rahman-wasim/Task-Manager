# Task Manager — Developer Context

## What this project is
Full-stack task management app built for a Rival.io developer assessment. Next.js 16 (App Router) handles both the frontend and REST API backend. PostgreSQL via Prisma v7 for persistence.

## Key tech decisions
- **Next.js Route Handlers** = the REST API (`app/api/**`)
- **Prisma v7** with new `prisma.config.ts` pattern — client outputs to `app/generated/prisma`, import as `@/app/generated/prisma/client`. **Breaking change from v6:** `url` is no longer allowed in `schema.prisma`; a `PrismaPg` driver adapter is passed to the `PrismaClient` constructor instead. See `lib/db.ts`.
- **JWT in httpOnly cookie** — `lib/auth.ts` using `jose` v6. Functions: `signToken`, `verifyToken`, `getAuthUser`, `setAuthCookie`, `clearAuthCookie`
- **Zod v4** — use `z.email()` not `z.string().email()`. Error option is `{ error: 'msg' }` not `{ message: 'msg' }`. Schemas in `lib/validations.ts`
- **TanStack Query** for all client data fetching — hooks in `hooks/useTasks.ts`
- **Zustand** for UI state (filters, search, sort, dark mode) — `store/useAppStore.ts`. Filters are persisted to localStorage via `persist` middleware (only `isDark` persists across sessions; filter state resets)
- **Dark mode** — Tailwind v4 `@variant dark (&:where(.dark, .dark *))` with Zustand toggle. The `Navbar` syncs the `dark` class to `<html>`. An inline `<DarkModeScript>` prevents flash on load
- **SSE real-time** — `lib/taskEvents.ts` (in-memory EventEmitter) + `app/api/tasks/stream/route.ts`. Every mutating route emits events. Frontend subscribes in `hooks/useTaskStream.ts`

## Critical API patterns
Route handler params are **Promises** in Next.js 15+:
```ts
export async function GET(_req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```
`cookies()` from `next/headers` is **async**:
```ts
const cookieStore = await cookies()
```

## Folder structure
```
app/api/          — REST endpoints (auth + tasks + SSE + attachments + activity)
app/(auth)/       — Login / signup pages (route group, no layout)
app/tasks/        — Main dashboard page
components/ui/    — Button, Input, Select, Badge, Modal, Spinner
components/tasks/ — TaskCard, TaskList, TaskForm, TaskFilters, ActivityPanel, AttachmentList
components/       — Navbar, Providers, DarkModeScript
contexts/         — AuthContext (user session)
hooks/            — useTasks (TanStack Query), useTaskStream (SSE)
lib/              — db, auth, validations, logActivity, taskEvents
store/            — useAppStore (Zustand)
prisma/           — schema.prisma + migrations/
__tests__/        — Jest tests
```

## Running locally
```bash
docker-compose up -d postgres          # start Postgres
npm run db:migrate                     # apply migrations + generate client
npm run dev                            # start dev server at :3000
```
First-time only — Prisma client is generated automatically by `migrate dev`.

## Running tests
```bash
npm test
```
Tests mock Prisma and next/headers — no live DB needed for unit tests.

## Environment variables
See `.env.example`. Required vars: `DATABASE_URL`, `JWT_SECRET`.

## Bonus features implemented
- Role-based access (ADMIN sees all users' tasks)
- Real-time updates via SSE (in-memory; note: single-process only — see README tradeoffs)
- Optimistic UI (TanStack Query `onMutate` + `onError` rollback)
- Task file attachments (saved to `public/uploads/{taskId}/`)
- Activity log per task
- Dark mode with persisted preference
- Docker Compose + Dockerfile
- GitHub Actions CI
