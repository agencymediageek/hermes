'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldX, GitMerge, Database, Globe, Trash2 } from 'lucide-react';
import type { ApprovalRequest } from './mockData';

interface ApprovalQueueProps {
  approvals: ApprovalRequest[];
}

const typeConfig: Record<ApprovalRequest['type'], { label: string; icon: React.ReactNode; color: string }> = {
  merge_to_main: { label: 'Merge → main', icon: <GitMerge size={13} />, color: 'text-primary' },
  deploy_prod: { label: 'Deploy to Prod', icon: <Globe size={13} />, color: 'text-success' },
  dns_change: { label: 'DNS Change', icon: <Globe size={13} />, color: 'text-accent' },
  db_migration: { label: 'DB Migration', icon: <Database size={13} />, color: 'text-warning' },
  delete_resource: { label: 'Delete Resource', icon: <Trash2 size={13} />, color: 'text-danger' },
};

export default function ApprovalQueue({ approvals: initialApprovals }: ApprovalQueueProps) {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (id: string, name: string) => {
    setProcessing(id);
    // BACKEND INTEGRATION: POST /api/approvals/:id/approve
    await new Promise((res) => setTimeout(res, 900));
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setProcessing(null);
    toast.success(`Approved: ${name}`);
  };

  const handleReject = async (id: string, name: string) => {
    setProcessing(id);
    // BACKEND INTEGRATION: POST /api/approvals/:id/reject
    await new Promise((res) => setTimeout(res, 700));
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setProcessing(null);
    toast.error(`Rejected: ${name}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Approval Queue</h3>
        {approvals.length > 0 && (
          <span className="text-2xs font-bold bg-warning/20 text-warning border border-warning/30 rounded-full px-2 py-0.5">
            {approvals.length} pending
          </span>
        )}
      </div>

      {approvals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <ShieldCheck size={28} className="text-success mb-2 opacity-60" />
          <p className="text-sm font-medium text-foreground mb-1">No pending approvals</p>
          <p className="text-xs text-muted-foreground">All merge and deploy requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {approvals.map((apr) => {
            const config = typeConfig[apr.type];
            const isProcessing = processing === apr.id;
            return (
              <div key={apr.id} className="approval-card p-3 fade-in">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`${config.color} mt-0.5 shrink-0`}>{config.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-2xs font-semibold ${config.color} uppercase tracking-wide`}>
                        {config.label}
                      </span>
                      <span className="text-2xs text-muted-foreground font-mono">{apr.workspaceName}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{apr.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xs text-muted-foreground">
                    by {apr.requestedBy} · {apr.requestedAt}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReject(apr.id, apr.description)}
                      disabled={isProcessing}
                      className="btn-danger text-2xs px-2 py-1 gap-1"
                    >
                      <ShieldX size={11} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(apr.id, apr.description)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-success/15 text-success border border-success/30 rounded text-2xs font-medium hover:bg-success/25 transition-colors duration-150 disabled:opacity-50"
                    >
                      <ShieldCheck size={11} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}