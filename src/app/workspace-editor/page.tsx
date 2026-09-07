import React from 'react';
import AppLayout from '@/components/AppLayout';
import WorkspaceEditorContent from './components/WorkspaceEditorContent';

export default function WorkspaceEditorPage() {
  return (
    <AppLayout currentPath="/workspace-editor">
      <WorkspaceEditorContent />
    </AppLayout>
  );
}