import React from 'react';

type WorkspaceStatus = 'running' | 'provisioning' | 'suspended' | 'destroyed' | 'building';

interface StatusBadgeProps {
  status: WorkspaceStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<WorkspaceStatus, { label: string; className: string }> = {
  running: { label: 'Running', className: 'badge-running' },
  provisioning: { label: 'Provisioning', className: 'badge-provisioning' },
  suspended: { label: 'Suspended', className: 'badge-suspended' },
  destroyed: { label: 'Destroyed', className: 'badge-destroyed' },
  building: { label: 'Building', className: 'badge-building' },
};

const dotColors: Record<WorkspaceStatus, string> = {
  running: 'bg-success',
  provisioning: 'bg-warning',
  suspended: 'bg-muted-foreground',
  destroyed: 'bg-danger',
  building: 'bg-accent',
};

export default function StatusBadge({ status, showDot = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${sizeClass}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${status === 'running' ? 'pulse-dot' : ''}`} />
      )}
      {config.label}
    </span>
  );
}