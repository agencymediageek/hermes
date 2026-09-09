import React from 'react';
import { ExternalLink } from 'lucide-react';
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

      <div className="relative w-full" style={{ height: `calc(100% - 33px)` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
          <div className="text-center max-w-md px-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <ExternalLink size={26} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Hermes Workspace</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Open the protected OpenVSCode workspace in a separate tab to avoid an embedded login session.
            </p>
            <a
              href={vscodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex px-4 py-2 text-sm"
            >
              Open Hermes Workspace
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}