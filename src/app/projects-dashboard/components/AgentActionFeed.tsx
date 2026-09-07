import React from 'react';
import { FileEdit, FileSearch, Terminal, GitCommit, GitBranch, Package, Hammer, TestTube2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { AgentAction } from './mockData';

interface AgentActionFeedProps {
  actions: AgentAction[];
}

const actionTypeConfig: Record<AgentAction['type'], { icon: React.ReactNode; color: string; label: string }> = {
  file_write: { icon: <FileEdit size={12} />, color: 'text-primary', label: 'Write' },
  file_read: { icon: <FileSearch size={12} />, color: 'text-muted-foreground', label: 'Read' },
  command_exec: { icon: <Terminal size={12} />, color: 'text-accent', label: 'Exec' },
  commit: { icon: <GitCommit size={12} />, color: 'text-success', label: 'Commit' },
  branch_create: { icon: <GitBranch size={12} />, color: 'text-primary', label: 'Branch' },
  install_deps: { icon: <Package size={12} />, color: 'text-warning', label: 'Install' },
  build: { icon: <Hammer size={12} />, color: 'text-accent', label: 'Build' },
  test_run: { icon: <TestTube2 size={12} />, color: 'text-success', label: 'Test' },
};

const statusIcon: Record<AgentAction['status'], React.ReactNode> = {
  success: <CheckCircle2 size={11} className="text-success" />,
  failed: <XCircle size={11} className="text-danger" />,
  running: <Loader2 size={11} className="text-accent animate-spin" />,
};

export default function AgentActionFeed({ actions }: AgentActionFeedProps) {
  const sorted = [...actions].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Agent Actions</h3>
        <span className="text-2xs text-muted-foreground">Live feed</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5">
        {sorted.map((action) => {
          const typeConf = actionTypeConfig[action.type];
          return (
            <div
              key={action.id}
              className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors duration-100 group"
            >
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                {statusIcon[action.status]}
                <span className={`${typeConf.color}`}>{typeConf.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-2xs font-mono font-semibold text-muted-foreground">
                    {action.workspaceName}
                  </span>
                  <span className={`text-2xs font-medium ${typeConf.color}`}>{typeConf.label}</span>
                </div>
                <p className="text-xs text-foreground leading-tight truncate">{action.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xs text-muted-foreground font-mono">{action.timestamp}</span>
                  {action.duration && (
                    <span className="text-2xs text-muted-foreground tabular-nums">{action.duration}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}