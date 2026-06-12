# Architecture

## Overview

Single Next.js 16 application using the App Router. Route Handlers serve as the REST API backend. The frontend is rendered client-side for the dashboard and server-side for auth pages.

```
Browser
  │
  ├── GET /tasks        → app/tasks/page.tsx (client component)
  │     └── fetch /api/tasks → app/api/tasks/route.ts → PostgreSQL
  │
  ├── POST /api/auth/login → app/api/auth/login/route.ts
  │     └── bcrypt verify → set JWT httpOnly cookie
  │
  └── GET /api/tasks/stream → app/api/tasks/stream/route.ts
        └── Server-Sent Events (EventEmitter singleton)
```

## Auth flow

1. User submits login form → `POST /api/auth/login`
2. Server verifies password hash (bcrypt)
3. Server signs a JWT (`jose` HS256, 7 day expiry) and sets it as an `httpOnly` cookie
4. All subsequent requests carry the cookie automatically
5. `middleware.ts` intercepts protected routes — reads cookie, calls `verifyToken()`. Unauthenticated API calls → 401. Unauthenticated page visits → redirect to `/login?redirect=<path>`
6. `lib/auth.ts` `getAuthUser()` is called at the top of every API route to get `{ userId, role }`

## Data flow (task list)

1. `app/tasks/page.tsx` renders `<TaskList />`
2. `TaskList` calls `useTasksQuery()` (TanStack Query)
3. `useTasksQuery` reads filter state from Zustand store and builds query params
4. On any mutation (create/update/delete), `taskEmitter` emits an event
5. `useTaskStream` listens via `EventSource` and calls `queryClient.invalidateQueries(['tasks'])`
6. Optimistic updates are applied immediately via `useMutation.onMutate` and rolled back on error

## Database schema

```
User ──< Task ──< Attachment
          │
          └──< ActivityLog
```

- `User.role` = `USER | ADMIN`. Admins see all tasks; users see only their own.
- `Task.status` = `PENDING | IN_PROGRESS | DONE`
- `Task.priority` = `LOW | MEDIUM | HIGH`
- `ActivityLog` records every mutation with `action` and optional `metadata` JSON (e.g. before/after values)
- `Attachment.url` = relative path `/uploads/{taskId}/{uuid}.ext` served from Next.js public folder

## Real-time (SSE)

`lib/taskEvents.ts` exports a Node.js `EventEmitter` singleton. Every mutating API route calls `taskEmitter.emit('task:created' | 'task:updated' | 'task:deleted', payload)` after the DB write. The SSE endpoint (`/api/tasks/stream`) subscribes to these events and streams them to connected clients.

**Production note:** The in-memory EventEmitter only works with a single Node.js process. For multi-process deployments (e.g. PM2 cluster, Kubernetes pods) switch to Redis pub/sub.
