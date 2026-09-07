import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPath={currentPath} />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}