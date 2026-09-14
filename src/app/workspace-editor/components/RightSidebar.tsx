'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, MessageSquare, ScrollText, KeyRound, GitCommit, LockKeyhole } from 'lucide-react';
import type { RightTab } from './WorkspaceEditorContent';
import LogsPanel from './LogsPanel';
import SecretsPanel from './SecretsPanel';
import CommitsPanel from './CommitsPanel';

interface RightSidebarProps {
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  width: number;
}

const TABS: { id: RightTab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'logs', label: 'Events', icon: <ScrollText size={14} /> },
  { id: 'secrets', label: 'Secrets', icon: <KeyRound size={14} /> },
  { id: 'commits', label: 'Commits', icon: <GitCommit size={14} /> },
];

export default function RightSidebar({ activeTab, onTabChange, width }: RightSidebarProps) {
  return (
    <div
      className="order-1 flex min-h-[560px] w-full shrink-0 flex-col overflow-hidden border-b border-border bg-card lg:order-2 lg:min-h-0 lg:w-[38vw] lg:max-w-[var(--sidebar-width)] lg:border-b-0 lg:border-l"
      style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
    >
      <div className="border-b border-border bg-background/60 p-3">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquare size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Governed chat is separate</span>
        </div>
        <p className="mb-3 text-2xs leading-relaxed text-muted-foreground">Open a persistent project chat from Recent Chats, then return here for workspace outputs.</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/turbohermes/chat" className="flex min-w-0 items-center justify-between gap-1 rounded border border-primary/25 bg-primary/5 px-2 py-2 text-2xs text-primary transition-colors hover:bg-primary/10">
            <span className="truncate">Recent Chats</span><ArrowUpRight size={12} className="shrink-0" />
          </Link>
          <Link href="/workspace-editor#workspace-outputs" className="flex min-w-0 items-center justify-between gap-1 rounded border border-border/70 px-2 py-2 text-2xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <span className="truncate">OpenVSCode / outputs</span><ArrowUpRight size={12} className="shrink-0" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-b border-border bg-muted/10 p-2">
        <Link href="/turbohermes/knowledge" className="flex min-w-0 items-center gap-2 rounded border border-border/70 px-2 py-2 text-left text-2xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <BookOpen size={13} className="shrink-0 text-primary" /><span className="truncate">Docs Vault</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2 rounded border border-amber-400/20 bg-amber-400/5 px-2 py-2 text-left text-2xs text-amber-200/80" title="Secret resolver is disconnected">
          <LockKeyhole size={13} className="shrink-0" /><span className="truncate">Secret Vault · locked</span>
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => (
          <button
            key={`rtab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-150 relative
              ${activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/20 border-b-2 border-transparent'
              }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'logs' && <LogsPanel />}
        {activeTab === 'secrets' && <SecretsPanel />}
        {activeTab === 'commits' && <CommitsPanel />}
      </div>
    </div>
  );
}