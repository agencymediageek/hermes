'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { GitBranch, Plus, Minus, ExternalLink, RefreshCw, GitMerge } from 'lucide-react';
import { commitHistory } from './workspaceData';

export default function CommitsPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // BACKEND INTEGRATION: GET /api/workspaces/:id/commits — fetch from GitHub API
    await new Promise((res) => setTimeout(res, 800));
    setIsRefreshing(false);
    toast?.success('Commit history refreshed from GitHub');
  };

  const handleRequestMerge = () => {
    // BACKEND INTEGRATION: POST /api/approvals — type: merge_to_main
    toast?.info('Merge request queued — approval required');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <GitBranch size={13} className="text-primary" />
          <span className="text-xs font-mono font-semibold text-foreground">main</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 btn-secondary rounded text-xs"
            title="Refresh from GitHub"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleRequestMerge}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary border border-primary/30 rounded text-xs font-medium hover:bg-primary/25 transition-colors duration-150"
            title="Request merge to main — requires approval"
          >
            <GitMerge size={11} />
            Merge
          </button>
        </div>
      </div>

      {/* Branch info */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center justify-between text-2xs text-muted-foreground">
          <span>{commitHistory?.length} commits ahead of main</span>
          <a
            href="https://github.com/agencymediageek/hermes-control-plane"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors"
          >
            View on GitHub
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Commit list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {commitHistory?.map((commit, i) => (
          <div
            key={commit?.id}
            className="flex items-start gap-2.5 py-2.5 border-b border-border/40 last:border-0 group hover:bg-muted/10 rounded px-1.5 transition-colors duration-100"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className={`w-2 h-2 rounded-full border ${i === 0 ? 'bg-primary border-primary' : 'bg-muted border-border'}`} />
              {i < commitHistory?.length - 1 && <div className="w-px flex-1 bg-border mt-1" style={{ height: 20 }} />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-snug mb-0.5 line-clamp-2">{commit?.message}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xs font-mono text-muted-foreground">{commit?.sha}</span>
                <span className="text-2xs text-muted-foreground">{commit?.author}</span>
                <span className="text-2xs text-muted-foreground">{commit?.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-0.5 text-2xs text-success font-mono">
                  <Plus size={9} />
                  {commit?.additions}
                </span>
                <span className="flex items-center gap-0.5 text-2xs text-danger font-mono">
                  <Minus size={9} />
                  {commit?.deletions}
                </span>
              </div>
            </div>

            <a
              href={`https://github.com/agencymediageek/hermes-control-plane/commit/${commit?.sha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
              title="View commit on GitHub"
            >
              <ExternalLink size={11} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}