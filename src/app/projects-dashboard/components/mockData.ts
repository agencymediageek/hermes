export type WorkspaceStatus = 'running' | 'provisioning' | 'suspended' | 'destroyed' | 'building';

export interface Workspace {
  id: string;
  name: string;
  repo: string;
  branch: string;
  status: WorkspaceStatus;
  cpu: number;
  ram: number;
  disk: number;
  previewUrl: string;
  lastAgentAction: string;
  lastActionTime: string;
  uptime: string;
  owner: string;
  nodeVersion: string;
  containerImage: string;
}

export interface AgentAction {
  id: string;
  workspaceId: string;
  workspaceName: string;
  type: 'file_write' | 'file_read' | 'command_exec' | 'commit' | 'branch_create' | 'install_deps' | 'build' | 'test_run';
  description: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
  duration?: string;
}

export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  workspaceName: string;
  type: 'merge_to_main' | 'deploy_prod' | 'dns_change' | 'db_migration' | 'delete_resource';
  description: string;
  requestedBy: string;
  requestedAt: string;
  branch?: string;
  targetEnv?: string;
}

export const workspaces: Workspace[] = [
  {
    id: 'ws-001',
    name: 'hermes-api',
    repo: 'hermesdev/hermes-api',
    branch: 'feat/agent-executor',
    status: 'running',
    cpu: 42,
    ram: 61,
    disk: 18,
    previewUrl: 'hermes-api-ws001.tunnel.hermesdev.io',
    lastAgentAction: 'Wrote src/agent/executor.ts',
    lastActionTime: '3m ago',
    uptime: '4h 22m',
    owner: 'Rafael Lima',
    nodeVersion: '20.11.0',
    containerImage: 'hermes/node20-base:1.4',
  },
  {
    id: 'ws-002',
    name: 'hermes-panel',
    repo: 'hermesdev/hermes-panel',
    branch: 'feat/workspace-editor',
    status: 'running',
    cpu: 78,
    ram: 84,
    disk: 31,
    previewUrl: 'hermes-panel-ws002.tunnel.hermesdev.io',
    lastAgentAction: 'Ran: npm run build',
    lastActionTime: '1m ago',
    uptime: '2h 07m',
    owner: 'Camila Sousa',
    nodeVersion: '20.11.0',
    containerImage: 'hermes/node20-base:1.4',
  },
  {
    id: 'ws-003',
    name: 'n8n-workflows',
    repo: 'hermesdev/n8n-workflows',
    branch: 'fix/webhook-retry',
    status: 'building',
    cpu: 91,
    ram: 73,
    disk: 12,
    previewUrl: 'n8n-ws003.tunnel.hermesdev.io',
    lastAgentAction: 'Installing: axios@1.7.2',
    lastActionTime: '30s ago',
    uptime: '0h 44m',
    owner: 'Rafael Lima',
    nodeVersion: '18.20.2',
    containerImage: 'hermes/node18-base:1.2',
  },
  {
    id: 'ws-004',
    name: 'cloudflare-workers',
    repo: 'hermesdev/cf-workers',
    branch: 'main',
    status: 'suspended',
    cpu: 0,
    ram: 0,
    disk: 8,
    previewUrl: '—',
    lastAgentAction: 'Committed: fix rate limiter',
    lastActionTime: '2h ago',
    uptime: '—',
    owner: 'Camila Sousa',
    nodeVersion: '20.11.0',
    containerImage: 'hermes/node20-base:1.4',
  },
  {
    id: 'ws-005',
    name: 'postgres-migrations',
    repo: 'hermesdev/db-migrations',
    branch: 'feat/workspace-schema',
    status: 'running',
    cpu: 14,
    ram: 38,
    disk: 5,
    previewUrl: '—',
    lastAgentAction: 'Ran: npm test',
    lastActionTime: '18m ago',
    uptime: '1h 53m',
    owner: 'Rafael Lima',
    nodeVersion: '20.11.0',
    containerImage: 'hermes/node20-pg:1.1',
  },
  {
    id: 'ws-006',
    name: 'openrouter-proxy',
    repo: 'hermesdev/openrouter-proxy',
    branch: 'fix/token-streaming',
    status: 'provisioning',
    cpu: 3,
    ram: 12,
    disk: 2,
    previewUrl: 'or-proxy-ws006.tunnel.hermesdev.io',
    lastAgentAction: 'Cloning repository…',
    lastActionTime: '1m ago',
    uptime: '0h 01m',
    owner: 'Camila Sousa',
    nodeVersion: '20.11.0',
    containerImage: 'hermes/node20-base:1.4',
  },
  {
    id: 'ws-007',
    name: 'redis-queue-svc',
    repo: 'hermesdev/redis-queue-svc',
    branch: 'main',
    status: 'destroyed',
    cpu: 0,
    ram: 0,
    disk: 0,
    previewUrl: '—',
    lastAgentAction: 'Workspace destroyed by Rafael',
    lastActionTime: '5h ago',
    uptime: '—',
    owner: 'Rafael Lima',
    nodeVersion: '18.20.2',
    containerImage: '—',
  },
];

