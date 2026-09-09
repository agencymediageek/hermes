'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Code2,
  GitBranch,
  ShieldCheck,
  ScrollText,
  KeyRound,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Cpu,
  Boxes,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/projects-dashboard', icon: <LayoutDashboard size={18} />, group: 'main' },
  { id: 'nav-workspaces', label: 'Workspaces', href: '/workspace-editor', icon: <Code2 size={18} />, group: 'main' },
  { id: 'nav-repos', label: 'Repositories', href: '/projects-dashboard', icon: <GitBranch size={18} />, group: 'main' },
  { id: 'nav-approvals', label: 'Approvals', href: '/projects-dashboard', icon: <ShieldCheck size={18} />, group: 'ops' },
  { id: 'nav-logs', label: 'Agent Logs', href: '/agent-logs', icon: <ScrollText size={18} />, group: 'ops' },
  { id: 'nav-secrets', label: 'Secrets', href: '/settings', icon: <KeyRound size={18} />, group: 'ops' },
  { id: 'nav-infra', label: 'Infrastructure', href: '/infrastructure', icon: <Cpu size={18} />, group: 'infra' },
  { id: 'nav-containers', label: 'Containers', href: '/infrastructure', icon: <Boxes size={18} />, group: 'infra' },
  { id: 'nav-monitoring', label: 'Monitoring', href: '/infrastructure', icon: <Activity size={18} />, group: 'infra' },
  { id: 'nav-settings', label: 'Settings', href: '/settings', icon: <Settings size={18} />, group: 'system' },
];

const groupLabels: Record<string, string> = {
  main: 'Engineering',
  ops: 'Operations',
  infra: 'Infrastructure',
  system: 'System',
};

interface SidebarProps {
  currentPath?: string;
  onLogout?: () => void;
}

export default function Sidebar({ currentPath, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const groups = ['main', 'ops', 'infra', 'system'];

  return (
    <aside
      className="relative flex flex-col bg-card border-r border-border shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border transition-all duration-300 ${collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-3'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-semibold text-base tracking-tight text-foreground whitespace-nowrap overflow-hidden">
            Hermes
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">
                  {groupLabels[group]}
                </p>
              )}
              {collapsed && <div className="h-px bg-border mx-1 mb-2" />}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center rounded-md transition-all duration-150 relative group
                          ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2 gap-3'}
                          ${isActive ? 'sidebar-item-active' : 'text-muted-foreground hover:text-foreground sidebar-item-hover'}
                        `}
                      >
                        <span className={`shrink-0 ${isActive ? 'text-primary' : ''}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.badge && item.badge > 0 && (
                          <span className="text-2xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                            {item.badge}
                          </span>
                        )}
                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                        )}
                        {/* Tooltip for collapsed */}
                        {collapsed && (
                          <span className="absolute left-full ml-2 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2">
        {/* Notifications */}
        <button
          title={collapsed ? 'Notifications' : undefined}
          className={`w-full flex items-center rounded-md text-muted-foreground hover:text-foreground sidebar-item-hover transition-all duration-150 mb-1 relative group
            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2 gap-3'}
          `}
        >
          <Bell size={18} />
          {!collapsed && <span className="text-sm font-medium flex-1 text-left">Notifications</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Notifications
            </span>
          )}
        </button>

        {/* User */}
        {!collapsed && (
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md sidebar-item-hover cursor-pointer group mb-1 w-full text-left">
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
              HA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Hermes Admin</p>
              <p className="text-2xs text-muted-foreground truncate">admin@hermes.local</p>
            </div>
            <LogOut size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {collapsed && (
          <button onClick={onLogout} className="flex justify-center mb-1 relative group w-full">
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              HA
            </div>
            <span className="absolute left-full ml-2 px-2 py-1 bg-secondary border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Hermes Admin
            </span>
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-150 z-10"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}