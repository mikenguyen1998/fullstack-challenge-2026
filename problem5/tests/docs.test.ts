import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';

const app = createApp();

describe('API docs', () => {
  it('serves an OpenAPI spec that documents every resource operation', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.servers).toEqual([{ url: '/api/v1' }]);
    expect(Object.keys(res.body.paths['/resources'])).toEqual(['get', 'post']);
    expect(Object.keys(res.body.paths['/resources/{id}'])).toEqual(['get', 'put', 'delete']);
  });

  it('serves Swagger UI at /docs', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
