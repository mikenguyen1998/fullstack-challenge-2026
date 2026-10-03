import { prisma } from '@/database/index.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { HttpError } from '@/utils/errors.js';
import { buildPaginationMeta, getPagination } from '@/utils/pagination.js';
import { normalizeSearch } from '@/utils/search.js';

import type {
  CreateResourceBody,
  ListResourcesQuery,
  UpdateResourceBody,
} from './resource.schema.js';

/** Fields returned by the API (`searchName` is an internal search column). */
export const resourceSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ResourceSelect;

export type ResourceDto = Prisma.ResourceGetPayload<{ select: typeof resourceSelect }>;

export const resourceService = {
  async list(query: ListResourcesQuery) {
    const where: Prisma.ResourceWhereInput = query.name
      ? { searchName: { contains: normalizeSearch(query.name) } }
      : {};

    // One transaction so `items` and `total` come from the same snapshot.
    const [items, total] = await prisma.$transaction([
      prisma.resource.findMany({
        where,
        select: resourceSelect,
        // `id` as a tie-breaker keeps pagination stable when sort values are equal.
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
        ...getPagination(query),
      }),
      prisma.resource.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
  },

  async getById(id: number): Promise<ResourceDto> {
    const resource = await prisma.resource.findUnique({ where: { id }, select: resourceSelect });
    if (!resource) throw HttpError.notFound('Resource not found');
    return resource;
  },

  async create(data: CreateResourceBody): Promise<ResourceDto> {
    return prisma.resource.create({
      data: { ...data, searchName: normalizeSearch(data.name) },
      select: resourceSelect,
    });
  },

  async update(id: number, data: UpdateResourceBody): Promise<ResourceDto> {
    await this.getById(id);
    return prisma.resource.update({
      where: { id },
      data: { ...data, searchName: normalizeSearch(data.name) },
      select: resourceSelect,
    });
  },

  async remove(id: number): Promise<void> {
    await this.getById(id);
    await prisma.resource.delete({ where: { id } });
  },
};
