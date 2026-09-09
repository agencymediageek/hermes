export const workspaceInfo = {
  id: 'primary',
  name: 'Hermes Workspace',
  repo: 'agencymediageek/hermes-control-plane',
  branch: 'main',
  status: 'running' as const,
  cpu: 0,
  ram: 0,
  disk: 0,
  previewUrl: 'hermes-workspace-tfbu.srv1967958.hstgr.cloud',
  uptime: '—',
  nodeVersion: '—',
  containerImage: 'ghcr.io/outsourc-e/hermes-workspace:latest',
  containerId: '—',
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

export const initialMessages: ChatMessage[] = [];

export interface EnvSecret {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  lastUpdated: string;
}

export const envSecrets: EnvSecret[] = [];

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

export const commitHistory: CommitEntry[] = [];

export interface AgentLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  type: 'file_write' | 'file_read' | 'command_exec' | 'commit' | 'install_deps' | 'build' | 'test_run' | 'system';
  message: string;
  detail?: string;
  timestamp: string;
  durationMs?: number;
}

export const agentLogs: AgentLog[] = [];

export const OPENROUTER_MODELS = [
  { id: 'model-hermes', value: 'hermes-agent', label: 'Hermes Agent' },
];