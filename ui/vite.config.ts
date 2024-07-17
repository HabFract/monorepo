import { internalIpV4Sync } from "internal-ip";
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import graphql from '@rollup/plugin-graphql';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    server: {
      host: "0.0.0.0",
      port: process.env.VITE_NODE_ENV == 'dev' ? parseInt(process.env.VITE_UI_PORT as string) : 1420,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: internalIpV4Sync(),
        port: 1421,
      }
    },
    build: {
      target: 'esnext'
    },
    plugins: [react(),
    nodePolyfills(),
    graphql()
    ],
    define: {
      "process.env": {
      },
    },
  })
}