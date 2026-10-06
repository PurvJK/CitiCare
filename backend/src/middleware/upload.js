import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';

const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Derive extension strictly from validated mimetype to prevent executable extensions
    const ext = MIME_EXTENSION_MAP[file.mimetype.toLowerCase()] || '.jpg';
    const name = `${randomBytes(12).toString('hex')}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const isAllowedMime = Boolean(MIME_EXTENSION_MAP[file.mimetype?.toLowerCase()]);
    if (isAllowedMime) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

