import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Adds `.openapi()` to every Zod schema. Import `z` from here wherever docs metadata is needed.
extendZodWithOpenApi(z);

export { z };
