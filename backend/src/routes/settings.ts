import { Router, Response } from 'express';
import { SystemSetting } from '../models/SystemSetting.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rows = await SystemSetting.find().lean();
    const settings = {
      auto_assign_complaints: true,
      email_confirmations: false,
      maintenance_mode: false,
    };
    rows.forEach((r: any) => {
      if (r.key === 'auto_assign_complaints') settings.auto_assign_complaints = r.value === 'true';
      else if (r.key === 'email_confirmations') settings.email_confirmations = r.value === 'true';
      else if (r.key === 'maintenance_mode') settings.maintenance_mode = r.value === 'true';
    });
    res.json(settings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.patch('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;
    if (!key) {
      res.status(400).json({ error: 'key is required' });
      return;
    }
    await SystemSetting.findOneAndUpdate(
      { key },
      { value: value === true ? 'true' : 'false', updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
