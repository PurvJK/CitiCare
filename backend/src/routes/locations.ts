import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Zone } from '../models/Zone.js';
import { Ward } from '../models/Ward.js';
import { Area } from '../models/Area.js';
import { Department } from '../models/Department.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/zones', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await Zone.find().sort({ name: 1 }).lean();
    res.json(list.map((z: any) => ({ id: z._id.toString(), name: z.name, code: z.code })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.get('/wards', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const zoneId = req.query.zoneId as string | undefined;
    const filter = zoneId && mongoose.Types.ObjectId.isValid(zoneId) ? { zone_id: new mongoose.Types.ObjectId(zoneId) } : {};
    const list = await Ward.find(filter).sort({ name: 1 }).lean();
    res.json(list.map((w: any) => ({ id: w._id.toString(), name: w.name, code: w.code, zone_id: w.zone_id.toString() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

router.get('/areas', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wardId = req.query.wardId as string | undefined;
    const filter = wardId && mongoose.Types.ObjectId.isValid(wardId) ? { ward_id: new mongoose.Types.ObjectId(wardId) } : {};
    const list = await Area.find(filter).sort({ name: 1 }).lean();
    res.json(list.map((a: any) => ({ id: a._id.toString(), name: a.name, code: a.code, ward_id: a.ward_id.toString() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
});

router.get('/departments', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await Department.find().sort({ name: 1 }).lean();
    res.json(list.map((d: any) => ({ id: d._id.toString(), name: d.name, code: d.code, description: d.description })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;
