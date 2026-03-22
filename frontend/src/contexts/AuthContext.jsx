import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken, clearAuthToken } from '@/lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    setAuthToken(token);
    setSession({ access_token: token });
    api
      .get('/auth/me')
      .then((res) => {
        const d = res.data;
        setUser({
          id: d.id,
          name: d.name || 'User',
          email: d.email,
          role: d.role || 'citizen',
          department_id: d.department_id ?? null,
          zone_id: d.zone_id ?? null,
          ward_id: d.ward_id ?? null,
          address_line: d.address_line ?? null,
        });
      })
      .catch(() => {
        clearAuthToken();
        setSession(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setSession({ access_token: token });
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department_id: data.user.department_id ?? null,
        zone_id: data.user.zone_id ?? null,
        ward_id: data.user.ward_id ?? null,
        address_line: data.user.address_line ?? null,
      };
      setUser(userData);
      return { error: null, user: userData };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        return { error: new Error('Cannot reach server. Make sure the backend is running at http://localhost:5000') };
      }
      const msg = err.response?.data?.error || err.message;
      return { error: typeof msg === 'string' ? new Error(msg) : err };
    }
  };

  const logout = async () => {
    clearAuthToken();
    setUser(null);
    setSession(null);
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { full_name: name, email, password });
      const token = data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);
      setSession({ access_token: token });
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        department_id: data.user.department_id ?? null,
        zone_id: data.user.zone_id ?? null,
      });
      return { error: null };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        return { error: new Error('Cannot reach server. Make sure the backend is running at http://localhost:5000') };
      }
      const msg = err.response?.data?.error || err.message;
      return { error: typeof msg === 'string' ? new Error(msg) : err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
