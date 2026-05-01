import { clearAuthStorage, getAuthToken } from './auth-token';
import { useStore } from '@/store/useStore';

let baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
if (baseUrl && !baseUrl.startsWith('http')) {
  baseUrl = `https://${baseUrl}`;
}

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
    
    // SaaS Multi-tenancy: Inject selected branch ID for SuperAdmin
    // We use the store to get the currently selected branch
    try {
      const activeBranchId = useStore.getState().activeBranchId;
      if (activeBranchId) {
        headers.set('x-branch-id', activeBranchId);
      }
    } catch (e) {
      // In some environments useStore might not be initialized yet
    }
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      if (res.ok) {
        throw new ApiError(res.status, 'Invalid JSON response');
      }
      data = { message: text } as Record<string, unknown>;
    }
  }

  if (!res.ok) {
    const raw = (data as Record<string, unknown> | null | undefined)?.message;
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
