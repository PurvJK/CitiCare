import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { draftHelper, imageSuggest } from '../controllers/ai.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/draft-helper', draftHelper);

router.post('/image-suggest', upload.single('image'), imageSuggest);

export default router;
