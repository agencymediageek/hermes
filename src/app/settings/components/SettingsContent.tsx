'use client';
import React, { useState } from 'react';
import {
  Users,
  Settings,
  KeyRound,
  Plug,
  Bell,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  GitBranch,
  Globe,
  Cpu,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  initials: string;
  status: 'active' | 'invited';
  lastSeen: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  detail?: string;
}

const teamMembers: TeamMember[] = [];

const roleColors: Record<TeamMember['role'], string> = {
  owner: 'text-primary bg-primary/10 border-primary/20',
  admin: 'text-accent bg-accent/10 border-accent/20',
  developer: 'text-success bg-success/10 border-success/20',
  viewer: 'text-muted-foreground bg-muted/20 border-border',
};

const TABS = [
  { id: 'general', label: 'General', icon: <Settings size={15} /> },
  { id: 'team', label: 'Team', icon: <Users size={15} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={15} /> },
  { id: 'secrets', label: 'Global Secrets', icon: <KeyRound size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
];

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState('general');

  // General settings state
  const [orgName, setOrgName] = useState('Hermes');
  const [defaultNode, setDefaultNode] = useState('hermes-kvm4');
  const [defaultImage, setDefaultImage] = useState('ghcr.io/outsourc-e/hermes-workspace:latest');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [workspaceTimeout, setWorkspaceTimeout] = useState('120');
  const [autoSuspend, setAutoSuspend] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);

  // Secrets state
  const [secrets, setSecrets] = useState<Array<{ id: string; key: string; value: string; visible: boolean }>>([]);

  // Notification state
  const [notifApprovals, setNotifApprovals] = useState(true);
  const [notifErrors, setNotifErrors] = useState(true);
  const [notifBuilds, setNotifBuilds] = useState(false);
  const [notifEmail, setNotifEmail] = useState('admin@hermes.local');

  const integrations: Integration[] = [];

  const handleSaveGeneral = () => {
    toast?.success('General settings saved');
  };

  const toggleSecretVisibility = (id: string) => {
    setSecrets((prev) => prev.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const deleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    toast?.success('Secret removed');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your Hermes workspace configuration</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar tabs */}
        <nav className="w-52 shrink-0 border-r border-border py-4 px-2 space-y-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150
                ${activeTab === tab.id
                  ? 'sidebar-item-active' :'text-muted-foreground hover:text-foreground sidebar-item-hover'
                }`}
            >
              <span className={activeTab === tab.id ? 'text-primary' : ''}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={12} className="ml-auto text-primary" />}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 overflow-auto px-8 py-6">

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Organization Name</label>
                    <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="input-base w-full px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Default VPS Node</label>
                      <select value={defaultNode} onChange={(e) => setDefaultNode(e.target.value)} className="input-base w-full px-3 py-2 text-sm appearance-none">
                        <option value="hermes-kvm4">hermes-kvm4 (KVM4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Default Container Image</label>
                      <input value={defaultImage} onChange={(e) => setDefaultImage(e.target.value)} className="input-base w-full px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Default Branch</label>
                      <input value={defaultBranch} onChange={(e) => setDefaultBranch(e.target.value)} className="input-base w-full px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Workspace Timeout (min)</label>
                      <input type="number" value={workspaceTimeout} onChange={(e) => setWorkspaceTimeout(e.target.value)} className="input-base w-full px-3 py-2 text-sm" min="15" max="480" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Security &amp; Approval</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-suspend idle workspaces</p>
                      <p className="text-xs text-muted-foreground">Suspend after {workspaceTimeout} min of inactivity</p>
                    </div>
                    <button
                      onClick={() => setAutoSuspend(!autoSuspend)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${autoSuspend ? 'bg-primary' : 'bg-muted'}`}
                      style={{ height: 22 }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${autoSuspend ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-foreground">Require approval for merge to main</p>
                      <p className="text-xs text-muted-foreground">Agent cannot merge without human approval</p>
                    </div>
                    <button
                      onClick={() => setRequireApproval(!requireApproval)}
                      className={`relative w-10 rounded-full transition-colors duration-200 ${requireApproval ? 'bg-primary' : 'bg-muted'}`}
                      style={{ height: 22 }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${requireApproval ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                </div>
              </div>

              <button onClick={handleSaveGeneral} className="btn-primary text-sm px-4 py-2">
                <Save size={14} />
                Save Changes
              </button>
            </div>
          )}

          {/* ── TEAM ── */}
          {activeTab === 'team' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Team Members</h2>
                <button className="btn-primary text-sm px-3 py-2">
                  <Plus size={14} />
                  Invite Member
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
                {teamMembers.map((member, i) => (
                  <div key={member.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < teamMembers.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/20 transition-colors duration-100`}>
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        {member.status === 'invited' && (
                          <span className="text-2xs text-muted-foreground bg-muted/30 border border-border rounded px-1.5 py-0.5">Invited</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                      <span className={`text-2xs font-medium border rounded px-1.5 py-0.5 ${roleColors[member.role]}`}>
                        {member.role}
                      </span>
                      {member.role !== 'owner' && (
                        <button className="text-muted-foreground hover:text-danger transition-colors duration-150 p-1">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 border border-primary/15 rounded-xl flex items-start gap-2">
                <Shield size={14} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Role permissions:</span> Owner can manage billing and delete org. Admin can manage team and integrations. Developer can create/edit workspaces. Viewer has read-only access.
                </p>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {activeTab === 'integrations' && (
            <div className="max-w-2xl">
              <h2 className="text-base font-semibold text-foreground mb-4">Integrations</h2>
              <div className="space-y-3">
                {integrations.map((intg) => (
                  <div key={intg.id} className={`bg-card border rounded-xl p-4 card-glow flex items-center gap-4 ${intg.status === 'connected' ? 'border-border' : 'border-border opacity-70'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${intg.status === 'connected' ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'}`}>
                      {intg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{intg.name}</p>
                        {intg.status === 'connected' ? (
                          <span className="inline-flex items-center gap-1 text-2xs font-medium text-success bg-success/10 border border-success/20 rounded px-1.5 py-0.5">
                            <CheckCircle2 size={10} /> Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-2xs font-medium text-muted-foreground bg-muted/20 border border-border rounded px-1.5 py-0.5">
                            <AlertCircle size={10} /> Not connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{intg.description}</p>
                      {intg.detail && <p className="text-2xs text-muted-foreground/70 mt-0.5 font-mono">{intg.detail}</p>}
                    </div>
                    <button className={`shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-150 border ${intg.status === 'connected' ? 'btn-secondary' : 'btn-primary'}`}>
                      {intg.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GLOBAL SECRETS ── */}
          {activeTab === 'secrets' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Global Secrets</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Injected into all workspaces as environment variables</p>
                </div>
                <button className="btn-primary text-sm px-3 py-2">
                  <Plus size={14} />
                  Add Secret
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
                {secrets.map((secret, i) => (
                  <div key={secret.id} className={`flex items-center gap-3 px-4 py-3 ${i < secrets.length - 1 ? 'border-b border-border' : ''}`}>
                    <KeyRound size={14} className="text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium text-foreground">{secret.key}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {secret.visible ? secret.value : '••••••••••••••••••••••••••••'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSecretVisibility(secret.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150 rounded"
                        title={secret.visible ? 'Hide' : 'Show'}
                      >
                        {secret.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => deleteSecret(secret.id)}
                        className="p-1.5 text-muted-foreground hover:text-danger transition-colors duration-150 rounded"
                        title="Delete secret"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Global secrets are encrypted at rest and injected at container start. They cannot be read by agents — only referenced by key name.
                </p>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>

              <div className="bg-card border border-border rounded-xl p-5 card-glow space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Events</h3>
                {[
                  { label: 'Approval requests', sub: 'Notify when agent requests merge or deploy approval', value: notifApprovals, set: setNotifApprovals },
                  { label: 'Agent errors', sub: 'Notify on failed commands, build errors, or crashes', value: notifErrors, set: setNotifErrors },
                  { label: 'Build completions', sub: 'Notify when a build or deploy finishes', value: notifBuilds, set: setNotifBuilds },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => item.set(!item.value)}
                      className={`relative rounded-full transition-colors duration-200 ${item.value ? 'bg-primary' : 'bg-muted'}`}
                      style={{ width: 40, height: 22 }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 card-glow">
                <h3 className="text-sm font-semibold text-foreground mb-3">Notification Email</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.value)}
                    className="input-base flex-1 px-3 py-2 text-sm"
                  />
                  <button onClick={() => toast?.success('Notification email saved')} className="btn-primary text-sm px-4 py-2">
                    <Save size={14} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
