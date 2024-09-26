import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import graphql from '@rollup/plugin-graphql';
import path from 'path';

const host = process.env.TAURI_DEV_HOST;
const port = process.env.VITE_UI_PORT;

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    server: {
      host: host || false,
      port: +(port as string) ||1420,
      strictPort: true,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 1430,
          }
        : undefined,
    },
    build: {
      target: 'esnext'
    },
    resolve: {
      alias: {
        '@state': path.resolve(__dirname, 'src/state')
      }
    },
    plugins: [react(),
    nodePolyfills(),
    graphql(),
    ],
    define: {
      "process.env": {
      },
    },
  })
}