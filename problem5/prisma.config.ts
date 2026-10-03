import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Fallback so `npm install` (postinstall → prisma generate) works before .env exists.
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});
