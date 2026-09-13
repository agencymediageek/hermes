'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import AppLogo from './ui/AppLogo';

const API_BASE_URL = 'https://api.hermes.waas.host';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

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
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0 ${mobileNavigationOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentPath={currentPath} onLogout={handleLogout} onNavigate={() => setMobileNavigationOpen(false)} />
      </div>
      {mobileNavigationOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3 md:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open navigation"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <Menu size={18} />
          </button>
          <AppLogo size={24} />
          <span className="text-sm font-semibold text-foreground">Hermes</span>
        </div>
        <main className="min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}