export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogActionType =
  | 'file_write' |'file_read' |'command_exec' |'commit' |'install_deps' |'build' |'test_run' |'system' |'deploy' |'approval';

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

export const globalAgentLogs: GlobalAgentLog[] = [
  { id: 'gl-001', level: 'info', type: 'system', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'Agent session started', detail: 'Model: claude-3.5-sonnet via OpenRouter', timestamp: '00:11:02', date: '2026-09-05' },
  { id: 'gl-002', level: 'info', type: 'file_read', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'READ src/agent/executor.ts', detail: '312 bytes read', timestamp: '00:33:17', date: '2026-09-05', durationMs: 48 },
  { id: 'gl-003', level: 'info', type: 'file_read', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'READ src/routes/workspaces.ts', detail: '841 bytes read', timestamp: '00:33:19', date: '2026-09-05', durationMs: 52 },
  { id: 'gl-004', level: 'info', type: 'file_write', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'WRITE src/agent/executor.ts', detail: '+84 lines, -3 lines', timestamp: '00:33:41', date: '2026-09-05', durationMs: 310 },
  { id: 'gl-005', level: 'info', type: 'file_write', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'WRITE src/routes/workspaces.ts', detail: '+12 lines, -1 line', timestamp: '00:33:43', date: '2026-09-05', durationMs: 180 },
  { id: 'gl-006', level: 'info', type: 'command_exec', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'EXEC: npx tsc --noEmit', detail: 'Exit 0 — no type errors', timestamp: '00:33:47', date: '2026-09-05', durationMs: 4100 },
  { id: 'gl-007', level: 'info', type: 'commit', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'COMMIT: feat(agent): add Docker exec handler', detail: 'SHA d4f8a91 on feat/agent-executor', timestamp: '00:33:55', date: '2026-09-05', durationMs: 820 },
  { id: 'gl-008', level: 'warn', type: 'system', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'RAM usage at 61% — approaching container limit', detail: 'Container limit: 8 GB. Current: 4.9 GB', timestamp: '00:34:10', date: '2026-09-05' },
  { id: 'gl-009', level: 'error', type: 'command_exec', workspaceId: 'ws-002', workspaceName: 'hermes-panel', message: 'EXEC: npx tsc --noEmit (type check re-run)', detail: 'Exit 1 — 2 type errors in src/agent/types.ts', timestamp: '00:34:51', date: '2026-09-05', durationMs: 4050 },
  { id: 'gl-010', level: 'info', type: 'build', workspaceId: 'ws-002', workspaceName: 'hermes-panel', message: 'BUILD: npm run build — Next.js production build', detail: 'Build started, waiting for completion…', timestamp: '00:35:02', date: '2026-09-05' },
  { id: 'gl-011', level: 'info', type: 'install_deps', workspaceId: 'ws-003', workspaceName: 'n8n-workflows', message: 'INSTALL: axios@1.7.2, ws@8.17.1', detail: 'npm install completed in 8.3s', timestamp: '00:35:30', date: '2026-09-05', durationMs: 8300 },
  { id: 'gl-012', level: 'info', type: 'command_exec', workspaceId: 'ws-006', workspaceName: 'openrouter-proxy', message: 'EXEC: git clone hermesdev/openrouter-proxy', detail: 'Cloning into /workspace/openrouter-proxy…', timestamp: '00:35:01', date: '2026-09-05', durationMs: 2100 },
  { id: 'gl-013', level: 'info', type: 'test_run', workspaceId: 'ws-005', workspaceName: 'postgres-migrations', message: 'TEST: npm test — 47 passed, 2 skipped', detail: 'All critical tests passed', timestamp: '00:17:55', date: '2026-09-05', durationMs: 12400 },
  { id: 'gl-014', level: 'warn', type: 'system', workspaceId: 'ws-002', workspaceName: 'hermes-panel', message: 'CPU spike detected: 78% for 30s', detail: 'Triggered by Next.js build process', timestamp: '00:35:15', date: '2026-09-05' },
  { id: 'gl-015', level: 'info', type: 'approval', workspaceId: 'ws-001', workspaceName: 'hermes-api', message: 'APPROVAL REQUEST: merge feat/agent-executor → main', detail: 'Awaiting review by Rafael Lima', timestamp: '00:36:00', date: '2026-09-05' },
  { id: 'gl-016', level: 'error', type: 'deploy', workspaceId: 'ws-003', workspaceName: 'n8n-workflows', message: 'DEPLOY FAILED: webhook-retry build error', detail: 'TypeError: Cannot read properties of undefined (reading "url")', timestamp: '23:58:11', date: '2026-09-04', durationMs: 3200 },
  { id: 'gl-017', level: 'info', type: 'commit', workspaceId: 'ws-002', workspaceName: 'hermes-panel', message: 'COMMIT: refactor: extract container resolver to util', detail: 'SHA c2e71b3 on feat/workspace-editor', timestamp: '18:42:03', date: '2026-09-04', durationMs: 650 },
  { id: 'gl-018', level: 'info', type: 'system', workspaceId: 'ws-004', workspaceName: 'cloudflare-workers', message: 'Workspace suspended by Rafael Lima', detail: 'Container stopped, disk snapshot saved', timestamp: '17:30:00', date: '2026-09-04' },
  { id: 'gl-019', level: 'warn', type: 'command_exec', workspaceId: 'ws-003', workspaceName: 'n8n-workflows', message: 'EXEC: npm run lint — 3 warnings found', detail: 'no-unused-vars in webhook.handler.ts (2), types.ts (1)', timestamp: '16:10:22', date: '2026-09-04', durationMs: 1800 },
  { id: 'gl-020', level: 'info', type: 'file_write', workspaceId: 'ws-005', workspaceName: 'postgres-migrations', message: 'WRITE migrations/0012_workspace_schema.sql', detail: '+47 lines — adds workspaces, containers tables', timestamp: '14:05:33', date: '2026-09-04', durationMs: 220 },
];
