# Local Setup

## Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres) **or** a local PostgreSQL installation

## 1. Install dependencies
```bash
npm install
```

## 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env — you must set a strong JWT_SECRET in production
```

## 3. Start PostgreSQL

**Option A — Docker (recommended, no Postgres install needed):**
```bash
docker-compose up -d postgres
```
Postgres is available at `localhost:5432`. The `docker-compose.yml` also includes the Next.js app service for full-stack Docker deployment.

**Option B — Local Postgres:**
Create a database called `taskmanager`, then set `DATABASE_URL` in `.env`.

## 4. Run database migrations
```bash
npm run db:migrate
```
This runs `prisma migrate dev`, which creates the tables and generates the Prisma client.

## 5. Start the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Run tests
```bash
npm test
```
Unit tests mock the database — no running Postgres needed.

---

## One-command Docker setup (full stack)
```bash
# Copy and edit env vars first
cp .env.example .env
# Then:
docker-compose up --build
```
This builds the Next.js app image and starts both Postgres and the app.
After the app starts, run migrations inside the container:
```bash
docker-compose exec app npx prisma migrate deploy
```

---

## Useful commands
```bash
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Re-generate Prisma client (after schema changes)
npm test:coverage    # Tests with coverage report
```
