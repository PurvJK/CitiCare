import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    let department_name = null;
    if (user.department_id) {
      const dept = await Department.findById(user.department_id).select('name').lean();
      department_name = dept?.name ?? null;
    }
    res.json({
      id: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      department_id: user.department_id?.toString() ?? null,
      department_name,
      notification_email: user.notification_email ?? false,
      notification_push: user.notification_push ?? false,
      notification_status_updates: user.notification_status_updates ?? false,
      notification_comments: user.notification_comments ?? false,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { full_name, phone, notification_email, notification_push, notification_status_updates, notification_comments } = req.body;
    const update: Record<string, unknown> = {};
    if (full_name !== undefined) update.full_name = full_name;
    if (phone !== undefined) update.phone = phone;
    if (notification_email !== undefined) update.notification_email = notification_email;
    if (notification_push !== undefined) update.notification_push = notification_push;
    if (notification_status_updates !== undefined) update.notification_status_updates = notification_status_updates;
    if (notification_comments !== undefined) update.notification_comments = notification_comments;
    await User.findByIdAndUpdate(req.user!.id, update);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/avatar', upload.single('avatar'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const avatarUrl = `${baseUrl}/uploads/${file.filename}`;
    await User.findByIdAndUpdate(req.user!.id, { avatar_url: avatarUrl });
    res.json({ avatar_url: avatarUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

router.post('/change-password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
