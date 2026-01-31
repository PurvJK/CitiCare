import { Router, Response } from 'express';
import { Document } from '../models/Document.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await Document.find().sort({ created_at: -1 }).lean();
    res.json(
      list.map((d: any) => ({
        id: d._id.toString(),
        title: d.title,
        description: d.description,
        category: d.category,
        file_url: d.file_url,
        file_type: d.file_type,
        file_size: d.file_size,
        uploaded_by: d.uploaded_by?.toString() ?? null,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router;
