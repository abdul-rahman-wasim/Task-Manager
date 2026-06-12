# API Reference

All endpoints return JSON. Error responses have shape `{ "error": "message" }`.
Task routes require a valid `auth-token` httpOnly cookie (set on login/signup).

---

## Auth

### `POST /api/auth/signup`
Register a new account.

**Body:** `{ "email": "user@example.com", "password": "min8chars" }`

**Response 201:** `{ "user": { "id", "email", "role" } }`

**Errors:** 400 (validation), 409 (email taken)

---

### `POST /api/auth/login`
Sign in and receive an auth cookie.

**Body:** `{ "email": "user@example.com", "password": "..." }`

**Response 200:** `{ "user": { "id", "email", "role" } }`

**Errors:** 400 (validation), 401 (invalid credentials)

---

### `POST /api/auth/logout`
Clear the auth cookie.

**Response 200:** `{ "message": "Logged out" }`

---

### `GET /api/auth/me`
Return the currently authenticated user.

**Response 200:** `{ "user": { "id", "email", "role", "createdAt" } }`

**Errors:** 401

---

## Tasks

### `GET /api/tasks`
List tasks for the authenticated user (admins see all users' tasks).

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `status` | `PENDING\|IN_PROGRESS\|DONE` | — | Filter by status |
| `search` | string | — | Case-insensitive title search |
| `sortBy` | `createdAt\|updatedAt\|dueDate\|priority\|title` | `createdAt` | Sort field |
| `sortOrder` | `asc\|desc` | `desc` | Sort direction |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Results per page (max 50) |

**Response 200:**
```json
{
  "tasks": [{ "id", "title", "description", "status", "priority", "dueDate", "userId", "createdAt", "updatedAt", "attachments": [] }],
  "pagination": { "page", "limit", "total", "pages" }
}
```

---

### `POST /api/tasks`
Create a new task.

**Body:**
```json
{
  "title": "Fix login bug",
  "description": "Optional",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2026-07-01T00:00:00.000Z"
}
```

**Response 201:** `{ "task": { ... } }`

**Errors:** 400 (validation), 401

---

### `GET /api/tasks/:id`
Fetch a single task with attachments and recent activity.

**Response 200:** `{ "task": { ..., "attachments": [], "activityLogs": [] } }`

**Errors:** 401, 403, 404

---

### `PATCH /api/tasks/:id`
Partially update a task (any combination of fields).

**Body:** any subset of task fields

**Response 200:** `{ "task": { ... } }`

**Errors:** 400, 401, 403, 404

---

### `DELETE /api/tasks/:id`
Delete a task and its attachments.

**Response 200:** `{ "message": "Task deleted" }`

**Errors:** 401, 403, 404

---

## Real-time

### `GET /api/tasks/stream`
Server-Sent Events endpoint. Connect with `EventSource('/api/tasks/stream')`.

Each event is `data: {"type":"task:created"|"task:updated"|"task:deleted","taskId":"...","userId":"..."}\n\n`.

---

## Attachments

### `POST /api/tasks/:id/attachments`
Upload a file (multipart/form-data, field name `file`).

Accepted types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `.doc`, `.docx`
Max size: 5 MB

**Response 201:** `{ "attachment": { "id", "filename", "mimetype", "url", "createdAt" } }`

---

### `DELETE /api/tasks/:id/attachments/:attachmentId`
Remove an attachment from a task.

**Response 200:** `{ "message": "Attachment deleted" }`

---

## Activity log

### `GET /api/tasks/:id/activity`
Return the activity log for a task (last 50 entries, newest first).

**Response 200:**
```json
{
  "logs": [{
    "id", "action", "metadata", "createdAt",
    "user": { "email" }
  }]
}
```

Actions: `created`, `updated`, `status_changed`, `deleted`, `attachment_added`, `attachment_removed`
