import { Router } from 'express';
import { auth, requireRole } from '../middlewares/auth.js';
import { listUsers } from '../controllers/userController.js';

const router = Router();

router.use(auth);
router.get('/', requireRole('admin'), listUsers);

export default router;
