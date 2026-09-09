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

export const vpsNodes: VpsNode[] = [];
export const containers: ContainerRow[] = [];
export const networkServices: NetworkService[] = [];
export const cpuHistory: Array<{ time: string; kvm4: number }> = [];
export const ramHistory: Array<{ time: string; kvm4: number }> = [];