/**
 * Unified HTTP Client for HopeFairy
 * ------------------------------------------------------------------
 * Handles token authentication (Laravel Sanctum), base URL configuration,
 * request abort timeouts, and unified API response envelope unwrapping.
 */

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
    return '';
  }

  // Read directly from .env (NEXT_PUBLIC_API_URL)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Default fallback for local development
  return 'http://127.0.0.1:8000';
}

const TOKEN_KEY = 'hopefairy_admin_token';
const USER_KEY = 'hopefairy_admin_user';

export class ApiError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class HttpClient {
  constructor(baseUrl = null) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl() {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        return 'http://127.0.0.1:8000';
      }
      return '';
    }
    return this.baseUrl || getApiBaseUrl();
  }



  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  setAuth(token, user) {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getCachedUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  async request(endpoint, { method = 'GET', body = null, isAuth = false, timeoutMs = null } = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = {
      Accept: 'application/json',
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (isAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const defaultTimeout = isFormData ? 60000 : 35000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || defaultTimeout);

    const options = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}${endpoint}`, options);
      clearTimeout(timer);

      if (res.status === 401 && isAuth) {
        this.clearAuth();
        const loginPath = `${process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || ''}/login/`;
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith(loginPath)) {
          window.location.assign(loginPath);
        }
        throw new ApiError('Session expired or unauthenticated. Please log in.', 401);
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        const message = data.message || `Request failed with status ${res.status}`;
        throw new ApiError(message, res.status, data.errors || null);
      }

      // If envelope contains data field, unwrap it
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data !== undefined ? data.data : data;
      }

      return data;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError('API server took too long to respond. Please check your backend connection.', 504);
      }
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('NetworkError'))) {
        throw new ApiError('Cannot reach API server. Please check your network or backend connection.', 503);
      }
      throw err;
    }
  }

  get(endpoint, isAuth = false) {
    return this.request(endpoint, { method: 'GET', isAuth });
  }

  post(endpoint, body, isAuth = false) {
    return this.request(endpoint, { method: 'POST', body, isAuth });
  }

  put(endpoint, body, isAuth = false) {
    return this.request(endpoint, { method: 'PUT', body, isAuth });
  }

  patch(endpoint, body = null, isAuth = false) {
    return this.request(endpoint, { method: 'PATCH', body, isAuth });
  }

  delete(endpoint, isAuth = false) {
    return this.request(endpoint, { method: 'DELETE', isAuth });
  }
}

export const httpClient = new HttpClient();
