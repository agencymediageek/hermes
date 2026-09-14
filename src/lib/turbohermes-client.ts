export type Health = { status?: string; version?: string; environment?: string; [key: string]: unknown };
export type Approval = { id: string; projectId?: string; action: string; reason?: string; status: string; requester?: string; expiresAt?: string; createdAt?: string; updatedAt?: string; capabilities?: string[] };
export type Document = { id: string; title: string; source?: string; status: string; version?: string; updatedAt?: string; citations?: string[] };
export type Run = { id: string; goal: string; state: string; stage?: string; risk?: string; updatedAt?: string };
export type Audit = { id: string; type: string; actor: string; actorId?: string; occurredAt: string; project?: string; projectId?: string };
export type ChatMode = 'normal' | 'plan' | 'execute' | 'advanced_execute';
export type ChatSession = {
  id: string;
  mode: ChatMode;
  status: 'active' | 'paused';
  projectTitle: string;
  lifecycleStage: 'plan' | 'refine' | 'execute' | string;
  planReference?: string;
  createdAt: string;
  updatedAt: string;
};
export type ChatLocator = Record<string, unknown>;
export type ChatCitation = {
  id: string;
  documentId: string;
  chunkId: string;
  title: string;
  sourceId: string;
  version: number;
  locator: ChatLocator;
  sourceUri?: string | null;
};
export type ChatMessage = { id: string; sessionId: string; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string; citations?: ChatCitation[] };
export type ChatEvent = {
  type: 'start' | 'token' | 'citation' | 'citations' | 'terminal' | 'error';
  text?: string;
  citations?: ChatCitation[];
  citation?: ChatCitation;
  reason?: string;
  code?: string;
  message?: string;
  [key: string]: unknown;
};
export class ChatStreamError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ChatStreamError';
    this.code = code;
  }
}

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
async function streamRequest(path: string, body: unknown, signal: AbortSignal | undefined, onEvent: (event: ChatEvent) => void) {
  const response = await fetch(`${base}${path}`, {
    method: 'POST', body: JSON.stringify(body), signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
  });
  if (!response.ok) throw new Error(`TurboHermes stream failed (${response.status})`);
  if (!response.body) throw new Error('TurboHermes returned an empty stream');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const data = frame.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
        if (!data || data === '[DONE]') continue;
        const eventName = frame.split(/\r?\n/).find((line) => line.startsWith('event:'))?.slice(6).trim();
        let event: ChatEvent;
        try {
          const parsed = JSON.parse(data) as Partial<ChatEvent> | ChatCitation[] | ChatCitation;
          if (Array.isArray(parsed)) {
            event = { type: 'citations', citations: parsed as ChatCitation[] };
          } else {
            const payload = parsed as Partial<ChatEvent>;
            const inferredType = payload.type || (eventName as ChatEvent['type']) || 'token';
            const directCitation = 'documentId' in payload ? [payload as unknown as ChatCitation] : undefined;
            const citations = payload.citations || (payload.citation ? [payload.citation] : directCitation);
            event = { ...payload, type: inferredType, ...(citations ? { citations } : {}) } as ChatEvent;
          }
        } catch {
          if (eventName === 'token') onEvent({ type: 'token', text: data });
          else throw new ChatStreamError('INVALID_STREAM_EVENT', 'The control plane returned an invalid stream error');
          continue;
        }
        if (event.type === 'error') {
          const code = event.code || 'STREAM_ERROR';
          throw new ChatStreamError(code, event.message || event.reason || 'The control plane rejected the request');
        }
        onEvent(event);
      }
      if (done) break;
    }
  } finally { reader.releaseLock(); }
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
  chatSessions: async () => list(await request<ChatSession[] | { items?: ChatSession[]; data?: ChatSession[] }>('/v1/chat/sessions')),
  createChatSession: (mode: ChatMode, projectTitle: string) => request<ChatSession>('/v1/chat/sessions', { method: 'POST', body: JSON.stringify({ mode, projectTitle }) }),
  chatSession: (id: string) => request<ChatSession>(`/v1/chat/sessions/${encodeURIComponent(id)}`),
  renameChatSession: (id: string, projectTitle: string) => request<ChatSession>(`/v1/chat/sessions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ projectTitle }) }),
  chatMessages: async (id: string) => list(await request<ChatMessage[] | { items?: ChatMessage[]; data?: ChatMessage[] }>(`/v1/chat/sessions/${encodeURIComponent(id)}/messages`)),
  changeChatMode: (id: string, to: 'normal' | 'plan', correlationId: string) => request<ChatSession>(`/v1/chat/sessions/${encodeURIComponent(id)}/mode`, { method: 'POST', body: JSON.stringify({ to, correlationId }) }),
  streamChat: (id: string, payload: { content: string; idempotencyKey: string; correlationId: string }, signal: AbortSignal | undefined, onEvent: (event: ChatEvent) => void) => streamRequest(`/v1/chat/sessions/${encodeURIComponent(id)}/stream`, payload, signal, onEvent),
};