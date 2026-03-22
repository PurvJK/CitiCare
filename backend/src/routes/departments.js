import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from '../controllers/departments.controller.js';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', listDepartments);

router.post('/', createDepartment);

router.patch('/:id', updateDepartment);

router.delete('/:id', deleteDepartment);

export default router;
