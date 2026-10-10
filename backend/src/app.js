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

const defaultOrigin = 'http://localhost:8080';
const allowedOrigins = [
  process.env.CLIENT_URL,
  defaultOrigin,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.CLIENT_URL === '*' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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
} else {
  console.warn('[app] DBLESS=true — real API routes will not be mounted (dev stubs expected)');
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
