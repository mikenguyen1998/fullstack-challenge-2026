import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { prisma } from '@/database/index.js';
import { normalizeSearch } from '@/utils/search.js';

const app = createApp();
const api = '/api/v1/resources';

async function seed(names: string[]) {
  for (const name of names) {
    await prisma.resource.create({ data: { name, searchName: normalizeSearch(name) } });
  }
}

beforeEach(async () => {
  await prisma.resource.deleteMany();
});

describe('POST /resources', () => {
  it('creates a resource and hides the internal searchName', async () => {
    const res = await request(app).post(api).send({ name: '  Report.pdf ', description: 'Q3' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Report.pdf', description: 'Q3' });
    expect(res.body.data).not.toHaveProperty('searchName');
  });

  it.each([
    [{}, 'missing name'],
    [{ name: '' }, 'empty name'],
    [{ name: 123 }, 'name is not a string'],
    [{ name: 'a'.repeat(256) }, 'name too long'],
  ])('rejects %j (%s) with 422', async (body, _label) => {
    const res = await request(app).post(api).send(body);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /resources', () => {
  it('lists all resources with pagination meta', async () => {
    await seed(['a.txt', 'b.txt', 'c.txt']);
    const res = await request(app).get(`${api}?page=1&limit=2`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
      hasNextPage: true,
    });
  });

  it('filters by name, ignoring case and accents', async () => {
    await seed(['Nulla.mp3', 'Báo cáo.docx', 'Other.txt']);

    const byCase = await request(app).get(`${api}?name=NULLA`);
    expect(byCase.body.data.map((r: { name: string }) => r.name)).toEqual(['Nulla.mp3']);

    const byAccent = await request(app).get(`${api}?name=bao cao`);
    expect(byAccent.body.data.map((r: { name: string }) => r.name)).toEqual(['Báo cáo.docx']);
  });

  it('rejects invalid pagination with 422', async () => {
    const res = await request(app).get(`${api}?page=abc&limit=1000`);
    expect(res.status).toBe(422);
  });
});

describe('GET /resources/:id', () => {
  it('returns 404 for a missing id and 422 for a non-numeric id', async () => {
    expect((await request(app).get(`${api}/999`)).status).toBe(404);
    expect((await request(app).get(`${api}/abc`)).status).toBe(422);
  });
});

describe('PUT /resources/:id', () => {
  it('updates the name and keeps search in sync', async () => {
    const created = await request(app).post(api).send({ name: 'old.txt' });
    const id = created.body.data.id;

    const res = await request(app).put(`${api}/${id}`).send({ name: 'Renamed.txt' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed.txt');

    const search = await request(app).get(`${api}?name=renamed`);
    expect(search.body.data).toHaveLength(1);
  });

  it('returns 404 for a missing id and 422 without a name', async () => {
    expect((await request(app).put(`${api}/999`).send({ name: 'x' })).status).toBe(404);
    expect((await request(app).put(`${api}/1`).send({ description: 'x' })).status).toBe(422);
  });
});

describe('DELETE /resources/:id', () => {
  it('deletes, then returns 404 (and the server keeps running)', async () => {
    const created = await request(app).post(api).send({ name: 'temp.txt' });
    const id = created.body.data.id;

    expect((await request(app).delete(`${api}/${id}`)).status).toBe(200);
    expect((await request(app).delete(`${api}/${id}`)).status).toBe(404);
    expect((await request(app).get('/health')).status).toBe(200);
  });
});
