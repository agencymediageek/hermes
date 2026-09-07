'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Search, ChevronUp, ChevronDown, ExternalLink, Play, Square,
  Trash2, Code2, MoreHorizontal, ChevronLeft, ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ResourceBar from '@/components/ui/ResourceBar';
import type { Workspace, WorkspaceStatus } from './mockData';

interface WorkspaceTableProps {
  workspaces: Workspace[];
}

type SortKey = 'name' | 'status' | 'cpu' | 'ram' | 'uptime';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: { id: string; label: string; value: WorkspaceStatus | 'all' }[] = [
  { id: 'filter-all', label: 'All', value: 'all' },
  { id: 'filter-running', label: 'Running', value: 'running' },
  { id: 'filter-building', label: 'Building', value: 'building' },
  { id: 'filter-suspended', label: 'Suspended', value: 'suspended' },
  { id: 'filter-provisioning', label: 'Provisioning', value: 'provisioning' },
  { id: 'filter-destroyed', label: 'Destroyed', value: 'destroyed' },
];

const PAGE_SIZES = [5, 10, 20];

export default function WorkspaceTable({ workspaces: allWorkspaces }: WorkspaceTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkspaceStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [actionRow, setActionRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = allWorkspaces;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) => w.name.toLowerCase().includes(q) || w.repo.toLowerCase().includes(q) || w.branch.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((w) => w.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      let av: string | number = a[sortKey] ?? '';
      let bv: string | number = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [allWorkspaces, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((w) => w.id)));
  };

  const handleBulkDelete = () => {
    // BACKEND INTEGRATION: DELETE /api/workspaces — body: { ids: [...selected] }
    toast.success(`${selected.size} workspace(s) deleted`);
    setSelected(new Set());
  };

  const handleAction = (action: string, ws: Workspace) => {
    // BACKEND INTEGRATION: POST /api/workspaces/:id/:action
    const labels: Record<string, string> = {
      start: `Starting ${ws.name}…`,
      stop: `Suspending ${ws.name}…`,
      destroy: `Workspace ${ws.name} queued for destruction`,
    };
    toast.success(labels[action] ?? `Action on ${ws.name}`);
    setActionRow(null);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="opacity-30 ml-1"><ChevronUp size={11} /></span>;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="ml-1 text-primary" />
      : <ChevronDown size={11} className="ml-1 text-primary" />;
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col">
      {/* Table header controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mr-2">Workspaces</h3>
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, repo, branch…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base w-full pl-8 pr-3 py-1.5 text-xs"
          />
        </div>
        {/* Status filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-2 py-1 rounded-full text-2xs font-medium transition-all duration-150
                ${statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Column visibility placeholder */}
        <button className="ml-auto btn-secondary text-xs px-2 py-1.5 gap-1.5">
          <SlidersHorizontal size={12} />
          Columns
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border-b border-primary/20 slide-up">
          <span className="text-xs font-medium text-primary">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="btn-danger text-xs px-2 py-1 gap-1">
            <Trash2 size={11} />
            Delete selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-border bg-input accent-primary cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">
                <button onClick={() => toggleSort('name')} className="flex items-center hover:text-foreground transition-colors">
                  Workspace <SortIcon col="name" />
                </button>
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Repository</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Branch</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">
                <button onClick={() => toggleSort('status')} className="flex items-center hover:text-foreground transition-colors">
                  Status <SortIcon col="status" />
                </button>
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-24">
                <button onClick={() => toggleSort('cpu')} className="flex items-center hover:text-foreground transition-colors">
                  CPU <SortIcon col="cpu" />
                </button>
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-24">
                <button onClick={() => toggleSort('ram')} className="flex items-center hover:text-foreground transition-colors">
                  RAM <SortIcon col="ram" />
                </button>
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Preview URL</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Last Agent Action</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">
                <button onClick={() => toggleSort('uptime')} className="flex items-center hover:text-foreground transition-colors">
                  Uptime <SortIcon col="uptime" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                  No workspaces match your filters.
                </td>
              </tr>
            )}
            {paginated.map((ws, i) => (
              <tr
                key={ws.id}
                className={`border-b border-border/50 transition-colors duration-100 hover:bg-muted/20 ${i % 2 === 1 ? 'bg-muted/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(ws.id)}
                    onChange={() => toggleSelect(ws.id)}
                    className="w-3.5 h-3.5 rounded border-border bg-input accent-primary cursor-pointer"
                    aria-label={`Select ${ws.name}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <Link href="/workspace-editor" className="font-semibold text-foreground hover:text-primary transition-colors font-mono">
                    {ws.name}
                  </Link>
                  <p className="text-2xs text-muted-foreground mt-0.5">{ws.owner}</p>
                </td>
                <td className="px-3 py-3">
                  <span className="text-muted-foreground font-mono truncate max-w-[140px] block">{ws.repo}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded font-mono text-muted-foreground">
                    {ws.branch}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={ws.status} size="sm" />
                </td>
                <td className="px-3 py-3 w-24">
                  {ws.status === 'running' || ws.status === 'building' ? (
                    <ResourceBar value={ws.cpu} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3 w-24">
                  {ws.status === 'running' || ws.status === 'building' ? (
                    <ResourceBar value={ws.ram} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {ws.previewUrl !== '—' ? (
                    <a
                      href={`https://${ws.previewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:text-accent/80 transition-colors font-mono truncate max-w-[160px]"
                    >
                      <ExternalLink size={10} className="shrink-0" />
                      <span className="truncate text-2xs">{ws.previewUrl}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="max-w-[160px]">
                    <p className="truncate text-foreground">{ws.lastAgentAction}</p>
                    <p className="text-2xs text-muted-foreground">{ws.lastActionTime}</p>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">
                  {ws.uptime}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href="/workspace-editor"
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                      title="Open workspace editor"
                    >
                      <Code2 size={13} />
                    </Link>
                    {(ws.status === 'suspended' || ws.status === 'destroyed') && (
                      <button
                        onClick={() => handleAction('start', ws)}
                        className="p-1.5 rounded text-muted-foreground hover:text-success hover:bg-success/10 transition-all duration-150"
                        title="Start workspace"
                      >
                        <Play size={13} />
                      </button>
                    )}
                    {ws.status === 'running' && (
                      <button
                        onClick={() => handleAction('stop', ws)}
                        className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-warning/10 transition-all duration-150"
                        title="Suspend workspace"
                      >
                        <Square size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('destroy', ws)}
                      className="p-1.5 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all duration-150"
                      title="Destroy workspace — this cannot be undone"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Always-visible fallback for hover */}
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href="/workspace-editor"
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                      title="Open workspace editor"
                    >
                      <Code2 size={13} />
                    </Link>
                    <button
                      onClick={() => setActionRow(actionRow === ws.id ? null : ws.id)}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                      title="More actions"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {actionRow === ws.id && (
                      <div className="absolute right-6 mt-20 w-40 bg-card border border-border rounded-lg shadow-xl z-20 py-1 fade-in">
                        {ws.status !== 'running' && (
                          <button
                            onClick={() => handleAction('start', ws)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Play size={12} className="text-success" />
                            Start workspace
                          </button>
                        )}
                        {ws.status === 'running' && (
                          <button
                            onClick={() => handleAction('stop', ws)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Square size={12} className="text-warning" />
                            Suspend workspace
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('destroy', ws)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-muted transition-colors"
                        >
                          <Trash2 size={12} />
                          Destroy workspace
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="input-base px-2 py-1 text-xs"
          >
            {PAGE_SIZES.map((s) => (
              <option key={`pagesize-${s}`} value={s}>{s}</option>
            ))}
          </select>
          <span>of {filtered.length} workspaces</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition-all duration-150
                ${page === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}