import type { AuthTokens, RegisterRequest, LoginRequest, CapacityConfig, UpdateCapacityRequest, Rate, CreateRateRequest } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem('pf_tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const tokens = getTokens();
    if (tokens) headers['Authorization'] = `Bearer ${tokens.access_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authService = {
  register: (data: RegisterRequest) =>
    request<AuthTokens>('/auth/register', { method: 'POST', body: JSON.stringify(data) }, false),

  login: (data: LoginRequest) =>
    request<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify(data) }, false),

  refresh: (refresh_token: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }, false),
};

// ── Capacity (US-004) ─────────────────────────────────────────────────
export const capacityService = {
  getAll: () => request<CapacityConfig[]>('/parking/capacity'),

  update: (data: UpdateCapacityRequest) =>
    request<CapacityConfig>('/parking/capacity', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Rates (US-005) ───────────────────────────────────────────────────
export const rateService = {
  getAll: () => request<Rate[]>('/parking/rates'),

  create: (data: CreateRateRequest) =>
    request<Rate>('/parking/rates', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<CreateRateRequest>) =>
    request<Rate>(`/parking/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deactivate: (id: number) =>
    request<void>(`/parking/rates/${id}/deactivate`, { method: 'PATCH' }),
};