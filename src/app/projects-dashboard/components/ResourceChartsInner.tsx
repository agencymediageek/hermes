'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, TooltipProps,  } from 'recharts';
import { cpuRamHistory, buildDurations } from './mockData';

function CpuTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.dataKey}`} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

function BuildTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1 font-medium truncate">{label}</p>
      <span className="font-semibold text-foreground tabular-nums">{payload[0]?.value}s</span>
    </div>
  );
}

export default function ResourceChartsInner() {
  const hasMetrics = cpuRamHistory.length > 0 || buildDurations.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Container Resources</h3>
          <p className="text-xs text-muted-foreground mt-0.5">CPU & RAM over last 35 minutes</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-primary inline-block" />
            CPU
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-accent inline-block" />
            RAM
          </span>
        </div>
      </div>

      {!hasMetrics ? (
        <div className="h-[265px] flex items-center justify-center text-center">
          <p className="text-xs text-muted-foreground">No resource history recorded yet.</p>
        </div>
      ) : (
      <>
      <div className="mb-5" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cpuRamHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CpuTooltip />} />
            <Line type="monotone" dataKey="cpu" name="CPU" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--primary)' }} />
            <Line type="monotone" dataKey="ram" name="RAM" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--accent)' }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Build Duration (last run, seconds)</p>
        <div style={{ height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buildDurations} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<BuildTooltip />} />
              <Bar dataKey="duration" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}
    </div>
  );
}