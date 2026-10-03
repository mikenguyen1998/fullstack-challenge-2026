import { z } from '@/docs/zod.js';

import { paginationQuerySchema } from '@/utils/pagination.js';

export const resourceIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listResourcesQuerySchema = paginationQuerySchema.extend({
  // Matched against `searchName`, so it's case- and accent-insensitive.
  name: z.string().trim().min(1).max(255).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'id']).default('createdAt'),
});

export const createResourceBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional(),
});

/** PUT: `name` is required; `description` is left unchanged when omitted. */
export const updateResourceBodySchema = createResourceBodySchema;

export type ResourceIdParams = z.infer<typeof resourceIdParamsSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
export type CreateResourceBody = z.infer<typeof createResourceBodySchema>;
export type UpdateResourceBody = z.infer<typeof updateResourceBodySchema>;
