import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Log in dev if API URL is wrong (Vite only injects env at build/start - restart dev server after changing .env)
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('[api] VITE_API_URL not set in .env; using fallback:', API_URL);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function clearAuthToken(): void {
  localStorage.removeItem('token');
  setAuthToken(null);
}

// Initialize token from storage on load
const stored = getAuthToken();
if (stored) setAuthToken(stored);
