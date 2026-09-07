'use client';
import React, { useState } from 'react';
import { Download, Filter, AlertTriangle, Info, Bug, AlertCircle } from 'lucide-react';
import { agentLogs, type AgentLog } from './workspaceData';

const levelConfig: Record<AgentLog['level'], { icon: React.ReactNode; color: string; bg: string }> = {
  info: { icon: <Info size={10} />, color: 'text-accent', bg: 'bg-accent/10' },
  warn: { icon: <AlertTriangle size={10} />, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: <AlertCircle size={10} />, color: 'text-danger', bg: 'bg-danger/10' },
  debug: { icon: <Bug size={10} />, color: 'text-muted-foreground', bg: 'bg-muted/30' },
};

type LevelFilter = 'all' | AgentLog['level'];

export default function LogsPanel() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = agentLogs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const errorCount = agentLogs.filter((l) => l.level === 'error').length;
  const warnCount = agentLogs.filter((l) => l.level === 'warn').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Controls */}
      <div className="px-3 py-2 border-b border-border space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base flex-1 px-2.5 py-1.5 text-xs"
          />
          <button className="p-1.5 btn-secondary rounded" title="Export logs as JSON">
            <Download size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'info', 'warn', 'error', 'debug'] as LevelFilter[]).map((lvl) => (
            <button
              key={`lf-${lvl}`}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 rounded text-2xs font-medium transition-all duration-150
                ${levelFilter === lvl ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'}`}
            >
              {lvl === 'all' ? `All (${agentLogs.length})` : lvl}
              {lvl === 'error' && errorCount > 0 && ` (${errorCount})`}
              {lvl === 'warn' && warnCount > 0 && ` (${warnCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Filter size={20} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">No matching logs</p>
            <p className="text-xs text-muted-foreground">Adjust your filter or search term.</p>
          </div>
        ) : (
          filtered.map((log) => {
            const conf = levelConfig[log.level];
            return (
              <div key={log.id} className="log-line flex items-start gap-2 py-1.5 px-1.5 rounded hover:bg-muted/20 transition-colors duration-100">
                <span className={`${conf.color} shrink-0 mt-0.5`}>{conf.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-2xs text-muted-foreground">{log.timestamp}</span>
                    <span className={`text-2xs px-1 py-0.5 rounded ${conf.bg} ${conf.color} font-medium`}>
                      {log.level}
                    </span>
                    <span className="text-2xs text-muted-foreground">{log.type.replace('_', ' ')}</span>
                    {log.durationMs && (
                      <span className="text-2xs font-mono text-muted-foreground tabular-nums">{log.durationMs}ms</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground mt-0.5 font-mono leading-snug">{log.message}</p>
                  {log.detail && (
                    <p className="text-2xs text-muted-foreground mt-0.5">{log.detail}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}