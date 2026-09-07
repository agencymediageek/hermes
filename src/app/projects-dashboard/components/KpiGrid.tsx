import React from 'react';
import { Boxes, ShieldAlert, Cpu, MemoryStick, HardDrive, Bot } from 'lucide-react';
import type { Workspace, AgentAction } from './mockData';

interface KpiGridProps {
  workspaces: Workspace[];
  agentActions: AgentAction[];
}

export default function KpiGrid({ workspaces, agentActions }: KpiGridProps) {
  const activeCount = workspaces.filter((w) => w.status === 'running' || w.status === 'building').length;
  const pendingApprovals = 2;
  const avgCpu = Math.round(workspaces.filter((w) => w.status === 'running').reduce((s, w) => s + w.cpu, 0) / Math.max(workspaces.filter((w) => w.status === 'running').length, 1));
  const totalRam = 32;
  const usedRam = 14.8;
  const ramPct = Math.round((usedRam / totalRam) * 100);
  const diskPct = 31;
  const agentActionsToday = 47;

  const cards = [
    {
      id: 'kpi-workspaces',
      label: 'Active Workspaces',
      value: String(activeCount),
      sub: `${workspaces.filter((w) => w.status === 'suspended').length} suspended`,
      icon: <Boxes size={18} />,
      trend: null,
      alert: false,
      hero: true,
      accent: 'text-primary',
      bg: 'bg-primary/5 border-primary/15',
    },
    {
      id: 'kpi-approvals',
      label: 'Pending Approvals',
      value: String(pendingApprovals),
      sub: 'Require your review',
      icon: <ShieldAlert size={18} />,
      trend: null,
      alert: true,
      hero: false,
      accent: 'text-warning',
      bg: 'bg-warning/5 border-warning/20',
    },
    {
      id: 'kpi-cpu',
      label: 'Avg CPU Usage',
      value: `${avgCpu}%`,
      sub: 'Across running containers',
      icon: <Cpu size={18} />,
      trend: '+12% vs 1h ago',
      alert: avgCpu > 80,
      hero: false,
      accent: avgCpu > 80 ? 'text-danger' : 'text-accent',
      bg: avgCpu > 80 ? 'bg-danger/5 border-danger/20' : 'bg-accent/5 border-accent/15',
    },
    {
      id: 'kpi-ram',
      label: 'RAM Consumed',
      value: `${usedRam} GB`,
      sub: `${ramPct}% of 32 GB total`,
      icon: <MemoryStick size={18} />,
      trend: null,
      alert: ramPct > 80,
      hero: false,
      accent: ramPct > 80 ? 'text-danger' : 'text-foreground',
      bg: 'bg-card border-border',
    },
    {
      id: 'kpi-disk',
      label: 'NVMe Disk Used',
      value: `${diskPct}%`,
      sub: '124 GB of 400 GB',
      icon: <HardDrive size={18} />,
      trend: null,
      alert: false,
      hero: false,
      accent: 'text-foreground',
      bg: 'bg-card border-border',
    },
    {
      id: 'kpi-agent-actions',
      label: 'Agent Actions Today',
      value: String(agentActionsToday),
      sub: `${agentActions.filter((a) => a.status === 'failed').length} failed`,
      icon: <Bot size={18} />,
      trend: null,
      alert: false,
      hero: false,
      accent: 'text-foreground',
      bg: 'bg-card border-border',
    },
  ];

  return (
    // 6 cards: hero spans 2 cols → row1: hero(2) + 2 regular, row2: 3 regular
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`relative rounded-xl border p-4 flex flex-col gap-2 card-glow
            ${card.alert ? 'card-glow-warning' : ''}
            ${card.hero ? 'col-span-2 md:col-span-1 xl:col-span-2 2xl:col-span-2' : ''}
            ${card.bg}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
              {card.label}
            </p>
            <span className={`${card.accent} opacity-70`}>{card.icon}</span>
          </div>
          <p className={`tabular-nums font-bold leading-none ${card.hero ? 'text-4xl' : 'text-2xl'} ${card.accent}`}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground">{card.sub}</p>
          {card.trend && (
            <p className={`text-2xs font-medium ${card.alert ? 'text-danger' : 'text-muted-foreground'}`}>
              {card.trend}
            </p>
          )}
          {card.alert && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-warning pulse-dot" />
          )}
        </div>
      ))}
    </div>
  );
}