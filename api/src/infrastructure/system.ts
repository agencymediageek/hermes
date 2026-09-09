import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

export interface CpuInfo {
  user: number;
  system: number;
  idle: number;
  usagePercent: number;
  cores: number;
}

export interface MemInfo {
  totalMB: number;
  usedMB: number;
  freeMB: number;
  availableMB: number;
  usagePercent: number;
}

export interface DiskInfo {
  filesystem: string;
  sizeMB: number;
  usedMB: number;
  availableMB: number;
  usagePercent: number;
  mountPoint: string;
}

export interface UptimeInfo {
  seconds: number;
  formatted: string;
}

export function getCpuInfo(): CpuInfo {
  try {
    const stat = readFileSync('/proc/stat', 'utf-8');
    const cpuLine = stat.split('\n')[0]; // cpu aggregate
    const parts = cpuLine.split(/\s+/).slice(1).map(Number);
    const [user, nice, system, idle, iowait, irq, softirq] = parts;
    const total = user + nice + system + idle + iowait + irq + softirq;
    const idleTime = idle + iowait;
    const usagePercent = Math.round(((total - idleTime) / total) * 10000) / 100;

    // Count cores
    const coreLines = stat.split('\n').filter(l => /^cpu\d+/.test(l));

    return {
      user: Math.round((user / total) * 10000) / 100,
      system: Math.round((system / total) * 10000) / 100,
      idle: Math.round((idleTime / total) * 10000) / 100,
      usagePercent,
      cores: coreLines.length,
    };
  } catch (e) {
    return { user: 0, system: 0, idle: 100, usagePercent: 0, cores: 1 };
  }
}

export function getMemInfo(): MemInfo {
  try {
    const meminfo = readFileSync('/proc/meminfo', 'utf-8');
    const parse = (key: string): number => {
      const match = meminfo.match(new RegExp(`${key}:\\s+(\\d+)`));
      return match ? parseInt(match[1], 10) : 0;
    };

    const totalKB = parse('MemTotal');
    const freeKB = parse('MemFree');
    const availableKB = parse('MemAvailable');
    const buffersKB = parse('Buffers');
    const cachedKB = parse('Cached');
    const usedKB = totalKB - freeKB - buffersKB - cachedKB;

    const totalMB = Math.round(totalKB / 1024);
    const usedMB = Math.round(usedKB / 1024);
    const freeMB = Math.round(freeKB / 1024);
    const availableMB = Math.round(availableKB / 1024);
    const usagePercent = Math.round((usedKB / totalKB) * 10000) / 100;

    return { totalMB, usedMB, freeMB, availableMB, usagePercent };
  } catch (e) {
    return { totalMB: 0, usedMB: 0, freeMB: 0, availableMB: 0, usagePercent: 0 };
  }
}

export function getDiskInfo(): DiskInfo[] {
  try {
    const output = execSync('df -m --output=source,size,used,avail,pcent,target 2>/dev/null || df -m', {
      encoding: 'utf-8',
      timeout: 5000,
    });
    const lines = output.trim().split('\n').slice(1);
    return lines
      .filter(l => l.startsWith('/'))
      .map(line => {
        const parts = line.split(/\s+/);
        return {
          filesystem: parts[0],
          sizeMB: parseInt(parts[1], 10) || 0,
          usedMB: parseInt(parts[2], 10) || 0,
          availableMB: parseInt(parts[3], 10) || 0,
          usagePercent: parseInt((parts[4] || '0').replace('%', ''), 10),
          mountPoint: parts[5] || '/',
        };
      });
  } catch (e) {
    return [];
  }
}

export function getUptime(): UptimeInfo {
  try {
    const data = readFileSync('/proc/uptime', 'utf-8');
    const seconds = Math.floor(parseFloat(data.split(' ')[0]));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formatted = `${days}d ${hours}h ${minutes}m`;
    return { seconds, formatted };
  } catch (e) {
    return { seconds: 0, formatted: '0d 0h 0m' };
  }
}

export function getHostname(): string {
  try {
    return readFileSync('/etc/hostname', 'utf-8').trim();
  } catch {
    return 'unknown';
  }
}

export function getLoadAverage(): number[] {
  try {
    const load = readFileSync('/proc/loadavg', 'utf-8');
    const parts = load.split(' ');
    return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
  } catch {
    return [0, 0, 0];
  }
}
