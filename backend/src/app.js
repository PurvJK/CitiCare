import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiLimiter } from './middleware/rate-limiter.js';

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
import notificationsRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust first proxy (Render / Vercel reverse proxy load balancers)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows serving uploaded complaint images across domains
  })
);
app.disable('x-powered-by');

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Apply general rate limiting across API endpoints
app.use('/api', apiLimiter);

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use(
  '/uploads',
  express.static(uploadDir, {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// When running in DBLESS mode we skip mounting the real API route handlers
// (they depend on MongoDB). DBLESS mode is intended for frontend work only —
// dev stubs are mounted from `src/dev-stubs.ts`.
if (process.env.DBLESS !== 'true') {
  // Primary API routes (/api/...)
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
  app.use('/api/notifications', notificationsRoutes);

  // Fallback routes without /api prefix (for frontend clients configured with origin baseURL)
  app.use('/auth', authRoutes);
  app.use('/complaints', complaintsRoutes);
  app.use('/users', usersRoutes);
  app.use('/profile', profileRoutes);
  app.use('/documents', documentsRoutes);
  app.use('/projects', projectsRoutes);
  app.use('/locations', locationsRoutes);
  app.use('/settings', settingsRoutes);
  app.use('/departments', departmentsRoutes);
  app.use('/analytics', analyticsRoutes);
  app.use('/ai', aiRoutes);
  app.use('/announcements', announcementsRoutes);
  app.use('/notifications', notificationsRoutes);
} else {
  console.warn('[app] DBLESS=true — real API routes will not be mounted (dev stubs expected)');
}

app.get(['/api/health', '/health'], (_req, res) => res.json({ ok: true }));

export default app;
