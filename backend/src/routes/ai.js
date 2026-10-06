import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { draftHelper, imageSuggest } from '../controllers/ai.controller.js';
import { aiLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.use(authMiddleware);
router.use(aiLimiter);

router.post('/draft-helper', draftHelper);
router.post('/image-suggest', upload.single('image'), imageSuggest);

export default router;
