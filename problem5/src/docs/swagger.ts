import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './openapi.js';

/** Serves the spec at /openapi.json and Swagger UI at /docs. */
export function setupSwagger(app: Express): void {
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
