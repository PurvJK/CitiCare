import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  testEmailNotification,
} from '../controllers/notifications.controller.js';

const router = Router();

// Enforce auth middleware for all notification routes
router.use(authMiddleware);

router.get('/', listNotifications);
router.post('/test-email', testEmailNotification);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
