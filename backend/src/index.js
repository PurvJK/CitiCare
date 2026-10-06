import './config/env.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from './app.js';

import { connectDB } from './config/db.js';
import { startSlaChecker } from './services/sla/sla.service.js';
import fs from 'fs';

async function main() {
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // DBLESS dev mode: skip MongoDB and mount lightweight stubs so the frontend can work
  if (process.env.DBLESS === 'true') {
    console.warn('[startup] DBLESS=true — starting without MongoDB (dev-only, limited API)');
    const { installDevStubs } = await import('./dev-stubs.js');
    installDevStubs(app);
  } else {
    await connectDB();
    startSlaChecker();
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'replace-with-your-gemini-key') {
    console.warn('\x1b[33m%s\x1b[0m', '[AI WARNING] GEMINI_API_KEY is not configured or is using default placeholder. AI Vision auto-categorization will run in local fallback mode. Please configure a valid key in backend/.env to activate full Gemini-powered photo analysis.');
  }

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
