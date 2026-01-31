# CitiCare – MERN Stack

Municipal citizen complaint portal built with **MongoDB**, **Express**, **React**, and **Node.js** (TypeScript throughout).

## Stack

| Layer   | Tech |
|--------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui |
| Backend  | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth     | JWT (Bearer token in `Authorization` header) |

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, API_BASE_URL (e.g. http://localhost:5000)
npm install
npm run seed    # Creates admin user + sample zones/wards/areas/departments
npm run dev    # http://localhost:5000
```

**Seed admin:** `admin@citicare.local` / `admin123` (change after first login)

### 2. Frontend

```bash
# From project root
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev    # http://localhost:5173
```

### 3. MongoDB

Have MongoDB running locally (e.g. `mongodb://localhost:27017`) or set `MONGODB_URI` in `backend/.env`.

## Project layout

```
citicare-main/
├── backend/           # Express API
│   ├── src/
│   │   ├── config/    # DB connection
│   │   ├── models/    # Mongoose models (User, Complaint, Zone, Ward, Area, Department, etc.)
│   │   ├── routes/    # auth, complaints, users, profile, documents, projects, locations, settings
│   │   ├── middleware/# auth, upload (multer)
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── src/               # React frontend
│   ├── lib/api.ts     # Axios client + auth token
│   ├── contexts/AuthContext.tsx
│   ├── hooks/         # useComplaints, useUsers, useProfile, useDocuments, useProjects, useLocations, useSettings
│   └── ...
├── .env.example       # VITE_API_URL
└── package.json
```

## API overview

- `POST /api/auth/register` – register (citizen)
- `POST /api/auth/login` – login → returns `{ token, user }`
- `GET /api/auth/me` – current user (requires `Authorization: Bearer <token>`)
- `GET/POST/PATCH/DELETE /api/complaints` – complaints (auth required; citizens see own only)
- `GET/POST /api/complaints/:id/comments` – comments
- `GET /api/complaints/stats`, `/complaints/monthly` – stats
- `GET/POST/PATCH/DELETE /api/users` – users (admin only)
- `GET/PATCH /api/profile`, `POST /api/profile/avatar`, `POST /api/profile/change-password`
- `GET /api/documents`, `GET /api/projects`
- `GET /api/locations/zones`, `/wards`, `/areas`, `/departments`
- `GET/PATCH /api/settings` – system settings (admin)

Uploads (complaint images, avatars) are stored under `backend/uploads/` and served at `/uploads/*`. Set `API_BASE_URL` in backend `.env` so image URLs in responses are absolute (e.g. `http://localhost:5000/uploads/...`).

## Environment

**Backend (`.env` in `backend/`):**

- `PORT` – default 5000
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – secret for signing JWTs
- `JWT_EXPIRES_IN` – e.g. `7d`
- `CLIENT_URL` – frontend origin (CORS)
- `API_BASE_URL` – base URL of this API (for image URLs)
- `UPLOAD_DIR` – default `./uploads`

**Frontend (`.env` in root):**

- `VITE_API_URL` – backend API base URL (e.g. `http://localhost:5000/api`)

## Notes

- 2FA is not implemented in the MERN backend; the Settings 2FA section shows a “not available” message.
- Roles: `citizen`, `officer`, `department_head`, `admin`. Only admins can manage users and system settings.
