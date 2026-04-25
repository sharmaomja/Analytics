# Full-Stack Auth Starter

A full-stack authentication and CSV ingestion starter built with:

- Bun + React + Vite
- Tailwind CSS
- Node.js + Express
- PostgreSQL on Neon
- bcrypt password hashing
- JWT authentication
- `csv-parse` CSV ingestion pipeline
- `multer` multipart uploads

## Project Structure

```text
.
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── sql/
│   │   └── schema.sql
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── datasetController.ts
│       │   └── uploadController.ts
│       ├── db/
│       │   ├── index.ts
│       │   └── queries.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts
│       │   └── errorMiddleware.ts
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── datasetRoutes.ts
│       │   └── uploadRoutes.ts
│       ├── services/
│       │   └── parserService.ts
│       ├── types/
│       │   └── express.d.ts
│       └── utils/
│           ├── jwt.ts
│           └── validate.ts
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       │   ├── AuthCard.tsx
│       │   ├── AuthForm.tsx
│       │   ├── DashboardShell.tsx
│       │   ├── FileUpload.tsx
│       │   └── ProtectedRoute.tsx
│       ├── hooks/
│       │   └── useAuth.tsx
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx
│       │   └── UploadPage.tsx
│       ├── types/
│       │   ├── auth.ts
│       │   └── data.ts
│       └── utils/
│           ├── api.ts
│           ├── auth.ts
│           └── validators.ts
├── .env.example
├── package.json
└── README.md
```

## Features

- User signup with email and password
- User login with bcrypt password verification
- JWT returned from the backend and stored in `localStorage`
- Protected `GET /auth/me` route using `Authorization: Bearer <token>`
- React auth state hydration on refresh
- Protected dashboard route
- Protected upload route
- Dataset creation and listing
- CSV upload with `multipart/form-data`
- Raw CSV storage in the `files` table
- CSV parsing in the backend with `csv-parse`
- Parsed JSONB event storage in the `events` table
- File lifecycle statuses: `uploaded`, `processing`, `ready`, `failed`
- Logout support
- Tailwind-based responsive UI
- Input validation and error handling on both frontend and backend

## Environment Variables

Create these files before running the app:

### `backend/.env`

```env
DATABASE_URL=postgresql://neondb_owner:npg_f5LTeN0SXQzu@ep-fancy-tooth-amwuc2q9-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=replace-with-a-long-random-secret
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

The root `.env.example` includes the same values as a reference template.

## Database Schema

Run the SQL in `backend/sql/schema.sql` against your Neon database:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  raw_content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_files_dataset_id ON files(dataset_id);
CREATE INDEX IF NOT EXISTS idx_events_dataset_id ON events(dataset_id);
CREATE INDEX IF NOT EXISTS idx_events_file_id ON events(file_id);
```

## Phase 2 Install Notes

Backend dependencies added for ingestion:

```bash
cd backend && bun add csv-parse multer && bun add -d @types/multer
```

## Setup

1. Install frontend dependencies:

```bash
cd frontend && bun install
```

2. Install backend dependencies:

```bash
cd backend && bun install
```

3. Create `backend/.env` and `frontend/.env` from the examples above.

4. The backend auto-applies `backend/sql/schema.sql` on startup. You can also run it manually against Neon if you prefer.

5. Start the backend:

```bash
cd backend && bun run dev
```

6. Start the frontend:

```bash
cd frontend && bun run dev
```

7. Open `http://localhost:5173`.

## API Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /datasets`
- `GET /datasets`
- `POST /upload`

## Example API Requests

Create dataset:

```http
POST /datasets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Customer Events - April",
  "description": "Raw customer export"
}
```

List datasets:

```http
GET /datasets
Authorization: Bearer <token>
```

Upload CSV:

```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

datasetId=<dataset-uuid>
file=<events.csv>
```

## Example Parsed Event

CSV row:

```csv
email,name,plan
alice@example.com,Alice,pro
```

Stored `event_data` JSON:

```json
{
  "email": "alice@example.com",
  "name": "Alice",
  "plan": "pro"
}
```

## Root Helper Scripts

From the project root:

```bash
bun run dev:backend
bun run dev:frontend
bun run build
```

## Notes

- Passwords are hashed with bcrypt before storage.
- JWTs are never stored in the database.
- Only hashed passwords are saved.
- The dashboard is protected on both the client and server.
- Raw CSV content is stored once in `files.raw_content` and parsed rows are stored once in `events`.
- CSV files are limited to 5MB and accepted only when they are valid `.csv` uploads.
# Analytics
