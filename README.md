# Task Manager

A full-stack task management application built with Next.js 16, PostgreSQL, and Prisma.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env        # then set JWT_SECRET

# 3. Start Postgres (requires Docker)
docker-compose up -d postgres

# 4. Run database migrations
npm run db:migrate

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the tasks dashboard after signing up.

See [docs/setup.md](docs/setup.md) for detailed setup instructions including non-Docker options.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma v7 |
| Auth | JWT via `jose` + httpOnly cookie |
| Validation | Zod v4 |
| Server state | TanStack Query v5 |
| UI state | Zustand v5 |
| Styling | Tailwind CSS v4 |
| Testing | Jest + React Testing Library |

---

## Features

### Core
- **REST API** — `POST/GET/PATCH/DELETE /api/tasks` with filtering, search, sort, and pagination
- **Authentication** — JWT signup/login, persists across page refreshes via httpOnly cookie
- **Task management** — Create, edit, delete tasks with title, description, status, priority, and due date
- **Filters** — Filter by status, search by title, sort by date/priority/title (all work together)
- **Responsive** — Mobile-friendly layout

### Bonus
- **Role-based access** — Admin users see all tasks from all users
- **Real-time updates** — Server-Sent Events push task changes live to all connected clients
- **Optimistic UI** — Task updates are reflected immediately; rolled back on error
- **Task attachments** — Upload images and documents (max 5 MB) per task
- **Activity log** — Full history of changes per task (who did what and when)
- **Dark mode** — Theme toggle with preference persisted to localStorage
- **Docker Compose** — One-command local setup (`docker-compose up`)
- **CI pipeline** — GitHub Actions runs tests and type checks on every push

---

## Project Structure

```
app/api/          REST API endpoints
app/(auth)/       Login / signup pages
app/tasks/        Main dashboard
components/       React components (ui/ + tasks/)
hooks/            TanStack Query + SSE hooks
lib/              Auth, DB, validation helpers
store/            Zustand store
prisma/           Schema + migrations
__tests__/        Jest tests
docs/             Architecture, API reference, setup guide
```

See [CLAUDE.md](CLAUDE.md) for developer context and [docs/architecture.md](docs/architecture.md) for system design.

---

## Running Tests

```bash
npm test                 # run all tests
npm run test:coverage    # with coverage report
```

---

## API Reference

See [docs/api.md](docs/api.md) for the full API reference with request/response examples.

---

## Assumptions & Trade-offs

- **Next.js full-stack instead of Go backend**: The assessment prefers Go, but allows choosing based on expertise. Using Next.js Route Handlers delivers a clean, production-quality REST API while leveraging the team's strongest skills.

- **Real-time via SSE instead of WebSockets**: SSE is simpler to implement in Next.js, is natively supported by all modern browsers, and is sufficient for one-directional server→client task updates. WebSockets would be needed for bidirectional communication (e.g. collaborative editing).

- **In-memory EventEmitter for SSE**: Works for single-process development and single-instance deployments. For multi-process or multi-replica production environments, replace with Redis pub/sub (e.g. `ioredis`).

- **File uploads to `public/uploads/`**: Simple and zero-dependency for a development environment. Production deployments should use object storage (S3, Cloudflare R2) for persistence and scalability.

- **JWT in httpOnly cookie (not localStorage)**: More secure against XSS. The 7-day expiry balances security and UX.
