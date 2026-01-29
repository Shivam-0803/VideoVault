import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
const processedDir = path.join(__dirname, '..', 'processed');

[uploadsDir, processedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const maxSize = 500 * 1024 * 1024; // 500MB

export const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Allowed: mp4, webm, mov, avi'));
    }
    cb(null, true);
  },
});
