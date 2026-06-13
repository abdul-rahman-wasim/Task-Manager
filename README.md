# Task Manager

A full-stack task management application built with Next.js 16, PostgreSQL, and Prisma.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env        # then set DATABASE_URL and JWT_SECRET

# 3. Run database migrations
npm run db:migrate

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the tasks dashboard after signing up.

> **Local Postgres**: You can run `docker-compose up -d postgres` if you have Docker, or point `DATABASE_URL` at any PostgreSQL instance (e.g. Neon).

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
- **Optimistic UI** — Task updates are reflected immediately; rolled back on error
- **Task attachments** — Upload images and documents (max 5 MB) per task
- **Activity log** — Full history of changes per task (who did what and when)
- **Dark mode** — Theme toggle with preference persisted to the database (cross-device)
- **CI pipeline** — GitHub Actions runs tests and type checks on every push

---

## Project Structure

```
app/api/          REST API endpoints
app/(auth)/       Login / signup pages
app/tasks/        Main dashboard
components/       React components (ui/ + tasks/)
hooks/            TanStack Query hooks
lib/              Auth, DB, validation helpers
store/            Zustand store
prisma/           Schema + migrations
__tests__/        Jest tests
```

---

## Running Tests

```bash
npm test                 # run all tests
npm run test:coverage    # with coverage report
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login, sets httpOnly cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/preferences` | Update theme preference |
| GET | `/api/tasks` | List tasks (with filters, search, sort, pagination) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get task with activity log |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/tasks/:id/attachments` | Upload an attachment |
| DELETE | `/api/tasks/:id/attachments/:attachmentId` | Remove an attachment |
| GET | `/api/tasks/:id/activity` | Get activity log for a task |

---

## Assumptions & Trade-offs

- **Next.js full-stack instead of Go backend**: The assessment prefers Go, but allows choosing based on expertise. Using Next.js Route Handlers delivers a clean, production-quality REST API while leveraging the team's strongest skills.

- **File uploads to `public/uploads/`**: Simple and zero-dependency for a development environment. Production deployments should use object storage (S3, Cloudflare R2) for persistence and scalability.

- **JWT in httpOnly cookie (not localStorage)**: More secure against XSS. The 7-day expiry balances security and UX.

- **Dark mode via server-rendered class**: `layout.tsx` reads `themePreference` from the database on every request and sets `class="dark"` on `<html>` server-side. No flash-of-unstyled-content, no localStorage dependency.
