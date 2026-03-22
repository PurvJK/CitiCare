import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getSettings, updateSetting } from '../controllers/settings.controller.js';

const router = Router();

router.get('/', authMiddleware, getSettings);

router.patch('/', authMiddleware, requireRole('admin'), updateSetting);

export default router;
