Quick start (backend)

Prerequisites
- Node.js 18+ and npm
- (recommended) Docker to run MongoDB quickly

Steps
1) Start MongoDB with Docker (recommended)
   docker compose up -d mongo

2) Copy .env example and edit if needed
   cp .env.example .env

AI draft helper (optional)
- Set `AI_PROVIDER=gemini` in `backend/.env`.
- Set `GEMINI_API_KEY` in `backend/.env`.
- Optional: tune `GEMINI_MODEL` and `GEMINI_MODEL_VISION`.
- `AI_FEATURE_DRAFT_HELPER=false` disables external AI calls and returns local fallback hints.
- Upload one photo to `/api/ai/image-suggest` to receive AI suggestions for category, department, title, and description.
- `AI_FEATURE_IMAGE_HELPER=false` disables image-based external AI calls and uses fallback suggestions.
- Complaint text is sanitized for emails and phone numbers before outbound AI requests.

3) Install and run in dev mode
   npm --prefix backend install
   npm --prefix backend run dev

What I fixed (dev):
- Resolved a merge-conflict and restored a working `backend/package.json`.
- Fixed several TypeScript model interfaces to match Mongoose timestamps (added `createdAt`/`updatedAt`).
- Improved DB connect logic and error message when MongoDB is not available.

If you don't want Docker: install MongoDB locally and set `MONGODB_URI` in `.env`.

Seeding sample data
- Run: `npm --prefix backend run seed` (after DB is available)

If you want me to add a Dockerfile / full compose for backend+frontend, tell me and I will add it.