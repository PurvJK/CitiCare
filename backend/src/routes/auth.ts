import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-in-production');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('[auth] JWT_SECRET not set in .env; using dev default. Set JWT_SECRET in backend/.env for production.');
}
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in backend/.env');
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password and full_name are required' });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    const user = await User.create({ email, password, full_name, role: 'citizen' });
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.full_name,
        role: user.role,
        department_id: user.department_id?.toString() ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.full_name,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      department_id: user.department_id?.toString() ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
