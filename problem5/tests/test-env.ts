/** Separate SQLite file for tests, so `npm test` never touches dev.db. */
export const TEST_DATABASE_URL = 'file:./prisma/test.db';
