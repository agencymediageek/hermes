import { FastifyInstance } from 'fastify';
import { getCpuInfo, getMemInfo, getDiskInfo, getUptime, getHostname, getLoadAverage } from './system.js';
import { getHistory } from './collector.js';
import { dockerPs, dockerStats } from '../workspaces/docker.js';
import { execSync } from 'node:child_process';

export default async function infrastructureRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /api/infrastructure/nodes
  fastify.get('/api/infrastructure/nodes', async () => {
    const cpu = getCpuInfo();
    const mem = getMemInfo();
    const disks = getDiskInfo();
    const uptime = getUptime();
    const hostname = getHostname();
    const loadAvg = getLoadAverage();

    return {
      nodes: [{
        id: 'node-1',
        hostname,
        status: 'healthy',
        role: 'primary',
        cpu: {
          cores: cpu.cores,
          usagePercent: cpu.usagePercent,
          user: cpu.user,
          system: cpu.system,
        },
        memory: {
          totalMB: mem.totalMB,
          usedMB: mem.usedMB,
          availableMB: mem.availableMB,
          usagePercent: mem.usagePercent,
        },
        disk: disks.map(d => ({
          mountPoint: d.mountPoint,
          totalGB: Math.round(d.sizeMB / 1024 * 10) / 10,
          usedGB: Math.round(d.usedMB / 1024 * 10) / 10,
          availableGB: Math.round(d.availableMB / 1024 * 10) / 10,
          usagePercent: d.usagePercent,
        })),
        uptime,
        loadAverage: loadAvg,
        containers: 0, // will be enriched below
      }],
    };
  });

  // GET /api/infrastructure/containers
  fastify.get('/api/infrastructure/containers', async () => {
    const containers = dockerPs();
    const stats = dockerStats();
    const statsMap = new Map(stats.map(s => [s.containerId.substring(0, 12), s]));

    const enriched = containers.map(c => {
      const stat = statsMap.get(c.id.substring(0, 12));
      return {
        ...c,
        stats: stat ? {
          cpu: stat.cpuPercent,
          memory: stat.memUsage,
          memPercent: stat.memPercent,
          network: stat.netIO,
          blockIO: stat.blockIO,
        } : null,
      };
    });

    return { containers: enriched, total: enriched.length };
  });

  // GET /api/infrastructure/services
  fastify.get('/api/infrastructure/services', async () => {
    const services: Array<{ name: string; status: string; latencyMs: number; details?: string }> = [];

    // Docker
    try {
      const start = Date.now();
      execSync('docker info --format "{{.ServerVersion}}"', { timeout: 5000, encoding: 'utf-8' });
      services.push({ name: 'docker', status: 'healthy', latencyMs: Date.now() - start });
    } catch {
      services.push({ name: 'docker', status: 'unhealthy', latencyMs: 0, details: 'Docker not responding' });
    }

    // Traefik (check if container running)
    try {
      const start = Date.now();
      const output = execSync('docker ps --filter name=traefik --format "{{.Status}}"', { timeout: 5000, encoding: 'utf-8' });
      const isUp = output.trim().toLowerCase().includes('up');
      services.push({ name: 'traefik', status: isUp ? 'healthy' : 'unhealthy', latencyMs: Date.now() - start });
    } catch {
      services.push({ name: 'traefik', status: 'unknown', latencyMs: 0 });
    }

    // Redis
    try {
      const start = Date.now();
      execSync('docker exec $(docker ps -q --filter name=redis) redis-cli ping 2>/dev/null || redis-cli ping 2>/dev/null', { timeout: 5000, encoding: 'utf-8' });
      services.push({ name: 'redis', status: 'healthy', latencyMs: Date.now() - start });
    } catch {
      services.push({ name: 'redis', status: 'not_found', latencyMs: 0, details: 'Redis not available' });
    }

    // Postgres
    try {
      const start = Date.now();
      execSync('docker exec $(docker ps -q --filter name=postgres) pg_isready 2>/dev/null || pg_isready 2>/dev/null', { timeout: 5000, encoding: 'utf-8' });
      services.push({ name: 'postgres', status: 'healthy', latencyMs: Date.now() - start });
    } catch {
      services.push({ name: 'postgres', status: 'not_found', latencyMs: 0, details: 'PostgreSQL not available' });
    }

    // SQLite (always available since we use it)
    services.push({ name: 'sqlite', status: 'healthy', latencyMs: 0, details: 'Embedded database' });

    return { services };
  });

  // GET /api/infrastructure/history
  fastify.get('/api/infrastructure/history', async () => {
    return { history: getHistory() };
  });
}
