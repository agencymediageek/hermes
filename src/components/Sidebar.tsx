'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Modal from '@/components/ui/Modal';
import { BookOpen, Code2, FileSearch, ChevronLeft, ChevronRight, LogOut, Pencil, Play, Radio, Settings, ShieldCheck } from 'lucide-react';
import { turbohermes, type ChatSession } from '@/lib/turbohermes-client';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
  operational: boolean;
}

const navItems: NavItem[] = [
  { id: 'nav-turbohermes', label: 'TurboHermes', href: '/turbohermes', icon: <Radio size={18} />, group: 'ops', operational: true },
  { id: 'nav-workspaces', label: 'OpenVSCode Workspace', href: '/workspace-editor', icon: <Code2 size={18} />, group: 'main', operational: true },
  { id: 'nav-knowledge', label: 'Docs Vault', href: '/turbohermes/knowledge', icon: <BookOpen size={18} />, group: 'main', operational: true },
  { id: 'nav-secrets', label: 'Secret Vault · locked', href: '/settings', icon: <ShieldCheck size={18} />, group: 'main', operational: false },
  { id: 'nav-runs', label: 'Runs', href: '/turbohermes/runs', icon: <Play size={18} />, group: 'ops', operational: true },
  { id: 'nav-approvals', label: 'Approvals', href: '/turbohermes/approvals', icon: <ShieldCheck size={18} />, group: 'ops', operational: true },
  { id: 'nav-audit', label: 'Audit', href: '/turbohermes/audit', icon: <FileSearch size={18} />, group: 'ops', operational: true },
  { id: 'nav-settings', label: 'Settings', href: '/settings', icon: <Settings size={18} />, group: 'system', operational: true },
];

const groupLabels: Record<string, string> = {
  main: 'Engineering',
  ops: 'Operations',
  system: 'System',
};

interface SidebarProps {
  currentPath?: string;
  onLogout?: () => void;
  onNavigate?: () => void;
}

function sessionTitle(session: ChatSession) {
  return session.projectTitle?.trim() || 'Untitled project';
}

interface ChatNameModalProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

