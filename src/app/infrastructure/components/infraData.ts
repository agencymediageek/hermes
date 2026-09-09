export interface VpsNode {
  id: string;
  name: string;
  type: 'KVM8' | 'KVM16' | 'KVM4';
  ip: string;
  location: string;
  cpu: { cores: number; used: number };
  ram: { totalGb: number; usedGb: number };
  disk: { totalGb: number; usedGb: number };
  uptime: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  os: string;
  kernel: string;
}

export interface ContainerRow {
  id: string;
  containerId: string;
  workspaceName: string;
  image: string;
  status: 'running' | 'stopped' | 'building' | 'paused';
  cpu: number;
  ramMb: number;
  ports: string;
  uptime: string;
  nodeId: string;
}

export interface NetworkService {
  id: string;
  name: string;
  type: 'cloudflare_tunnel' | 'nginx' | 'redis' | 'postgres' | 'n8n';
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  detail: string;
}

export const vpsNodes: VpsNode[] = [
  {
    id: 'node-kvm4',
    name: 'hermes-kvm4',
    type: 'KVM4',
    ip: '—',
    location: 'Hostinger',
    cpu: { cores: 4, used: 12 },
    ram: { totalGb: 16, usedGb: 1.1 },
    disk: { totalGb: 200, usedGb: 8 },
    uptime: '0d 0h 37m',
    status: 'healthy',
    os: 'Debian 13 (trixie)',
    kernel: '6.8.0-138-generic',
  },
];

export const containers: ContainerRow[] = [
  { id: 'c-001', containerId: '—', workspaceName: 'hermes-panel', image: 'node:20-slim', status: 'running', cpu: 5, ramMb: 256, ports: '4028:4028', uptime: '0h 01m', nodeId: 'node-kvm4' },
];

export const networkServices: NetworkService[] = [
  { id: 'svc-001', name: 'Cloudflare Tunnel (KVM8)', type: 'cloudflare_tunnel', status: 'up', latencyMs: 12, detail: 'Routing 6 workspace tunnels' },
  { id: 'svc-002', name: 'Cloudflare Tunnel (KVM16)', type: 'cloudflare_tunnel', status: 'up', latencyMs: 14, detail: 'Routing 1 workspace tunnel' },
  { id: 'svc-003', name: 'Nginx Reverse Proxy', type: 'nginx', status: 'up', latencyMs: 3, detail: 'Serving panel + API on :443' },
  { id: 'svc-004', name: 'Redis (Queue)', type: 'redis', status: 'up', latencyMs: 1, detail: 'n8n queue mode, 0 pending jobs' },
  { id: 'svc-005', name: 'PostgreSQL', type: 'postgres', status: 'up', latencyMs: 4, detail: 'hermes_dev — 14 active connections' },
  { id: 'svc-006', name: 'n8n Orchestrator', type: 'n8n', status: 'degraded', latencyMs: 280, detail: 'High latency — 3 workflows queued' },
];

export const cpuHistory = [
  { time: '00:00', kvm4: 8 },
  { time: '00:05', kvm4: 10 },
  { time: '00:10', kvm4: 12 },
  { time: '00:15', kvm4: 9 },
  { time: '00:20', kvm4: 11 },
  { time: '00:25', kvm4: 14 },
  { time: '00:30', kvm4: 12 },
  { time: '00:35', kvm4: 12 },
];

export const ramHistory = [
  { time: '00:00', kvm4: 1.0 },
  { time: '00:05', kvm4: 1.0 },
  { time: '00:10', kvm4: 1.1 },
  { time: '00:15', kvm4: 1.1 },
  { time: '00:20', kvm4: 1.1 },
  { time: '00:25', kvm4: 1.1 },
  { time: '00:30', kvm4: 1.1 },
  { time: '00:35', kvm4: 1.1 },
];
