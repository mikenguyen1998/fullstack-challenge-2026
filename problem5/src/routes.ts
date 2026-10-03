import { Router } from 'express';

import { healthRouter } from '@/modules/health/health.routes.js';
import { resourceRouter } from '@/modules/resource/resource.routes.js';

/** All versioned API routes, mounted under env.API_PREFIX (default /api/v1). */
export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/resources', resourceRouter);
