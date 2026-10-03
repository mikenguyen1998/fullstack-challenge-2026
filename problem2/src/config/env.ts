import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Fancy Form'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment variables. Check your .env file.');
}

/** Typed, validated runtime config. Import this instead of `import.meta.env`. */
export const env = {
  appName: parsed.data.VITE_APP_NAME,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;
