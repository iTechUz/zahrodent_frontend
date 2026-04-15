import { clearAuthStorage, getAuthToken } from './auth-token';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestOptions = RequestInit & { skipAuth?: boolean };

function clearSessionStorage() {
  clearAuthStorage();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith('http') ? path : `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : null;

  if (!res.ok) {
    const raw = data?.message;
    const msg =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw.join('; ')
          : res.statusText || 'Request failed';
    if (res.status === 401) {
      clearSessionStorage();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

export { baseUrl as apiBaseUrl };
