import fs from 'fs';
import os from 'os';
import { systemRepository } from '../repositories/system.repository';

import type { MemoryLimit, SystemInfo } from '../types/system';

export function formatBytes(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function readMemoryLimit(): MemoryLimit {
  const files = ['/sys/fs/cgroup/memory.max', '/sys/fs/cgroup/memory/memory.limit_in_bytes'];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8').trim();
      if (raw === 'max') return { memoryLimitBytes: null, memoryLimit: 'unlimited' };
      const bytes = Number(raw);
      if (!Number.isFinite(bytes)) continue;
      if (bytes >= os.totalmem() * 4) return { memoryLimitBytes: null, memoryLimit: 'unlimited' };
      return { memoryLimitBytes: bytes, memoryLimit: formatBytes(bytes) };
    } catch {
      // try next file
    }
  }
  return { memoryLimitBytes: null, memoryLimit: 'n/a' };
}

export function databaseHost(): string {
  try {
    return new URL(process.env.DATABASE_URL ?? '').hostname;
  } catch {
    return 'n/a';
  }
}

async function readDatabaseStatus(): Promise<'up' | 'down'> {
  try {
    await systemRepository.ping();
    return 'up';
  } catch {
    return 'down';
  }
}

export async function getInfo(): Promise<SystemInfo> {
  return {
    hostname: os.hostname(),
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: { processRssBytes: process.memoryUsage().rss },
    ...readMemoryLimit(),
    databaseHost: databaseHost(),
    database: { status: await readDatabaseStatus() },
  };
}
