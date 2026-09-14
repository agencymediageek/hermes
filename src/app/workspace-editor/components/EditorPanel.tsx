'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, FolderOpen, Loader2, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { turbohermes, type Document } from '@/lib/turbohermes-client';
import { workspaceInfo } from './workspaceData';

interface EditorPanelProps { terminalHeight: number; }

export default function EditorPanel({ terminalHeight }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'outputs' | 'docs'>('outputs');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(false);
  const tabs = [
    { id: 'outputs' as const, label: 'Workspace Outputs', icon: PackageOpen },
    { id: 'docs' as const, label: 'Docs Vault', icon: BookOpen },
  ];

  useEffect(() => {
    if (activeTab !== 'docs') return;
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsError(false);
    turbohermes.documents().then((items) => {
      if (!cancelled) setDocuments(items);
    }).catch(() => {
      if (!cancelled) setDocumentsError(true);
    }).finally(() => {
      if (!cancelled) setDocumentsLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden bg-background" data-terminal-height={terminalHeight}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-1.5">
        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-danger/60" /><div className="h-3 w-3 rounded-full bg-warning/60" /><div className="h-3 w-3 rounded-full bg-success/60" /></div>
        <span className="ml-2 font-mono text-2xs text-muted-foreground">Development Workspace</span>
        <span className="ml-auto text-2xs text-muted-foreground">Container: {workspaceInfo.containerId} · Node {workspaceInfo.nodeVersion}</span>
      </div>
      <div className="flex shrink-0 overflow-x-auto border-b border-border bg-card/60 px-2">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-colors ${activeTab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}><Icon size={13} />{label}</button>)}
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto">
        {activeTab === 'outputs' && <div id="workspace-outputs" className="flex h-full min-h-[220px] items-center justify-center px-6 py-10">
          <div className="max-w-lg text-center"><PackageOpen size={26} className="mx-auto mb-4 text-primary/75" /><p className="text-sm font-semibold text-foreground">Workspace Outputs</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Generated templates, code, reports, documentation and previews will appear here when TurboHermes publishes outputs.</p><p className="mt-3 text-2xs uppercase tracking-[.14em] text-muted-foreground/70">No artifact-output integration connected</p></div>
        </div>}
        {activeTab === 'docs' && <div className="p-5 sm:p-8">
          {documentsLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" />Loading governed documents…</div>}
          {documentsError && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">Docs Vault could not be reached from this workspace.</div>}
          {!documentsLoading && !documentsError && documents.length === 0 && <div className="rounded-lg border border-dashed border-border p-8 text-center"><FileText size={22} className="mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-foreground">No governed documents available.</p><p className="mt-1 text-xs text-muted-foreground">Published Docs Vault documents will be listed here when available.</p></div>}
          {!documentsLoading && !documentsError && documents.length > 0 && <div className="space-y-2">{documents.map((document) => <div key={document.id} className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3"><FileText size={15} className="mt-0.5 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{document.title}</p><p className="mt-1 text-xs text-muted-foreground">{document.status}{document.version ? ` · v${document.version}` : ''}</p></div></div>)}</div>}
          <Link href="/turbohermes/knowledge" className="btn-secondary mt-4 inline-flex px-3 py-2 text-xs">Open full Docs Vault</Link>
        </div>}
      </div>
    </div>
  );
}