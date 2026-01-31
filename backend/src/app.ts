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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Allow frontend origin (Vite default 5173 or custom e.g. 8080). CLIENT_URL in .env should match where frontend runs.
const defaultOrigin = 'http://localhost:8080';
const allowedOrigins = [
  process.env.CLIENT_URL || defaultOrigin,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/departments', departmentsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
