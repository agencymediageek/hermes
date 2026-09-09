'use client';
import React, { useState } from 'react';
import { Server, Cpu, MemoryStick, HardDrive, RefreshCw, Activity, Box, Wifi, WifiOff, AlertTriangle, CheckCircle2, Circle,  } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { vpsNodes, containers, networkServices, cpuHistory, ramHistory } from './infraData';

function ResourceBar({ pct, danger = 80, warn = 60 }: { pct: number; danger?: number; warn?: number }) {
  const color = pct >= danger ? 'bg-danger' : pct >= warn ? 'bg-warning' : 'bg-success';
  return (
    <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

const statusConfig = {
  healthy: { icon: <CheckCircle2 size={13} />, color: 'text-success', label: 'Healthy' },
  warning: { icon: <AlertTriangle size={13} />, color: 'text-warning', label: 'Warning' },
  critical: { icon: <AlertTriangle size={13} />, color: 'text-danger', label: 'Critical' },
  offline: { icon: <Circle size={13} />, color: 'text-muted-foreground', label: 'Offline' },
};

const svcStatusConfig = {
  up: { icon: <Wifi size={12} />, color: 'text-success', bg: 'bg-success/10 border-success/20', label: 'UP' },
  down: { icon: <WifiOff size={12} />, color: 'text-danger', bg: 'bg-danger/10 border-danger/20', label: 'DOWN' },
  degraded: { icon: <AlertTriangle size={12} />, color: 'text-warning', bg: 'bg-warning/10 border-warning/20', label: 'DEGRADED' },
};

const containerStatusConfig = {
  running: { color: 'text-success', bg: 'bg-success/10 border-success/20', label: 'running' },
  stopped: { color: 'text-muted-foreground', bg: 'bg-muted/20 border-border', label: 'stopped' },
  building: { color: 'text-accent', bg: 'bg-accent/10 border-accent/20', label: 'building' },
  paused: { color: 'text-warning', bg: 'bg-warning/10 border-warning/20', label: 'paused' },
};

export default function InfrastructureContent() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState<'cpu' | 'ram'>('cpu');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsRefreshing(false);
  };

  const chartData = chartMetric === 'cpu' ? cpuHistory : ramHistory;
  const chartUnit = chartMetric === 'cpu' ? '%' : ' GB';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Infrastructure</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            VPS nodes, containers &amp; network services
            <span className="ml-3 inline-flex items-center gap-1 text-2xs text-muted-foreground">
              No live nodes connected
            </span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary text-sm px-3 py-2"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">

        {/* VPS Node Cards */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Server size={14} />
            VPS Nodes
          </h2>
          {vpsNodes.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
              No infrastructure inventory is connected.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vpsNodes.map((node) => {
              const sc = statusConfig[node.status];
              const cpuPct = node.cpu.used;
              const ramPct = Math.round((node.ram.usedGb / node.ram.totalGb) * 100);
              const diskPct = Math.round((node.disk.usedGb / node.disk.totalGb) * 100);
              return (
                <div key={node.id} className="bg-card border border-border rounded-xl p-5 card-glow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Server size={16} className="text-primary" />
                        <h3 className="font-semibold text-foreground">{node.name}</h3>
                        <span className="text-2xs font-bold bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{node.ip} · {node.location}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
                      {sc.icon}
                      {sc.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs text-muted-foreground flex items-center gap-1"><Cpu size={10} /> CPU</span>
                        <span className={`text-xs font-bold tabular-nums ${cpuPct >= 80 ? 'text-danger' : cpuPct >= 60 ? 'text-warning' : 'text-foreground'}`}>{cpuPct}%</span>
                      </div>
                      <ResourceBar pct={cpuPct} />
                      <p className="text-2xs text-muted-foreground mt-1">{node.cpu.cores} cores</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs text-muted-foreground flex items-center gap-1"><MemoryStick size={10} /> RAM</span>
                        <span className={`text-xs font-bold tabular-nums ${ramPct >= 80 ? 'text-danger' : ramPct >= 60 ? 'text-warning' : 'text-foreground'}`}>{ramPct}%</span>
                      </div>
                      <ResourceBar pct={ramPct} />
                      <p className="text-2xs text-muted-foreground mt-1">{node.ram.usedGb} / {node.ram.totalGb} GB</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs text-muted-foreground flex items-center gap-1"><HardDrive size={10} /> Disk</span>
                        <span className={`text-xs font-bold tabular-nums ${diskPct >= 80 ? 'text-danger' : diskPct >= 60 ? 'text-warning' : 'text-foreground'}`}>{diskPct}%</span>
                      </div>
                      <ResourceBar pct={diskPct} />
                      <p className="text-2xs text-muted-foreground mt-1">{node.disk.usedGb} / {node.disk.totalGb} GB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-border text-2xs text-muted-foreground">
                    <span><Activity size={10} className="inline mr-1" />Uptime: {node.uptime}</span>
                    <span>{node.os}</span>
                    <span className="font-mono">{node.kernel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resource Charts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} />
              Resource History (last 35 min)
            </h2>
            <div className="flex items-center gap-1">
              {(['cpu', 'ram'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-150
                    ${chartMetric === m ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 card-glow">
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No resource history recorded.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradKvm4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#6B6B8A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B6B8A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}${chartUnit}`} />
                <Tooltip
                  contentStyle={{ background: '#12121A', border: '1px solid #1E1E2E', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#A0A0B8' }}
                  formatter={(value: number) => [`${value}${chartUnit}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6B6B8A' }} />
                <Area type="monotone" dataKey="kvm4" name="hermes-kvm4" stroke="#7C3AED" strokeWidth={2} fill="url(#gradKvm4)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Containers Table */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Box size={14} />
            Docker Containers ({containers.length})
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-muted/20">
                <tr>
                  <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Container</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[90px]">Status</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">CPU</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">RAM</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Ports</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Uptime</th>
                  <th className="text-left px-3 py-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Node</th>
                </tr>
              </thead>
              <tbody>
                {containers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No containers are registered.
                    </td>
                  </tr>
                )}
                {containers.map((c) => {
                  const sc = containerStatusConfig[c.status];
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors duration-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{c.workspaceName}</p>
                        <p className="font-mono text-2xs text-muted-foreground">{c.containerId}</p>
                      </td>
                      <td className="px-3 py-3 font-mono text-muted-foreground">{c.image}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {c.cpu > 0 ? (
                          <div>
                            <span className={`font-bold tabular-nums ${c.cpu >= 80 ? 'text-danger' : c.cpu >= 60 ? 'text-warning' : 'text-foreground'}`}>{c.cpu}%</span>
                            <ResourceBar pct={c.cpu} />
                          </div>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        {c.ramMb > 0 ? (
                          <span className="font-mono text-foreground tabular-nums">{c.ramMb} MB</span>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-3 py-3 font-mono text-muted-foreground">{c.ports}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.uptime}</td>
                      <td className="px-3 py-3">
                        <span className="text-2xs font-mono text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                          {vpsNodes.find((n) => n.id === c.nodeId)?.name ?? c.nodeId}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Network Services */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wifi size={14} />
            Network Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {networkServices.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3 bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                No network services are registered.
              </div>
            )}
            {networkServices.map((svc) => {
              const sc = svcStatusConfig[svc.status];
              return (
                <div key={svc.id} className={`bg-card border rounded-xl p-4 card-glow ${svc.status === 'degraded' ? 'card-glow-warning border-warning/20' : 'border-border'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-foreground leading-tight">{svc.name}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-bold ${sc.bg} ${sc.color}`}>
                      {sc.icon}
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{svc.detail}</p>
                  {svc.latencyMs != null && (
                    <p className="text-2xs font-mono text-muted-foreground">
                      Latency: <span className={`font-bold ${svc.latencyMs > 100 ? 'text-warning' : 'text-success'}`}>{svc.latencyMs}ms</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
