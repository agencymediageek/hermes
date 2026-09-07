'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, GitBranch, ExternalLink, Cpu, MemoryStick, HardDrive, Square, ShieldCheck, Copy, Check,  } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ResourceBar from '@/components/ui/ResourceBar';
import { workspaceInfo } from './workspaceData';

interface WorkspaceHeaderProps {
  onRequestApproval: () => void;
}

export default function WorkspaceHeader({ onRequestApproval }: WorkspaceHeaderProps) {
  const [copied, setCopied] = useState(false);
  const ws = workspaceInfo;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`https://${ws.previewUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuspend = () => {
    // BACKEND INTEGRATION: POST /api/workspaces/:id/suspend
    toast.success(`Suspending workspace ${ws.name}…`);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0 flex-wrap">
      {/* Back */}
      <Link
        href="/projects-dashboard"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs shrink-0"
      >
        <ChevronLeft size={14} />
        Dashboard
      </Link>

      <div className="w-px h-5 bg-border shrink-0" />

      {/* Workspace name + status */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-sm font-mono text-foreground">{ws.name}</span>
        <StatusBadge status={ws.status} size="sm" />
      </div>

      {/* Branch */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded border border-border shrink-0">
        <GitBranch size={11} className="text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">{ws.branch}</span>
      </div>

      {/* Preview URL */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded shrink-0 max-w-xs">
        <span className="text-2xs font-mono text-accent truncate">{ws.previewUrl}</span>
        <button onClick={handleCopyUrl} className="text-accent/70 hover:text-accent transition-colors shrink-0" title="Copy preview URL">
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
        <a href={`https://${ws.previewUrl}`} target="_blank" rel="noopener noreferrer" className="text-accent/70 hover:text-accent transition-colors shrink-0" title="Open preview in new tab">
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Container stats */}
      <div className="flex items-center gap-3 ml-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <Cpu size={11} className="text-muted-foreground" />
          <div className="w-16">
            <ResourceBar value={ws.cpu} size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <MemoryStick size={11} className="text-muted-foreground" />
          <div className="w-16">
            <ResourceBar value={ws.ram} size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive size={11} className="text-muted-foreground" />
          <div className="w-16">
            <ResourceBar value={ws.disk} size="sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto shrink-0">
        {/* Container ID */}
        <span className="text-2xs font-mono text-muted-foreground px-2 py-1 bg-secondary rounded border border-border">
          {ws.containerId}
        </span>

        {/* Suspend */}
        <button
          onClick={handleSuspend}
          className="btn-secondary text-xs px-2.5 py-1.5 gap-1.5"
          title="Suspend this workspace"
        >
          <Square size={12} />
          Suspend
        </button>

        {/* Approval gate */}
        <button
          onClick={onRequestApproval}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning/15 text-warning border border-warning/30 rounded text-xs font-medium hover:bg-warning/25 transition-all duration-150"
        >
          <ShieldCheck size={12} />
          Request Approval
        </button>
      </div>
    </div>
  );
}