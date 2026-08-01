// Determine API base URL - support both Vite env vars and runtime detection
function getApiBase(): string {
  // Priority 1: Explicit Vite env var
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Production detection - use hosted backend
  if (typeof window !== 'undefined' && window.location.hostname && !window.location.hostname.includes('localhost')) {
    return 'https://api.developertoolkit.online';
  }

  // Priority 3: Development fallback
  return 'http://localhost:3001';
}

const API_BASE = getApiBase();

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────
  register: (email: string, password: string, name?: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>('/auth/me'),

  updateProfile: (name: string) =>
    request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  // ── History ───────────────────────────────────────────────────────────
  saveHistory: (entry: { toolId: string; toolName: string; input: string; output: string }) =>
    request<HistoryEntry>('/history', { method: 'POST', body: JSON.stringify(entry) }),

  getHistory: (limit?: number) =>
    request<HistoryEntry[]>(`/history${limit ? `?limit=${limit}` : ''}`),

  deleteHistory: (id: string) =>
    request<void>(`/history/${id}`, { method: 'DELETE' }),

  clearHistory: () =>
    request<void>('/history', { method: 'DELETE' }),

  // ── API Keys ──────────────────────────────────────────────────────────
  createApiKey: (label?: string) =>
    request<ApiKeyRecord>('/api-keys', { method: 'POST', body: JSON.stringify({ label }) }),

  listApiKeys: () =>
    request<ApiKeyRecord[]>('/api-keys'),

  deleteApiKey: (id: string) =>
    request<void>(`/api-keys/${id}`, { method: 'DELETE' }),
};

// ── Types ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  key: string;
  label?: string;
  usageCount: number;
  lastUsedAt?: string;
  active: boolean;
  createdAt: string;
}
