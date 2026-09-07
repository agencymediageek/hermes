'use client';
import React, { useState, useMemo } from 'react';
import {
  Download,
  Filter,
  AlertTriangle,
  Info,
  Bug,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  Terminal,
  GitCommit,
  FileText,
  Package,
  Hammer,
  TestTube,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { globalAgentLogs, type GlobalAgentLog, type LogLevel, type LogActionType } from './logsData';

const levelConfig: Record<LogLevel, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  info: { icon: <Info size={11} />, color: 'text-accent', bg: 'bg-accent/10 border-accent/20', label: 'INFO' },
  warn: { icon: <AlertTriangle size={11} />, color: 'text-warning', bg: 'bg-warning/10 border-warning/20', label: 'WARN' },
  error: { icon: <AlertCircle size={11} />, color: 'text-danger', bg: 'bg-danger/10 border-danger/20', label: 'ERROR' },
  debug: { icon: <Bug size={11} />, color: 'text-muted-foreground', bg: 'bg-muted/20 border-border', label: 'DEBUG' },
};

const typeIcon: Record<LogActionType, React.ReactNode> = {
  file_write: <FileText size={11} />,
  file_read: <FileText size={11} />,
  command_exec: <Terminal size={11} />,
  commit: <GitCommit size={11} />,
  install_deps: <Package size={11} />,
  build: <Hammer size={11} />,
  test_run: <TestTube size={11} />,
  system: <Zap size={11} />,
  deploy: <Zap size={11} />,
  approval: <ShieldCheck size={11} />,
};

const WORKSPACES = ['all', 'hermes-api', 'hermes-panel', 'n8n-workflows', 'cloudflare-workers', 'postgres-migrations', 'openrouter-proxy'];
const LEVELS: ('all' | LogLevel)[] = ['all', 'info', 'warn', 'error', 'debug'];

export default function AgentLogsContent() {
  const [levelFilter, setLevelFilter] = useState<'all' | LogLevel>('all');
  const [wsFilter, setWsFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    total: globalAgentLogs.length,
    error: globalAgentLogs.filter((l) => l.level === 'error').length,
    warn: globalAgentLogs.filter((l) => l.level === 'warn').length,
    info: globalAgentLogs.filter((l) => l.level === 'info').length,
    debug: globalAgentLogs.filter((l) => l.level === 'debug').length,
  }), []);

  const filtered = useMemo(() => {
    return globalAgentLogs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (wsFilter !== 'all' && log.workspaceName !== wsFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!log.message.toLowerCase().includes(q) && !log.workspaceName.toLowerCase().includes(q) && !(log.detail?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [levelFilter, wsFilter, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hermes-agent-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Agent Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured log stream across all workspaces
            <span className="ml-3 inline-flex items-center gap-1.5">
              {counts.error > 0 && (
                <span className="text-2xs font-medium text-danger bg-danger/10 border border-danger/20 rounded px-1.5 py-0.5">
                  {counts.error} errors
                </span>
              )}
              {counts.warn > 0 && (
                <span className="text-2xs font-medium text-warning bg-warning/10 border border-warning/20 rounded px-1.5 py-0.5">
                  {counts.warn} warnings
                </span>
              )}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-sm px-3 py-2"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={handleExport} className="btn-secondary text-sm px-3 py-2">
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-1">
          {LEVELS.map((lvl) => (
            <button
              key={`lvl-${lvl}`}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-150
                ${levelFilter === lvl
                  ? lvl === 'all' ? 'bg-primary text-white' : `${levelConfig[lvl as LogLevel]?.bg} ${levelConfig[lvl as LogLevel]?.color} border`
                  : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                }`}
            >
              {lvl === 'all' ? `All (${counts.total})` : `${lvl.toUpperCase()} (${counts[lvl as LogLevel]})`}
            </button>
          ))}
        </div>

        {/* Workspace filter */}
        <div className="relative">
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="input-base pl-3 pr-8 py-1.5 text-sm appearance-none cursor-pointer"
          >
            {WORKSPACES.map((ws) => (
              <option key={`ws-${ws}`} value={ws}>
                {ws === 'all' ? 'All Workspaces' : ws}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="ml-auto text-xs text-muted-foreground">
          <Filter size={12} className="inline mr-1" />
          {filtered.length} of {counts.total} entries
        </div>
      </div>

      {/* Log table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <Filter size={28} className="text-muted-foreground mb-3" />
            <p className="text-base font-medium text-foreground mb-1">No matching logs</p>
            <p className="text-sm text-muted-foreground">Adjust your filters or search term.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="text-left px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[90px]">Time</th>
                <th className="text-left px-3 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[70px]">Level</th>
                <th className="text-left px-3 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">Type</th>
                <th className="text-left px-3 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">Workspace</th>
                <th className="text-left px-3 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Message</th>
                <th className="text-right px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[70px]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const conf = levelConfig[log.level];
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className={`border-b border-border/50 cursor-pointer transition-colors duration-100
                        ${log.level === 'error' ? 'bg-danger/5 hover:bg-danger/10' : log.level === 'warn' ? 'bg-warning/5 hover:bg-warning/10' : 'hover:bg-muted/20'}
                        ${isExpanded ? 'bg-muted/30' : ''}
                      `}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-mono text-muted-foreground">{log.timestamp}</div>
                        <div className="text-2xs text-muted-foreground/60">{log.date}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-bold ${conf.bg} ${conf.color}`}>
                          {conf.icon}
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          {typeIcon[log.type]}
                          <span className="text-2xs">{log.type.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-accent text-2xs bg-accent/10 border border-accent/20 rounded px-1.5 py-0.5">
                          {log.workspaceName}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-mono text-foreground leading-snug">{log.message}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {log.durationMs != null ? (
                          <span className="font-mono text-muted-foreground tabular-nums">{log.durationMs}ms</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && log.detail && (
                      <tr className="border-b border-border/50 bg-muted/30">
                        <td colSpan={6} className="px-4 py-2.5">
                          <div className="flex items-start gap-2">
                            <ChevronDown size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground font-mono">{log.detail}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
