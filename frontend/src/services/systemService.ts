import type { AppConfig, DbState, Info } from '../types/system';
import httpClient from './httpClient';

export const systemService = {
  getConfig: () => httpClient.get<AppConfig>('/config').then((response) => response.data),
  getInfo: () => httpClient.get<Info>('/info').then((response) => response.data),

  async getDatabaseState(): Promise<DbState> {
    const response = await httpClient.get('/health', { validateStatus: () => true });
    if (response.status === 200) return 'up';
    if (response.status === 503) return 'down';
    throw new Error(`Unexpected status ${response.status}`);
  },
};
