/// <reference types="vite/client" />

interface ViteTypeOptions {
  // Make `import.meta.env` strict: unknown keys become a type error.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
