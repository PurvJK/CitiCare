import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getDepartmentOverview } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/department-overview', authMiddleware, requireRole('admin'), getDepartmentOverview);

export default router;
