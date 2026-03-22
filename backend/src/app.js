import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import complaintsRoutes from './routes/complaints.js';
import usersRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import documentsRoutes from './routes/documents.js';
import projectsRoutes from './routes/projects.js';
import locationsRoutes from './routes/locations.js';
import settingsRoutes from './routes/settings.js';
import departmentsRoutes from './routes/departments.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import announcementsRoutes from './routes/announcements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const defaultOrigin = 'http://localhost:8080';
const allowedOrigins = [
  process.env.CLIENT_URL || defaultOrigin,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// When running in DBLESS mode we skip mounting the real API route handlers
// (they depend on MongoDB). DBLESS mode is intended for frontend work only —
// dev stubs are mounted from `src/dev-stubs.ts`.
if (process.env.DBLESS !== 'true') {
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/documents', documentsRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/locations', locationsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/announcements', announcementsRoutes);
} else {
  console.warn('[app] DBLESS=true — real API routes will not be mounted (dev stubs expected)');
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
