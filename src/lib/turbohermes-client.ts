export type Health = { status?: string; version?: string; environment?: string; [key: string]: unknown };
export type Approval = { id: string; action: string; reason?: string; status: string; expiresAt?: string; capabilities?: string[] };
export type Document = { id: string; title: string; source?: string; status: string; version?: string; updatedAt?: string; citations?: string[] };
export type Run = { id: string; goal: string; state: string; stage?: string; risk?: string; updatedAt?: string };
export type Audit = { id: string; type: string; actor: string; occurredAt: string; project?: string };

const base = `${(process.env.NEXT_PUBLIC_API_URL || 'https://api.hermes.waas.host').replace(/\/$/, '')}/api/turbohermes`;
function token() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('hermes_admin_token') || sessionStorage.getItem('hermes_admin_token') || '';
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error(`TurboHermes request failed (${response.status})`);
  return response.status === 204 ? ({} as T) : response.json();
}
function list<T>(value: T[] | { items?: T[]; data?: T[] } | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items || value?.data || [];
}

export const turbohermes = {
  health: () => request<Health>('/health'),
  approvals: async () => list(await request<Approval[] | { items?: Approval[] }>('/v1/credentials/requests')),
  documents: async () => list(await request<Document[] | { items?: Document[] }>('/v1/knowledge')),
  runs: async () => list(await request<Run[] | { items?: Run[] }>('/v1/orchestrator/runs')),
  audit: async () => list(await request<Audit[] | { items?: Audit[] }>('/v1/audit')),
  search: (query: string) => request<Document[] | { items?: Document[] }>('/v1/knowledge/search', { method: 'POST', body: JSON.stringify({ query }) }).then(list),
  approve: (id: string) => request(`/v1/credentials/requests/${encodeURIComponent(id)}/approve`, { method: 'POST' }),
  reject: (id: string) => request(`/v1/credentials/requests/${encodeURIComponent(id)}/reject`, { method: 'POST' }),
  createRun: (goal: string) => request<Run>('/v1/orchestrator/runs', { method: 'POST', body: JSON.stringify({ goal }) }),
};