# Task Manager

A full-stack task management app built with Next.js 16, PostgreSQL, and Prisma. Manage tasks with filtering, search, sorting, file attachments, and an activity log — all behind JWT authentication.

## Features

- **Task management** — Create, edit, and delete tasks with title, description, status, priority, and due date
- **Filtering & search** — Filter by status, search by title, sort by any field
- **Role-based access** — Admin users can view and manage all tasks across users
- **File attachments** — Attach images and documents (up to 5 MB) to any task
- **Activity log** — Per-task history of every change
- **Optimistic UI** — Changes reflect instantly with automatic rollback on error
- **Dark mode** — Theme preference saved per user and synced across devices
- **CI** — GitHub Actions runs tests and type checks on every push

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma v7 |
| Auth | JWT · httpOnly cookie · `jose` |
| Validation | Zod v4 |
| Server state | TanStack Query v5 |
| UI state | Zustand v5 |
| Styling | Tailwind CSS v4 |
| Testing | Jest + React Testing Library |

## Getting Started

**Prerequisites:** Node.js 18+ and a PostgreSQL database (local or hosted).

```bash
# Clone and install
git clone <repo-url>
cd task-manager
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Set up the database
npm run db:migrate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be prompted to sign up on first visit.

> **Docker**: Run `docker-compose up -d postgres` to start a local Postgres instance if you don't have one already.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

See `.env.example` for the full list.

## Project Structure

```
app/
  api/          Route handlers (REST API)
  (auth)/       Login and signup pages
  tasks/        Main dashboard
components/
  ui/           Base components (Button, Input, Modal…)
  tasks/        Feature components (TaskCard, TaskForm…)
contexts/       AuthContext
hooks/          TanStack Query hooks
lib/            Auth, DB client, validation, helpers
store/          Zustand store
prisma/         Schema and migrations
__tests__/      Jest tests
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/preferences` | Update theme |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/attachments` | Upload attachment |
| DELETE | `/api/tasks/:id/attachments/:id` | Remove attachment |
| GET | `/api/tasks/:id/activity` | Activity log |

## Testing

```bash
npm test               # run all tests
npm run test:coverage  # with coverage report
```
