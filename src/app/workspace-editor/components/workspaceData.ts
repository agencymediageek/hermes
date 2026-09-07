export const workspaceInfo = {
  id: 'ws-001',
  name: 'hermes-api',
  repo: 'hermesdev/hermes-api',
  branch: 'feat/agent-executor',
  status: 'running' as const,
  cpu: 42,
  ram: 61,
  disk: 18,
  previewUrl: 'hermes-api-ws001.tunnel.hermesdev.io',
  uptime: '4h 22m',
  nodeVersion: '20.11.0',
  containerImage: 'hermes/node20-base:1.4',
  containerId: 'd8f3a91c2b44',
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  model?: string;
  actions?: string[];
  isStreaming?: boolean;
}

export const initialMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'agent',
    content: 'Workspace hermes-api is ready. I have read-write access to the file system and can execute commands in the container. How can I help you?',
    timestamp: '00:11:02',
    model: 'claude-3.5-sonnet',
  },
  {
    id: 'msg-002',
    role: 'user',
    content: 'Add a Docker exec handler to the agent executor. It should accept a workspaceId, command string, and timeout parameter.',
    timestamp: '00:33:15',
  },
  {
    id: 'msg-003',
    role: 'agent',
    content: "I'll implement the Docker exec handler in `src/agent/executor.ts`. Reading the existing file structure first…",
    timestamp: '00:33:17',
    model: 'claude-3.5-sonnet',
    actions: ['READ src/agent/executor.ts', 'READ src/routes/workspaces.ts'],
  },
  {
    id: 'msg-004',
    role: 'agent',
    content: "Done. I've added the `dockerExec` handler with:\n- `workspaceId` → container lookup via Redis\n- `command` → sanitized and executed via `docker exec -i`\n- `timeout` → defaults to 30s, kills process on breach\n\nAlso added type exports and updated the route handler. Committed as `feat(agent): add Docker exec handler`.",
    timestamp: '00:33:55',
    model: 'claude-3.5-sonnet',
    actions: ['WRITE src/agent/executor.ts', 'WRITE src/routes/workspaces.ts', 'COMMIT feat(agent): add Docker exec handler'],
  },
];

export interface EnvSecret {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  lastUpdated: string;
}

export const envSecrets: EnvSecret[] = [
  { id: 'env-001', key: 'DATABASE_URL', value: 'postgresql://hermes:***@localhost:5432/hermes_dev', isSecret: true, lastUpdated: '2026-08-28' },
  { id: 'env-002', key: 'REDIS_URL', value: 'redis://localhost:6379', isSecret: false, lastUpdated: '2026-08-28' },
  { id: 'env-003', key: 'OPENROUTER_API_KEY', value: 'sk-or-***************************', isSecret: true, lastUpdated: '2026-09-01' },
  { id: 'env-004', key: 'GITHUB_TOKEN', value: 'ghp_***************************', isSecret: true, lastUpdated: '2026-09-01' },
  { id: 'env-005', key: 'NODE_ENV', value: 'development', isSecret: false, lastUpdated: '2026-08-28' },
  { id: 'env-006', key: 'PORT', value: '3001', isSecret: false, lastUpdated: '2026-08-28' },
  { id: 'env-007', key: 'CF_TUNNEL_TOKEN', value: 'eyJ***************************', isSecret: true, lastUpdated: '2026-09-03' },
];

export interface CommitEntry {
  id: string;
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  additions: number;
  deletions: number;
}

