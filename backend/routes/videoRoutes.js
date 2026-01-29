import { Router } from 'express';
import { upload } from '../utils/multerConfig.js';
import { auth, authOptional, requireRole } from '../middlewares/auth.js';
import {
  uploadVideo,
  listVideos,
  getStatus,
  streamVideo,
  shareVideo,
  deleteVideo,
} from '../controllers/videoController.js';

const router = Router();

router.get('/:id/stream', authOptional, streamVideo);

router.use(auth);

router.get('/', listVideos);
router.get('/:id/status', getStatus);

router.post('/upload', requireRole('editor', 'admin'), upload.single('video'), uploadVideo);
router.post('/:id/share', requireRole('admin'), shareVideo);
router.delete('/:id', deleteVideo);

export default router;
