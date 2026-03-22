import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listDocuments } from '../controllers/documents.controller.js';

const router = Router();

router.get('/', authMiddleware, listDocuments);

export default router;
