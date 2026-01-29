import dotenv from 'dotenv';
dotenv.config();

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const JWT_SECRET = process.env.JWT_SECRET;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
export const PROCESSED_DIR = process.env.PROCESSED_DIR || 'processed';
export const MAX_VIDEO_SIZE_MB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10);
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
