import { Router } from 'express';

import { validate } from '@/middlewares/validate.js';
import { asyncHandler } from '@/utils/async-handler.js';

import { resourceController } from './resource.controller.js';
import {
  createResourceBodySchema,
  listResourcesQuerySchema,
  resourceIdParamsSchema,
  updateResourceBodySchema,
} from './resource.schema.js';

export const resourceRouter: Router = Router();

resourceRouter.get(
  '/',
  validate({ query: listResourcesQuerySchema }),
  asyncHandler(resourceController.list),
);
resourceRouter.post(
  '/',
  validate({ body: createResourceBodySchema }),
  asyncHandler(resourceController.create),
);
resourceRouter.get(
  '/:id',
  validate({ params: resourceIdParamsSchema }),
  asyncHandler(resourceController.getById),
);
resourceRouter.put(
  '/:id',
  validate({ params: resourceIdParamsSchema, body: updateResourceBodySchema }),
  asyncHandler(resourceController.update),
);
resourceRouter.delete(
  '/:id',
  validate({ params: resourceIdParamsSchema }),
  asyncHandler(resourceController.remove),
);
