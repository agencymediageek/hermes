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
    id: 'node-kvm8',
    name: 'hermes-kvm8',
    type: 'KVM8',
    ip: '192.168.1.10',
    location: 'São Paulo, BR',
    cpu: { cores: 8, used: 52 },
    ram: { totalGb: 32, usedGb: 14.8 },
    disk: { totalGb: 400, usedGb: 124 },
    uptime: '14d 6h 22m',
    status: 'healthy',
    os: 'Ubuntu 22.04 LTS',
    kernel: '5.15.0-91-generic',
  },
  {
    id: 'node-kvm16',
    name: 'hermes-kvm16',
    type: 'KVM16',
    ip: '192.168.1.11',
    location: 'São Paulo, BR',
    cpu: { cores: 16, used: 18 },
    ram: { totalGb: 64, usedGb: 9.2 },
    disk: { totalGb: 800, usedGb: 41 },
    uptime: '7d 2h 05m',
    status: 'healthy',
    os: 'Ubuntu 22.04 LTS',
    kernel: '5.15.0-91-generic',
  },
];

export const containers: ContainerRow[] = [
  { id: 'c-001', containerId: 'd8f3a91c2b44', workspaceName: 'hermes-api', image: 'hermes/node20-base:1.4', status: 'running', cpu: 42, ramMb: 512, ports: '3001:3001', uptime: '4h 22m', nodeId: 'node-kvm8' },
  { id: 'c-002', containerId: 'a1e9b72f3c88', workspaceName: 'hermes-panel', image: 'hermes/node20-base:1.4', status: 'running', cpu: 78, ramMb: 1024, ports: '3000:3000', uptime: '2h 07m', nodeId: 'node-kvm8' },
  { id: 'c-003', containerId: 'f4c2d05e7a11', workspaceName: 'n8n-workflows', image: 'hermes/node18-base:1.2', status: 'building', cpu: 91, ramMb: 768, ports: '5678:5678', uptime: '0h 44m', nodeId: 'node-kvm8' },
  { id: 'c-004', containerId: 'b7a8e31d9f22', workspaceName: 'cloudflare-workers', image: 'hermes/node20-base:1.4', status: 'stopped', cpu: 0, ramMb: 0, ports: '—', uptime: '—', nodeId: 'node-kvm8' },
  { id: 'c-005', containerId: 'e2f1c84b6d55', workspaceName: 'postgres-migrations', image: 'hermes/node20-pg:1.1', status: 'running', cpu: 14, ramMb: 256, ports: '5432:5432', uptime: '1h 53m', nodeId: 'node-kvm8' },
  { id: 'c-006', containerId: '9c3d7a2e1b66', workspaceName: 'openrouter-proxy', image: 'hermes/node20-base:1.4', status: 'building', cpu: 3, ramMb: 128, ports: '8080:8080', uptime: '0h 01m', nodeId: 'node-kvm8' },
  { id: 'c-007', containerId: '3b5f9e8c4a77', workspaceName: 'redis-queue-svc', image: 'redis:7-alpine', status: 'stopped', cpu: 0, ramMb: 0, ports: '6379:6379', uptime: '—', nodeId: 'node-kvm16' },
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
  { time: '00:00', kvm8: 38, kvm16: 12 },
  { time: '00:05', kvm8: 44, kvm16: 14 },
  { time: '00:10', kvm8: 51, kvm16: 15 },
  { time: '00:15', kvm8: 49, kvm16: 13 },
  { time: '00:20', kvm8: 62, kvm16: 18 },
  { time: '00:25', kvm8: 71, kvm16: 20 },
  { time: '00:30', kvm8: 68, kvm16: 17 },
  { time: '00:35', kvm8: 52, kvm16: 18 },
];

export const ramHistory = [
  { time: '00:00', kvm8: 12.1, kvm16: 7.8 },
  { time: '00:05', kvm8: 12.4, kvm16: 8.0 },
  { time: '00:10', kvm8: 13.0, kvm16: 8.2 },
  { time: '00:15', kvm8: 13.5, kvm16: 8.5 },
  { time: '00:20', kvm8: 14.1, kvm16: 8.8 },
  { time: '00:25', kvm8: 14.6, kvm16: 9.0 },
  { time: '00:30', kvm8: 14.9, kvm16: 9.1 },
  { time: '00:35', kvm8: 14.8, kvm16: 9.2 },
];
