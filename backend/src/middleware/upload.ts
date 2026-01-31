import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = randomBytes(8).toString('hex') + '-' + Date.now() + ext;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export const uploadAny = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
