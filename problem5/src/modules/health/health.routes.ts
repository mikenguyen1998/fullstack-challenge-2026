import { Router } from 'express';

import { asyncHandler } from '@/utils/async-handler.js';

import { healthController } from './health.controller.js';

export const healthRouter: Router = Router();

healthRouter.get('/', healthController.liveness);
healthRouter.get('/ready', asyncHandler(healthController.readiness));
