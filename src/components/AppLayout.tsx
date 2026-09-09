'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

const API_BASE_URL = 'https://api.hermes.waas.host';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('hermes_admin_token') || sessionStorage.getItem('hermes_admin_token');
    if (!token) {
      router.replace('/');
      return;
    }
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unauthorized');
        setAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem('hermes_admin_token');
        localStorage.removeItem('hermes_admin_user');
        sessionStorage.removeItem('hermes_admin_token');
        sessionStorage.removeItem('hermes_admin_user');
        router.replace('/');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hermes_admin_token');
    localStorage.removeItem('hermes_admin_user');
    sessionStorage.removeItem('hermes_admin_token');
    sessionStorage.removeItem('hermes_admin_user');
    router.replace('/');
  };

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Validating session…
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPath={currentPath} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}