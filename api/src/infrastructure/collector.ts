import { getCpuInfo, getMemInfo } from './system.js';

interface HistoryPoint {
  timestamp: string;
  cpu: number;
  memory: number;
}

const MAX_POINTS = 60;
const INTERVAL_MS = 30_000;

const history: HistoryPoint[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

function collect(): void {
  const cpu = getCpuInfo();
  const mem = getMemInfo();
  history.push({
    timestamp: new Date().toISOString(),
    cpu: cpu.usagePercent,
    memory: mem.usagePercent,
  });
  if (history.length > MAX_POINTS) {
    history.splice(0, history.length - MAX_POINTS);
  }
}

export function startCollector(): void {
  if (intervalId) return;
  collect(); // immediate first point
  intervalId = setInterval(collect, INTERVAL_MS);
  console.log('[collector] Started CPU/RAM history collection (every 30s)');
}

export function stopCollector(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function getHistory(): HistoryPoint[] {
  return [...history];
}
