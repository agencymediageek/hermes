'use client';
import React from 'react';
import { MessageSquare, ScrollText, KeyRound, GitCommit } from 'lucide-react';
import type { RightTab } from './WorkspaceEditorContent';
import ChatPanel from './ChatPanel';
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
  { id: 'logs', label: 'Logs', icon: <ScrollText size={14} />, badge: 1 },
  { id: 'secrets', label: 'Secrets', icon: <KeyRound size={14} /> },
  { id: 'commits', label: 'Commits', icon: <GitCommit size={14} /> },
];

export default function RightSidebar({ activeTab, onTabChange, width }: RightSidebarProps) {
  return (
    <div
      className="flex flex-col border-l border-border bg-card shrink-0 overflow-hidden"
      style={{ width }}
    >
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
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'logs' && <LogsPanel />}
        {activeTab === 'secrets' && <SecretsPanel />}
        {activeTab === 'commits' && <CommitsPanel />}
      </div>
    </div>
  );
}