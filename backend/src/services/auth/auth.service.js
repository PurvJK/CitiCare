import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-change-in-production');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('[auth] JWT_SECRET not set in .env; using dev default. Set JWT_SECRET in backend/.env for production.');
}
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in backend/.env');
}

function issueToken(user) {
  return jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.full_name,
    role: user.role,
    department_id: user.department_id?.toString() ?? null,
    ward_id: user.ward_id?.toString() ?? null,
    address_line: user.address_line ?? null,
    zone_id: user.zone_id?.toString() ?? null,
    phone: user.phone ?? null,
    avatar_url: user.avatar_url ?? null,
  };
}

export async function registerUser({ email, password, full_name }) {
  if (!email || !password || !full_name) {
    return { error: { status: 400, message: 'Email, password and full_name are required' } };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { error: { status: 400, message: 'Email already registered' } };
  }

  const user = await User.create({ email, password, full_name, role: 'citizen' });
  const token = issueToken(user);
  return { data: { token, user: toPublicUser(user) } };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    return { error: { status: 400, message: 'Email and password are required' } };
  }

  console.log('[auth] Attempting login for email:', email);
  const user = await User.findOne({ email }).select('+password');
  console.log('[auth] User found:', !!user);
  
  if (!user) {
    console.log('[auth] No user found with email:', email);
    return { error: { status: 401, message: 'Invalid email or password' } };
  }

  const passwordMatch = await user.comparePassword(password);
  console.log('[auth] Password match result:', passwordMatch);
  
  if (!passwordMatch) {
    console.log('[auth] Password mismatch for user:', email);
    return { error: { status: 401, message: 'Invalid email or password' } };
  }

  const token = issueToken(user);
  return { data: { token, user: toPublicUser(user) } };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    return { error: { status: 404, message: 'User not found' } };
  }
  return { data: toPublicUser(user) };
}
