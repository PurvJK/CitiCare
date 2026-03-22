import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { changePassword, getProfile, updateProfile, uploadAvatar } from '../controllers/profile.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);

router.patch('/', updateProfile);

router.post('/avatar', upload.single('avatar'), uploadAvatar);

router.post('/change-password', changePassword);

export default router;
