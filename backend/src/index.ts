import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend folder so it works regardless of cwd
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from './app.js';
import { connectDB } from './config/db.js';
import fs from 'fs';

async function main() {
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await connectDB();

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
