import { getCurrentUser, loginUser, registerUser } from '../services/auth/auth.service.js';

export async function register(req, res) {
  try {
    const result = await registerUser(req.body || {});
    if (result.error) {
      res.status(result.error.status).json({ error: result.error.message });
      return;
    }
    res.status(201).json(result.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body || {});
    if (result.error) {
      res.status(result.error.status).json({ error: result.error.message });
      return;
    }
    res.json(result.data);
  } catch (e) {
    console.error('[auth-controller] Login exception:', e);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const result = await getCurrentUser(req.user.id);
    if (result.error) {
      res.status(result.error.status).json({ error: result.error.message });
      return;
    }
    res.json(result.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
