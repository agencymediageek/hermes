import { execSync, exec } from 'node:child_process';

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
}

export interface ContainerStats {
  containerId: string;
  name: string;
  cpuPercent: string;
  memUsage: string;
  memPercent: string;
  netIO: string;
  blockIO: string;
}

export function dockerPs(): ContainerInfo[] {
  try {
    const output = execSync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}|{{.Ports}}|{{.CreatedAt}}"',
      { timeout: 10000, encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [id, name, image, status, state, ports, created] = line.split('|');
      return { id, name, image, status, state, ports, created };
    });
  } catch (e) {
    console.error('[docker] ps failed:', (e as Error).message);
    return [];
  }
}

export function dockerStats(): ContainerStats[] {
  try {
    const output = execSync(
      'docker stats --no-stream --format "{{.ID}}|{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}"',
      { timeout: 15000, encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [containerId, name, cpuPercent, memUsage, memPercent, netIO, blockIO] = line.split('|');
      return { containerId, name, cpuPercent, memUsage, memPercent, netIO, blockIO };
    });
  } catch (e) {
    console.error('[docker] stats failed:', (e as Error).message);
    return [];
  }
}

export function dockerExec(command: string): string {
  try {
    return execSync(command, { timeout: 30000, encoding: 'utf-8' }).trim();
  } catch (e) {
    throw new Error(`Docker command failed: ${(e as Error).message}`);
  }
}

export function startContainer(containerId: string): void {
  dockerExec(`docker start ${containerId}`);
}

export function stopContainer(containerId: string): void {
  dockerExec(`docker stop ${containerId}`);
}

export function restartContainer(containerId: string): void {
  dockerExec(`docker restart ${containerId}`);
}

export function removeContainer(containerId: string): void {
  dockerExec(`docker rm -f ${containerId}`);
}

export function createContainer(name: string, image: string, env: Record<string, string> = {}): string {
  const envFlags = Object.entries(env).map(([k, v]) => `-e ${k}="${v}"`).join(' ');
  const output = dockerExec(
    `docker create --name ${name} ${envFlags} ${image}`
  );
  return output; // returns container ID
}
