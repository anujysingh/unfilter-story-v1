import { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../lib/config.js';
import { apiFetch, getToken, setToken, clearToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, validate any stored token by fetching the current user.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/cms/v1/auth/me');
        if (res.ok && active) setUser(await res.json());
      } catch {
        // apiFetch clears the token on 401; nothing more to do here.
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // Login uses a raw fetch (not apiFetch) so a 401 surfaces as a "bad
  // credentials" message instead of triggering the redirect interceptor.
  async function login(email, password) {
    const res = await fetch(`${API_URL}/cms/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearToken();
    setUser(null);
    window.location.assign('/login');
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