function ChatNameModal({ isOpen, title, initialValue = '', submitLabel, busy, error, onClose, onSubmit }: ChatNameModalProps) {
  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setValidationError(null);
    }
  }, [initialValue, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationError('Enter a project or idea name to continue.');
      return;
    }
    if (trimmed.length > 120) {
      setValidationError('Use 120 characters or fewer.');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => undefined : onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="chat-project-title" className="text-sm font-medium text-foreground">Project or idea name</label>
        <input
          id="chat-project-title"
          value={value}
          onChange={(event) => { setValue(event.target.value); setValidationError(null); }}
          autoFocus
          maxLength={120}
          placeholder="e.g. Customer onboarding refresh"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/70"
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'chat-project-title-error' : 'chat-project-title-help'}
          disabled={busy}
        />
        <p id="chat-project-title-help" className="mt-2 text-xs text-muted-foreground">Give this governed conversation a clear name.</p>
        {(validationError || error) && <p id="chat-project-title-error" className="mt-2 text-xs text-destructive" role="alert">{validationError || error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="btn-secondary px-3 py-2 text-xs">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary px-3 py-2 text-xs">{busy ? 'Saving…' : submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Sidebar({ currentPath, onLogout, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [recentChatsLoaded, setRecentChatsLoaded] = useState(false);
  const [chatNameModalOpen, setChatNameModalOpen] = useState(false);
  const [chatNameModalMode, setChatNameModalMode] = useState<'create' | 'rename'>('create');
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);
  const [chatNameError, setChatNameError] = useState<string | null>(null);
  const [savingChatName, setSavingChatName] = useState(false);
  const savingChatNameRef = React.useRef(false);
  const router = useRouter();

  const openCreateModal = () => {
    setChatNameModalMode('create');
    setRenameTarget(null);
    setChatNameError(null);
    setChatNameModalOpen(true);
  };

  const openRenameModal = (session: ChatSession) => {
    setChatNameModalMode('rename');
    setRenameTarget(session);
    setChatNameError(null);
    setChatNameModalOpen(true);
  };

  const saveChatName = async (projectTitle: string) => {
    if (savingChatNameRef.current) return;
    savingChatNameRef.current = true;
    setSavingChatName(true);
    try {
      if (chatNameModalMode === 'rename' && renameTarget) {
        const updated = await turbohermes.renameChatSession(renameTarget.id, projectTitle);
        setRecentChats((items) => items.map((item) => item.id === updated.id ? updated : item));
        window.dispatchEvent(new CustomEvent('hermes:chat-session-updated', { detail: { session: updated } }));
      } else {
        const session = await turbohermes.createChatSession('plan', projectTitle);
        setRecentChats((items) => [session, ...items.filter((item) => item.id !== session.id)].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));
        setRecentChatsLoaded(true);
        const target = `/turbohermes/chat?session=${encodeURIComponent(session.id)}`;
        router.push(target);
      }
      setChatNameModalOpen(false);
      setChatNameError(null);
    } catch (cause) {
      setChatNameError(cause instanceof Error ? cause.message : 'Unable to save this chat name.');
    } finally {
      savingChatNameRef.current = false;
      setSavingChatName(false);
    }
  };
  const [recentChatsUnavailable, setRecentChatsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    turbohermes.chatSessions().then((items) => {
      if (cancelled) return;
      setRecentChats([...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));
      setRecentChatsLoaded(true);
    }).catch(() => {
      if (!cancelled) setRecentChatsUnavailable(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleSessionUpdated = (event: Event) => {
      const session = (event as CustomEvent<{ session?: ChatSession }>).detail?.session;
      if (!session) return;
      setRecentChats((items) => items.map((item) => item.id === session.id ? session : item));
    };
    window.addEventListener('hermes:chat-session-updated', handleSessionUpdated);
    return () => window.removeEventListener('hermes:chat-session-updated', handleSessionUpdated);
  }, []);

  const groups = ['main', 'ops', 'system'];

  return (
    <aside
      className="relative flex h-full flex-col bg-card border-r border-border shrink-0 transition-all duration-300 ease-in-out"
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
                  const isActive = currentPath === item.href || (item.href === '/turbohermes' && currentPath?.startsWith('/turbohermes/'));
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? `${item.label}${item.operational ? '' : ' — not connected'}` : undefined}
                        className={`flex items-center rounded-md transition-all duration-150 relative group
                          ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2 gap-3'}
                          ${item.operational
                            ? (isActive ? 'sidebar-item-active' : 'text-muted-foreground hover:text-foreground sidebar-item-hover')
                            : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'}
                        `}
                      >
                        <span className={`shrink-0 ${item.operational && isActive ? 'text-primary' : ''}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && !item.operational && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" title="Not connected" />
                        )}
                        {collapsed && !item.operational && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-400" />
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
                            {item.label}{item.operational ? '' : ' — not connected'}
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
        {!collapsed && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between px-2"><p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">RECENT CHATS</p><button onClick={openCreateModal} className="rounded px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10" aria-label="Add a new chat">ADD</button></div>
            {recentChats.length > 0 ? <ul className="space-y-0.5">
              {recentChats.map((session) => (
                <li key={`recent-${session.id}`}>
                  <div className="group flex items-center gap-1 rounded-md px-1 transition-colors hover:bg-muted/40">
                    <Link href={`/turbohermes/chat?session=${encodeURIComponent(session.id)}`} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-muted-foreground hover:text-foreground">
                      <Radio size={13} className="shrink-0 text-primary/70" />
                      <span className="truncate text-xs" title={sessionTitle(session)}>{sessionTitle(session)}</span>
                      <span className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${session.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                    </Link>
                    <button type="button" onClick={() => openRenameModal(session)} className="rounded p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Rename ${sessionTitle(session)}`} title={`Rename ${sessionTitle(session)}`}>
                      <Pencil size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul> : <p className="px-3 py-2 text-xs text-muted-foreground">
              {recentChatsLoaded ? 'No recent chats' : recentChatsUnavailable ? 'Recent chats unavailable' : 'Loading recent chats…'}
            </p>}
          </div>
        )}
      </nav>

      <ChatNameModal
        isOpen={chatNameModalOpen}
        title={chatNameModalMode === 'create' ? 'Start a new chat' : 'Rename chat'}
        initialValue={renameTarget ? sessionTitle(renameTarget) : ''}
        submitLabel={chatNameModalMode === 'create' ? 'Create chat' : 'Save name'}
        busy={savingChatName}
        error={chatNameError}
        onClose={() => setChatNameModalOpen(false)}
        onSubmit={saveChatName}
      />

      {/* Bottom section */}
      <div className="border-t border-border p-2">
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
        className="absolute -right-3 top-[72px] hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-150 hover:text-foreground md:flex"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}