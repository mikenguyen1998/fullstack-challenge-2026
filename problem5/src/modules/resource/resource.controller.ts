import type { Request, Response } from 'express';

import { paginated, success } from '@/utils/response.js';

import type {
  CreateResourceBody,
  ListResourcesQuery,
  ResourceIdParams,
  UpdateResourceBody,
} from './resource.schema.js';
import { resourceService } from './resource.service.js';

// `validate` has already parsed and coerced params/query/body by the time these run.
type IdParams = { id: string };
const idOf = (req: Request<IdParams>) => (req.params as unknown as ResourceIdParams).id;

export const resourceController = {
  async list(req: Request, res: Response) {
    const { items, meta } = await resourceService.list(req.query as unknown as ListResourcesQuery);
    return paginated(res, items, meta);
  },

  async getById(req: Request<IdParams>, res: Response) {
    return success(res, await resourceService.getById(idOf(req)));
  },

  async create(req: Request<unknown, unknown, CreateResourceBody>, res: Response) {
    const resource = await resourceService.create(req.body);
    return success(res, resource, { message: 'Resource created', statusCode: 201 });
  },

  async update(req: Request<IdParams, unknown, UpdateResourceBody>, res: Response) {
    const resource = await resourceService.update(idOf(req), req.body);
    return success(res, resource, { message: 'Resource updated' });
  },

  async remove(req: Request<IdParams>, res: Response) {
    await resourceService.remove(idOf(req));
    return success(res, null, { message: 'Resource deleted' });
  },
};
