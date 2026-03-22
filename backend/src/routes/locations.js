import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listAreas, listDepartments, listWards, listZones } from '../controllers/locations.controller.js';

const router = Router();

router.get('/zones', authMiddleware, listZones);

router.get('/wards', authMiddleware, listWards);

router.get('/areas', authMiddleware, listAreas);

router.get('/departments', authMiddleware, listDepartments);

export default router;
