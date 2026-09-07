'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import AgentLogsContent from './components/AgentLogsContent';

export default function AgentLogsPage() {
  return (
    <AppLayout currentPath="/agent-logs">
      <AgentLogsContent />
    </AppLayout>
  );
}
