import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('_id email full_name phone avatar_url department_id role createdAt').sort({ createdAt: -1 }).lean();
    const departments = await Department.find().select('_id name').lean();
    const deptMap = new Map(departments.map((d: any) => [d._id.toString(), d.name]));
    const list = users.map((p: any) => ({
      id: p._id.toString(),
      email: p.email,
      full_name: p.full_name,
      phone: p.phone,
      avatar_url: p.avatar_url,
      department_id: p.department_id?.toString() ?? null,
      department_name: p.department_id ? deptMap.get(p.department_id.toString()) ?? null : null,
      role: p.role || 'citizen',
      created_at: p.createdAt ?? p.created_at,
    }));
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, role, departmentId } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, password and fullName are required' });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    const user = await User.create({
      email,
      password,
      full_name: fullName,
      phone: phone || null,
      role: role || 'citizen',
      department_id: departmentId && mongoose.Types.ObjectId.isValid(departmentId) ? new mongoose.Types.ObjectId(departmentId) : null,
    });
    res.status(201).json({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:userId/role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['admin', 'department_head', 'officer', 'citizen'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.patch('/:userId/department', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.body;
    const id = departmentId && mongoose.Types.ObjectId.isValid(departmentId) ? new mongoose.Types.ObjectId(departmentId) : null;
    const user = await User.findByIdAndUpdate(req.params.userId, { department_id: id }, { new: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.delete('/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.userId);
    if (!deleted) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