export const agentActions: AgentAction[] = [
  {
    id: 'act-001',
    workspaceId: 'ws-001',
    workspaceName: 'hermes-api',
    type: 'file_write',
    description: 'Wrote src/agent/executor.ts — added Docker exec handler',
    status: 'success',
    timestamp: '00:33:41',
    duration: '0.3s',
  },
  {
    id: 'act-002',
    workspaceId: 'ws-002',
    workspaceName: 'hermes-panel',
    type: 'build',
    description: 'Ran: npm run build — Next.js production build',
    status: 'running',
    timestamp: '00:35:02',
    duration: undefined,
  },
  {
    id: 'act-003',
    workspaceId: 'ws-003',
    workspaceName: 'n8n-workflows',
    type: 'install_deps',
    description: 'Installing axios@1.7.2, ws@8.17.1',
    status: 'running',
    timestamp: '00:35:30',
    duration: undefined,
  },
  {
    id: 'act-004',
    workspaceId: 'ws-001',
    workspaceName: 'hermes-api',
    type: 'file_read',
    description: 'Read src/routes/workspaces.ts for context',
    status: 'success',
    timestamp: '00:33:38',
    duration: '0.1s',
  },
  {
    id: 'act-005',
    workspaceId: 'ws-005',
    workspaceName: 'postgres-migrations',
    type: 'test_run',
    description: 'Ran test suite — 47 passed, 2 skipped',
    status: 'success',
    timestamp: '00:17:55',
    duration: '12.4s',
  },
  {
    id: 'act-006',
    workspaceId: 'ws-002',
    workspaceName: 'hermes-panel',
    type: 'command_exec',
    description: 'Executed: npx tsc --noEmit — type check',
    status: 'failed',
    timestamp: '00:34:51',
    duration: '4.1s',
  },
  {
    id: 'act-007',
    workspaceId: 'ws-001',
    workspaceName: 'hermes-api',
    type: 'commit',
    description: 'Committed: feat(agent): add Docker exec handler',
    status: 'success',
    timestamp: '00:33:55',
    duration: '0.8s',
  },
  {
    id: 'act-008',
    workspaceId: 'ws-006',
    workspaceName: 'openrouter-proxy',
    type: 'command_exec',
    description: 'Cloning hermesdev/openrouter-proxy from GitHub',
    status: 'running',
    timestamp: '00:35:01',
    duration: undefined,
  },
];

export const approvalRequests: ApprovalRequest[] = [
  {
    id: 'apr-001',
    workspaceId: 'ws-001',
    workspaceName: 'hermes-api',
    type: 'merge_to_main',
    description: 'Merge feat/agent-executor into main — 12 commits, +847 −203 lines',
    requestedBy: 'Hermes Agent',
    requestedAt: '00:33:58',
    branch: 'feat/agent-executor',
    targetEnv: undefined,
  },
  {
    id: 'apr-002',
    workspaceId: 'ws-005',
    workspaceName: 'postgres-migrations',
    type: 'db_migration',
    description: 'Run migration 0024_workspace_schema.sql on prod PostgreSQL',
    requestedBy: 'Rafael Lima',
    requestedAt: '00:19:22',
    branch: undefined,
    targetEnv: 'production',
  },
];

export const cpuRamHistory = [
  { time: '00:00', cpu: 28, ram: 44 },
  { time: '00:05', cpu: 35, ram: 47 },
  { time: '00:10', cpu: 41, ram: 52 },
  { time: '00:15', cpu: 38, ram: 55 },
  { time: '00:20', cpu: 55, ram: 58 },
  { time: '00:25', cpu: 62, ram: 63 },
  { time: '00:30', cpu: 71, ram: 68 },
  { time: '00:35', cpu: 84, ram: 72 },
];

export const buildDurations = [
  { name: 'hermes-api', duration: 38 },
  { name: 'hermes-panel', duration: 94 },
  { name: 'n8n-workflows', duration: 22 },
  { name: 'postgres-migrations', duration: 14 },
  { name: 'openrouter-proxy', duration: 11 },
];