import React, { useState } from 'react';
import { BookOpen, Braces, ExternalLink, FolderOpen, Globe2, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { workspaceInfo } from './workspaceData';

interface EditorPanelProps {
  terminalHeight: number;
}

export default function EditorPanel({ terminalHeight }: EditorPanelProps) {
  const vscodeUrl = `https://${workspaceInfo.previewUrl}`;
  const [activeTab, setActiveTab] = useState<'workspace' | 'docs' | 'code' | 'preview'>('workspace');
  const tabs = [
    { id: 'workspace' as const, label: 'Workspace', icon: FolderOpen },
    { id: 'docs' as const, label: 'Documentation', icon: BookOpen },
    { id: 'code' as const, label: 'Code', icon: Braces },
    { id: 'preview' as const, label: 'Preview', icon: Globe2 },
  ];

  return (
    <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden bg-background">
      {/* Editor toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <span className="text-2xs text-muted-foreground font-mono ml-2">
           Development Workspace
        </span>
       <span className="ml-auto text-2xs text-muted-foreground">
          Container: {workspaceInfo.containerId} · Node {workspaceInfo.nodeVersion}
        </span>
      </div>

      <div className="flex shrink-0 overflow-x-auto border-b border-border bg-card/60 px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-colors ${activeTab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto">
        {activeTab === 'workspace' && <div className="flex h-full min-h-[180px] items-center justify-center px-6 py-8">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><MonitorPlay size={21} className="text-primary" /></div>
            <p className="text-sm font-semibold text-foreground">Protected OpenVSCode workspace</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">The editor session opens in a separate tab so its authentication boundary remains intact.</p>
            <a href={vscodeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 inline-flex px-4 py-2 text-sm">Open OpenVSCode <ExternalLink size={14} /></a>
          </div>
        </div>}
        {activeTab === 'docs' && <div className="p-5 sm:p-8">
          <div className="max-w-xl rounded-lg border border-border bg-card/50 p-5">
            <BookOpen size={18} className="mb-3 text-primary" /><p className="text-sm font-semibold text-foreground">Documentation is held in Docs Vault</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">No local document index is embedded in this workspace. Open the governed Knowledge surface to browse real documents and citations.</p>
            <Link href="/turbohermes/knowledge" className="btn-secondary mt-4 inline-flex px-3 py-2 text-xs">Open Docs Vault <ExternalLink size={13} /></Link>
          </div>
        </div>}
        {activeTab === 'code' && <div className="p-5 sm:p-8">
          <div className="max-w-xl rounded-lg border border-border bg-card/50 p-5">
            <Braces size={18} className="mb-3 text-primary" /><p className="text-sm font-semibold text-foreground">Code lives in OpenVSCode</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">The protected file tree is not mirrored into this panel. Use the workspace boundary to inspect and edit the actual repository.</p>
            <a href={vscodeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 inline-flex px-3 py-2 text-xs">Open code workspace <ExternalLink size={13} /></a>
          </div>
        </div>}
        {activeTab === 'preview' && <div className="p-5 sm:p-8">
          <div className="max-w-xl rounded-lg border border-border bg-card/50 p-5">
            <Globe2 size={18} className="mb-3 text-primary" /><p className="text-sm font-semibold text-foreground">Preview endpoint</p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{vscodeUrl}</p>
            <a href={vscodeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 inline-flex px-3 py-2 text-xs">Open preview <ExternalLink size={13} /></a>
          </div>
        </div>}
      </div>
    </div>
  );
}