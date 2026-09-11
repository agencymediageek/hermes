export type Health = { status?: string; version?: string; environment?: string; [key: string]: unknown };
export type Approval = { id: string; projectId?: string; action: string; reason?: string; status: string; requester?: string; expiresAt?: string; createdAt?: string; updatedAt?: string; capabilities?: string[] };
export type Document = { id: string; title: string; source?: string; status: string; version?: string; updatedAt?: string; citations?: string[] };
export type Run = { id: string; goal: string; state: string; stage?: string; risk?: string; updatedAt?: string };
export type Audit = { id: string; type: string; actor: string; actorId?: string; occurredAt: string; project?: string; projectId?: string };

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
function list<T>(value: T[] | { items?: T[]; data?: T[]; hits?: T[] } | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items || value?.data || value?.hits || [];
}

export const turbohermes = {
  health: () => request<Health>('/health'),
  approvals: async () => list(await request<Approval[] | { items?: Approval[] }>('/v1/credentials/requests')),
  documents: async () => list(await request<Document[] | { items?: Document[] }>('/v1/knowledge')),
  runs: async () => list(await request<Run[] | { items?: Run[] }>('/v1/orchestrator/runs')),
  audit: async () => list(await request<Audit[] | { items?: Audit[] }>('/v1/audit')).map((item: any) => ({ ...item, actor: item.actor || item.actorId || 'unknown', project: item.project || item.projectId })),
  search: (query: string) => request<Document[] | { items?: Document[]; hits?: Document[] }>('/v1/knowledge/search', { method: 'POST', body: JSON.stringify({ query }) }).then(list),
  approve: (id: string, payload?: { executorId: string; credentialIds: string[]; ttlMs: number; action?: string; projectId?: string }) => request(`/v1/credentials/requests/${encodeURIComponent(id)}/approve`, { method: 'POST', body: JSON.stringify(payload || {}) }),
  reject: (id: string, projectId?: string) => request(`/v1/credentials/requests/${encodeURIComponent(id)}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Rejected', ...(projectId ? { projectId } : {}) }) }),
  createRun: (goal: string) => request<Run>('/v1/orchestrator/runs', { method: 'POST', body: JSON.stringify({ goal }) }),
};