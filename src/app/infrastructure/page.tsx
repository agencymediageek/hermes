'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import InfrastructureContent from './components/InfrastructureContent';

export default function InfrastructurePage() {
  return (
    <AppLayout currentPath="/infrastructure">
      <InfrastructureContent />
    </AppLayout>
  );
}
