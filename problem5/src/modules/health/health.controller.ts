import type { Request, Response } from 'express';

import { success } from '@/utils/response.js';

import { healthService } from './health.service.js';

export const healthController = {
  liveness(_req: Request, res: Response) {
    return success(res, healthService.liveness());
  },

  async readiness(_req: Request, res: Response) {
    const result = await healthService.readiness();
    return success(res, result, {
      message: result.status === 'ok' ? 'OK' : 'Database unavailable',
      statusCode: result.status === 'ok' ? 200 : 503,
    });
  },
};
