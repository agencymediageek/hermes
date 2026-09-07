import React from 'react';

interface ResourceBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

function getBarColor(value: number): string {
  if (value >= 85) return 'bg-danger';
  if (value >= 65) return 'bg-warning';
  return 'bg-success';
}

export default function ResourceBar({ value, size = 'sm', showLabel = true }: ResourceBarProps) {
  const height = size === 'sm' ? 'h-[3px]' : 'h-[5px]';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className={`resource-bar flex-1 ${height}`}>
        <div
          className={`resource-bar-fill ${getBarColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className={`tabular-nums font-mono text-2xs font-medium shrink-0 ${value >= 85 ? 'text-danger' : value >= 65 ? 'text-warning' : 'text-muted-foreground'}`}>
          {value}%
        </span>
      )}
    </div>
  );
}