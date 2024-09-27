/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly env: {
    VITE_NODE_ENV: string;
    readonly VITE_ADMIN_PORT: string;
    readonly VITE_APP_PORT: string;
  };
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
