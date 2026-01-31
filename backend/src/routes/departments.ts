import { Router, Response } from 'express';
import { Department } from '../models/Department.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await Department.find().sort({ name: 1 }).lean();
    res.json(
      list.map((d: any) => ({
        id: d._id.toString(),
        name: d.name,
        code: d.code,
        description: d.description ?? null,
        created_at: d.createdAt ?? d.created_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Name and code are required' });
      return;
    }
    const existing = await Department.findOne({ $or: [{ code }, { name }] });
    if (existing) {
      res.status(400).json({ error: 'Department with this code or name already exists' });
      return;
    }
    const doc = await Department.create({ name, code, description: description ?? null });
    res.status(201).json({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (description !== undefined) update.description = description;
    const doc = await Department.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    res.json({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await Department.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