export const commitHistory: CommitEntry[] = [
  { id: 'cmt-001', sha: 'd4f8a91', message: 'feat(agent): add Docker exec handler', author: 'Hermes Agent', timestamp: '00:33:55', branch: 'feat/agent-executor', additions: 84, deletions: 3 },
  { id: 'cmt-002', sha: 'c2e71b3', message: 'refactor: extract container resolver to util', author: 'Rafael Lima', timestamp: 'yesterday 18:42', branch: 'feat/agent-executor', additions: 41, deletions: 38 },
  { id: 'cmt-003', sha: 'a9d05f2', message: 'fix: handle exec timeout correctly on SIGKILL', author: 'Hermes Agent', timestamp: 'yesterday 17:11', branch: 'feat/agent-executor', additions: 12, deletions: 7 },
  { id: 'cmt-004', sha: '87bc4e1', message: 'feat: add workspace status endpoint', author: 'Rafael Lima', timestamp: 'yesterday 15:30', branch: 'feat/agent-executor', additions: 63, deletions: 0 },
  {id: 'cmt-005', sha: '3fa12d8', message: 'chore: update node base image to 20.11.0', author: 'Rafael Lima', timestamp: '2026-09-03 11:05', branch: 'feat/agent-executor', additions: 2, deletions: 2 },
  { id: 'cmt-006', sha: '1bc99e4', message: 'feat: init workspace scaffold', author: 'Rafael Lima', timestamp: '2026-09-02 09:18', branch: 'feat/agent-executor', additions: 210, deletions: 0 },
];

export interface AgentLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  type: 'file_write' | 'file_read' | 'command_exec' | 'commit' | 'install_deps' | 'build' | 'test_run' | 'system';
  message: string;
  detail?: string;
  timestamp: string;
  durationMs?: number;
}

export const agentLogs: AgentLog[] = [
  { id: 'log-001', level: 'info', type: 'system', message: 'Agent session started', detail: 'Model: claude-3.5-sonnet via OpenRouter', timestamp: '00:11:02', durationMs: undefined },
  { id: 'log-002', level: 'info', type: 'file_read', message: 'READ src/agent/executor.ts', detail: '312 bytes read', timestamp: '00:33:17', durationMs: 48 },
  { id: 'log-003', level: 'info', type: 'file_read', message: 'READ src/routes/workspaces.ts', detail: '841 bytes read', timestamp: '00:33:19', durationMs: 52 },
  { id: 'log-004', level: 'info', type: 'file_write', message: 'WRITE src/agent/executor.ts', detail: '+84 lines, -3 lines', timestamp: '00:33:41', durationMs: 310 },
  { id: 'log-005', level: 'info', type: 'file_write', message: 'WRITE src/routes/workspaces.ts', detail: '+12 lines, -1 line', timestamp: '00:33:43', durationMs: 180 },
  { id: 'log-006', level: 'info', type: 'command_exec', message: 'EXEC: npx tsc --noEmit', detail: 'Exit 0 — no type errors', timestamp: '00:33:47', durationMs: 4100 },
  { id: 'log-007', level: 'info', type: 'commit', message: 'COMMIT: feat(agent): add Docker exec handler', detail: 'SHA d4f8a91 on feat/agent-executor', timestamp: '00:33:55', durationMs: 820 },
  { id: 'log-008', level: 'warn', type: 'system', message: 'RAM usage at 61% — approaching container limit', detail: 'Container limit: 8 GB. Current: 4.9 GB', timestamp: '00:34:10', durationMs: undefined },
  { id: 'log-009', level: 'error', type: 'command_exec', message: 'EXEC: npx tsc --noEmit (type check re-run)', detail: 'Exit 1 — 2 type errors in src/agent/types.ts', timestamp: '00:34:51', durationMs: 4050 },
  { id: 'log-010', level: 'info', type: 'file_write', message: 'WRITE src/agent/types.ts', detail: 'Fix: added missing DockerExecOptions export', timestamp: '00:35:10', durationMs: 140 },
];

export const OPENROUTER_MODELS = [
  { id: 'model-claude35', value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'model-claude3', value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
  { id: 'model-gpt4o', value: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'model-gpt4t', value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'model-gemini', value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
  { id: 'model-deepseek', value: 'deepseek/deepseek-coder', label: 'DeepSeek Coder' },
];