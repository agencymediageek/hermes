import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardContent from './components/DashboardContent';

export default function ProjectsDashboardPage() {
  return (
    <AppLayout currentPath="/projects-dashboard">
      <DashboardContent />
    </AppLayout>
  );
}