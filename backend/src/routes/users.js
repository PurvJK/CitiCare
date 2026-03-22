import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  createUser,
  deleteUser,
  listUsers,
  updateUserDepartment,
  updateUserRole,
} from '../controllers/users.controller.js';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId/department', updateUserDepartment);
router.delete('/:userId', deleteUser);

export default router;
