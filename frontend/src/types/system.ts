import type { LucideIcon } from 'lucide-react';
export type DbState = 'up' | 'down';

export interface AppConfig {
  uploadsEnabled: boolean;
  maxImageBytes: number;
}

export interface Info {
  hostname: string;
  pid: number;
  uptimeSeconds: number;
  memory: { processRssBytes: number };
  memoryLimitBytes: number | null;
  memoryLimit: string;
  databaseHost: string;
  database: {
    status: 'up' | 'down';
  };
}

export type HealthState = DbState | 'unreachable' | 'checking';

export interface StatProps {
  label: string;
  value: string | number;
  Icon: LucideIcon;
}

export interface BarProps {
  percent: number;
  label: string;
}

export interface SystemViewProps {
  enabled?: boolean;
}
