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

export const workspaces: Workspace[] = [];
export const agentActions: AgentAction[] = [];
export const approvalRequests: ApprovalRequest[] = [];
export const cpuRamHistory: Array<{ time: string; cpu: number; ram: number }> = [];
export const buildDurations: Array<{ name: string; duration: number }> = [];