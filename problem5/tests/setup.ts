import { TEST_DATABASE_URL } from './test-env.js';

// Test environment — set before any app module (and env validation) is imported.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.RATE_LIMIT_MAX = '10000';
process.env.DOCS_ENABLED = 'true';
