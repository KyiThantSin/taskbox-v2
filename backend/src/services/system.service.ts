import { MAX_IMAGE_BYTES } from '../config/uploads';
import { isCloudinaryConfigured } from '../integrations/cloudinary/client';
import { systemRepository } from '../repositories/system.repository';
import { getInfo } from './info.service';

export const systemService = {
  async getHealth() {
    try {
      await systemRepository.ping();
      return { status: 'ok', database: 'up', uptimeSeconds: Math.floor(process.uptime()) };
    } catch {
      return { status: 'error', database: 'down' };
    }
  },

  async getInfo() {
    return getInfo();
  },

  getConfig() {
    return { uploadsEnabled: isCloudinaryConfigured, maxImageBytes: MAX_IMAGE_BYTES };
  },
};
