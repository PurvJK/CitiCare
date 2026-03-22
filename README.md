# CitiCare
Smart City Complaint Management System using MERN Stack
=======
# CitiCare – MERN Stack

Municipal citizen complaint portal. **Frontend** and **backend** are in separate folders and connect via environment variables.

## Project structure

```
citicare-main/
├── frontend/     # React + TypeScript (Vite) – runs on http://localhost:8080
├── backend/      # Node + Express + MongoDB – runs on http://localhost:5000
└── README.md     # This file
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET. CLIENT_URL must match where frontend runs (see below).
npm install
npm run seed    # Optional: creates admin user + sample data
npm run dev
```

- Backend runs at **http://localhost:5000**
- Health check: http://localhost:5000/api/health → `{"ok":true}`

### Backend `.env` (from `backend/.env.example`)

| Variable       | Purpose |
|----------------|--------|
| `PORT`         | Server port (default 5000) |
| `MONGODB_URI`  | MongoDB connection string (local or Atlas) |
| `JWT_SECRET`   | Secret for JWT tokens |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `CLIENT_URL`   | **Must match frontend URL** (e.g. `http://localhost:8080`) for CORS |
| `API_BASE_URL` | Backend base URL for image links (e.g. `http://localhost:5000`) |
| `UPLOAD_DIR`   | Folder for uploads (default `./uploads`) |

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env
# .env should have VITE_API_URL=http://localhost:5000/api (points to backend)
npm install
npm run dev
```

- Frontend runs at **http://localhost:8080** (see `frontend/vite.config.ts`)

### Frontend `.env` (from `frontend/.env.example`)

| Variable        | Purpose |
|-----------------|--------|
| `VITE_API_URL`  | Backend API base URL: **http://localhost:5000/api** (no trailing slash) |

**Important:** Restart the frontend dev server after changing `.env` (Vite reads env only at start).

## 3. Integration checklist

- **Backend** `CLIENT_URL` = URL where the frontend is opened (e.g. `http://localhost:8080`). This is used for CORS so the browser allows API requests.
- **Frontend** `VITE_API_URL` = Backend API URL (e.g. `http://localhost:5000/api`). All API calls go to this base URL.

If frontend runs on a different port, set `CLIENT_URL` in `backend/.env` to that URL (e.g. `http://localhost:3000`).

## 4. Run both (two terminals)

| Terminal 1 (backend) | Terminal 2 (frontend) |
|----------------------|------------------------|
| `cd backend`         | `cd frontend`          |
| `npm run dev`        | `npm run dev`          |
| → http://localhost:5000 | → http://localhost:8080 |

Then open **http://localhost:8080** in the browser. Register or log in (seed admin: `admin@citicare.local` / `admin123`).

## 5. API overview

- `POST /api/auth/register` – register
- `POST /api/auth/login` – login
- `GET /api/auth/me` – current user (Bearer token)
- `GET/POST/PATCH/DELETE /api/complaints` – complaints
- Plus: `/api/users`, `/api/profile`, `/api/documents`, `/api/projects`, `/api/locations`, `/api/settings`

Uploads (images, avatars) are served at `http://localhost:5000/uploads/*`.
>>>>>>> 7e42e17 (CitiCare: Smart City Complaint Management System)
