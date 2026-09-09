import React from 'react';
import { workspaceInfo } from './workspaceData';

interface EditorPanelProps {
  terminalHeight: number;
}

export default function EditorPanel({ terminalHeight }: EditorPanelProps) {
  const vscodeUrl = `https://${workspaceInfo.previewUrl}`;

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
      </div>
    </div>
  );
}