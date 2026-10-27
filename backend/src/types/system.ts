export interface MemoryLimit {
  memoryLimitBytes: number | null;
  memoryLimit: string;
}

export interface SystemInfo extends MemoryLimit {
  hostname: string;
  pid: number;
  uptimeSeconds: number;
  memory: { processRssBytes: number };
  databaseHost: string;
  database: { status: 'up' | 'down' };
}
