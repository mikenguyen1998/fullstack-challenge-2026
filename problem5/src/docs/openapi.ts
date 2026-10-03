import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  type ResponseConfig,
} from '@asteasolutions/zod-to-openapi';

import { env } from '@/config/env.js';
import {
  createResourceBodySchema,
  listResourcesQuerySchema,
  resourceIdParamsSchema,
  updateResourceBodySchema,
} from '@/modules/resource/resource.schema.js';

import { z } from './zod.js';

const registry = new OpenAPIRegistry();

// ---------- Shared schemas (match what the API really returns) ----------
const Resource = registry.register(
  'Resource',
  z.object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'Report.pdf' }),
    description: z.string().nullable().openapi({ example: 'Q3 numbers' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
);

const PaginationMeta = registry.register(
  'PaginationMeta',
  z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
);

const ApiError = registry.register(
  'ApiError',
  z.object({
    success: z.literal(false),
    message: z.string(),
    error: z.object({ code: z.string(), details: z.unknown().optional() }),
    requestId: z.string(),
  }),
);

// Every success response uses the { success, message, data } envelope.
const ok = <T extends z.ZodType>(data: T, description: string): ResponseConfig => ({
  description,
  content: {
    'application/json': {
      schema: z.object({ success: z.literal(true), message: z.string(), data }),
    },
  },
});
const error = (description: string): ResponseConfig => ({
  description,
  content: { 'application/json': { schema: ApiError } },
});
const json = <T extends z.ZodType>(schema: T) => ({ content: { 'application/json': { schema } } });

// ---------- Paths (OpenAPI uses {id}, not Express's :id) ----------
registry.registerPath({
  method: 'get',
  path: '/resources',
  tags: ['Resources'],
  summary: 'List resources',
  description: '`name` matches names that contain the text, ignoring case and accents.',
  request: { query: listResourcesQuerySchema },
  responses: {
    200: {
      description: 'A page of resources',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
            data: z.array(Resource),
            meta: z.object({ pagination: PaginationMeta }),
          }),
        },
      },
    },
    422: error('Invalid query'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/resources',
  tags: ['Resources'],
  summary: 'Create a resource',
  request: { body: json(createResourceBodySchema) },
  responses: { 201: ok(Resource, 'Created'), 422: error('Invalid body') },
});

registry.registerPath({
  method: 'get',
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Get a resource',
  request: { params: resourceIdParamsSchema },
  responses: {
    200: ok(Resource, 'The resource'),
    404: error('Not found'),
    422: error('Invalid id'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Update a resource',
  description: '`description` is left unchanged when omitted.',
  request: { params: resourceIdParamsSchema, body: json(updateResourceBodySchema) },
  responses: {
    200: ok(Resource, 'Updated'),
    404: error('Not found'),
    422: error('Invalid id or body'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Delete a resource',
  request: { params: resourceIdParamsSchema },
  responses: { 200: ok(z.null(), 'Deleted'), 404: error('Not found'), 422: error('Invalid id') },
});

registry.registerPath({
  method: 'get',
  path: '/health/ready',
  tags: ['Health'],
  summary: 'Readiness (checks the database)',
  responses: {
    200: ok(z.object({ status: z.string() }), 'Ready'),
    503: ok(z.object({ status: z.string() }), 'Database unavailable'),
  },
});

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: '3.1.0',
  info: { title: 'Resource API', version: '1.0.0' },
  servers: [{ url: env.API_PREFIX }], // so "Try it out" calls /api/v1/...
});
