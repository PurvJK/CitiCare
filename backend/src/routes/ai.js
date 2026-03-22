import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { generateDraftHelper } from '../services/ai/draft-helper.js';
import { generateImageSuggestions } from '../services/ai/image-suggest.js';
import { upload } from '../middleware/upload.js';
import { Department } from '../models/Department.js';
import { readFile, unlink } from 'fs/promises';

const router = Router();

router.use(authMiddleware);

router.post('/draft-helper', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title && !description) {
      res.status(400).json({ error: 'Title or description is required' });
      return;
    }

    if ((title || '').length > 200 || (description || '').length > 4000) {
      res.status(400).json({ error: 'Input exceeds allowed length' });
      return;
    }

    const result = await generateDraftHelper({
      title: (title || '').trim(),
      description: (description || '').trim(),
      category: (category || '').trim() || undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('[POST /api/ai/draft-helper]', error?.message ?? error);
    res.status(500).json({ error: 'Failed to generate draft helper suggestions' });
  }
});

router.post('/image-suggest', upload.single('image'), async (req, res) => {
  const file = req.file;

  try {
    if (!file?.path || !file.mimetype) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const imageBuffer = await readFile(file.path);
    const departments = await Department.find().select('_id name category').lean();

    const result = await generateImageSuggestions({
      imageBuffer,
      mimeType: file.mimetype,
      title: typeof req.body?.title === 'string' ? req.body.title : '',
      description: typeof req.body?.description === 'string' ? req.body.description : '',
      address: typeof req.body?.address === 'string' ? req.body.address : '',
      departments: departments.map((dept) => ({
        id: dept._id.toString(),
        name: dept.name,
        category: dept.category ?? null,
      })),
    });

    res.json(result);
  } catch (error) {
    console.error('[POST /api/ai/image-suggest]', error?.message ?? error);
    res.status(500).json({ error: 'Failed to generate image-based suggestions' });
  } finally {
    if (file?.path) {
      await unlink(file.path).catch(() => undefined);
    }
  }
});

export default router;
