'use client';
import React from 'react';
import Link from 'next/link';
import { BookOpen, MessageSquare, ScrollText, KeyRound, GitCommit, LockKeyhole } from 'lucide-react';
import type { RightTab } from './WorkspaceEditorContent';
import ChatView from '@/app/turbohermes/views/ChatView';
import LogsPanel from './LogsPanel';
import SecretsPanel from './SecretsPanel';
import CommitsPanel from './CommitsPanel';

interface RightSidebarProps {
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  width: number;
}

const TABS: { id: RightTab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
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
        {activeTab === 'chat' && <ChatView compact />}
        {activeTab === 'logs' && <LogsPanel />}
        {activeTab === 'secrets' && <SecretsPanel />}
        {activeTab === 'commits' && <CommitsPanel />}
      </div>
    </div>
  );
}