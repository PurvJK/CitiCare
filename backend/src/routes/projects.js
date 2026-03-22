import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listProjects } from '../controllers/projects.controller.js';

const router = Router();

router.get('/', authMiddleware, listProjects);

export default router;
