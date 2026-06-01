// Authenticated API client for the admin SPA.
//
// Wraps fetch to (1) prefix the backend base URL, (2) attach the Bearer token,
// and (3) handle expired/invalid sessions by clearing the token and bouncing
// the user to /login. Use apiFetch() for every backend call.
import { API_URL } from './config.js';

const TOKEN_KEY = 'unfilter_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Fetch a backend path with auth applied.
 * @param {string} path  Path beginning with "/" (e.g. "/cms/v1/articles").
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Session is gone or invalid — drop it and force re-login.
    clearToken();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    throw new Error('Unauthorized');
  }

  return res;
}
