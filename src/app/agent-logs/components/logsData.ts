export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogActionType =
  | 'file_write'
  | 'file_read'
  | 'command_exec'
  | 'commit'
  | 'install_deps'
  | 'build'
  | 'test_run'
  | 'system'
  | 'deploy'
  | 'approval';

export interface GlobalAgentLog {
  id: string;
  level: LogLevel;
  type: LogActionType;
  workspaceId: string;
  workspaceName: string;
  message: string;
  detail?: string;
  timestamp: string;
  date: string;
  durationMs?: number;
}

export const globalAgentLogs: GlobalAgentLog[] = [];