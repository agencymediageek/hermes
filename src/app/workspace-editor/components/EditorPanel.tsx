import React from 'react';
import { workspaceInfo } from './workspaceData';

interface EditorPanelProps {
  terminalHeight: number;
}

export default function EditorPanel({ terminalHeight }: EditorPanelProps) {
  // BACKEND INTEGRATION: OpenVSCode Server is served at /api/workspaces/:id/vscode
  // The iframe src should point to the OpenVSCode Server URL for this workspace container
  const vscodeUrl = `https://vscode-${workspaceInfo.id}.tunnel.hermesdev.io`;

  return (
    <div className="flex-1 overflow-hidden bg-background min-h-0" style={{ minHeight: 200 }}>
      {/* Editor toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-b border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <span className="text-2xs text-muted-foreground font-mono ml-2">
          OpenVSCode Server — {workspaceInfo.name}
        </span>
        <span className="text-2xs text-muted-foreground ml-auto">
          Container: {workspaceInfo.containerId} · Node {workspaceInfo.nodeVersion}
        </span>
      </div>

      {/* VSCode iframe */}
      {/* BACKEND INTEGRATION: iframe src connects to OpenVSCode Server instance running in Docker container */}
      <div className="relative w-full" style={{ height: `calc(100% - 33px)` }}>
        <iframe
          src={vscodeUrl}
          title={`OpenVSCode Server — ${workspaceInfo.name}`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          allow="clipboard-read; clipboard-write"
        />
        {/* Overlay shown when iframe is not reachable (demo mode) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 pointer-events-none">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M16.5 3L21 7.5V21H3V3H16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M16 3V8H21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M7 12H17M7 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">OpenVSCode Server</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              The embedded editor connects to the OpenVSCode Server running inside the Docker container for this workspace.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
              <span className="text-2xs font-mono text-muted-foreground">{vscodeUrl}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}