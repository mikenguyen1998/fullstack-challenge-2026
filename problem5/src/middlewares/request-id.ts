import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

const HEADER = 'X-Request-Id';
const VALID_ID = /^[\w-]{1,128}$/;

/** Reuses an incoming X-Request-Id (if safe) or generates a new UUID. */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get(HEADER);
  const id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  req.id = id;
  res.setHeader(HEADER, id);
  next();
};
