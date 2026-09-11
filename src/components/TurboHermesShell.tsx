'use client';
import React from 'react';
import Link from 'next/link';
import { Activity, BookOpen, CheckCircle2, ChevronRight, Clock3, FileSearch, Play, ShieldCheck } from 'lucide-react';

export const turboNav = [
  { href: '/turbohermes', label: 'Overview', icon: Activity },
  { href: '/turbohermes/approvals', label: 'Approvals', icon: ShieldCheck },
  { href: '/turbohermes/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/turbohermes/runs', label: 'Runs', icon: Play },
  { href: '/turbohermes/audit', label: 'Audit trail', icon: FileSearch },
];

export function TurboTabs({ current }: { current: string }) {
  return <nav aria-label="TurboHermes sections" className="flex gap-1 overflow-x-auto border-b border-border px-6">
    {turboNav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${current === href ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}><Icon size={15} />{label}</Link>)}
  </nav>;
}

export function TurboHeader({ title, eyebrow, current }: { title: string; eyebrow: string; current: string }) {
  return <><header className="border-b border-border bg-card/70 px-6 py-5 backdrop-blur-sm"><div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{eyebrow}</div><div className="mt-1 flex items-center justify-between gap-4"><h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1><span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><Clock3 size={13} /> Private control plane</span></div></header><TurboTabs current={current} /></>;
}
export function Stat({ label, value, detail, tone = 'default' }: { label: string; value: string | number; detail?: string; tone?: 'default' | 'good' | 'warn' }) {
  return <div className="rounded-lg border border-border bg-card p-4 shadow-sm"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-2 text-2xl font-semibold ${tone === 'good' ? 'text-emerald-400' : tone === 'warn' ? 'text-amber-400' : 'text-foreground'}`}>{value}</div>{detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}</div>;
}
export function State({ loading, error, empty, children, onRetry }: { loading: boolean; error: string | null; empty: boolean; children: React.ReactNode; onRetry?: () => void }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />)}</div>;
  if (error) return <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive"><p>{error}</p>{onRetry && <button onClick={onRetry} className="mt-3 rounded-md border border-destructive/30 px-3 py-1.5 text-xs">Retry</button>}</div>;
  if (empty) return <div className="rounded-lg border border-dashed border-border p-10 text-center"><CheckCircle2 className="mx-auto mb-3 text-muted-foreground" size={22} /><p className="text-sm text-muted-foreground">No records to show yet.</p></div>;
  return <>{children}</>;
}
export function RowLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">{children}<ChevronRight size={13} /></Link>; }