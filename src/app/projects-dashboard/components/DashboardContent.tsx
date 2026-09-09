'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';
import { workspaces, agentActions, approvalRequests } from './mockData';
import KpiGrid from './KpiGrid';
import ResourceCharts from './ResourceCharts';
import ApprovalQueue from './ApprovalQueue';
import AgentActionFeed from './AgentActionFeed';
import WorkspaceTable from './WorkspaceTable';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function DashboardContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // BACKEND INTEGRATION: GET /api/workspaces/status — refresh all container stats
    await new Promise((res) => setTimeout(res, 1000));
    setIsRefreshing(false);
    toast?.success('Dashboard refreshed');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Engineering Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            KVM4 · 4 vCPU · 16 GB RAM · 200 GB NVMe
            <span className="ml-3 inline-flex items-center gap-1 text-2xs text-muted-foreground">
              No workspaces configured
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-sm px-3 py-2"
            title="Refresh dashboard data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-sm px-3 py-2"
          >
            <Plus size={14} />
            New Workspace
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* KPI bento grid */}
        <KpiGrid workspaces={workspaces} agentActions={agentActions} />

        {/* Charts + Approval Queue */}
        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ResourceCharts />
          </div>
          <div className="xl:col-span-1">
            <ApprovalQueue approvals={approvalRequests} />
          </div>
        </div>

        {/* Workspace table + Agent feed */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-4">
          <div className="2xl:col-span-3">
            <WorkspaceTable workspaces={workspaces} />
          </div>
          <div className="2xl:col-span-1">
            <AgentActionFeed actions={agentActions} />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}