import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createAnnouncement, listAnnouncements } from '../controllers/announcements.controller.js';

const router = Router();

router.post('/', authMiddleware, createAnnouncement);

router.get('/', authMiddleware, listAnnouncements);

export default router;
