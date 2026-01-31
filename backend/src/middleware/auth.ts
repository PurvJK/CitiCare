import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import type { AppRole } from '../models/User.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: AppRole;
    full_name: string;
    department_id: string | null;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-in-production');

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!JWT_SECRET) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId).select('_id email full_name role department_id');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      department_id: (user as any).department_id?.toString() ?? null,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: AppRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
