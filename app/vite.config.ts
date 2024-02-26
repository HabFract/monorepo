import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import graphql from '@rollup/plugin-graphql';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    build: {
      target: 'esnext'
    },
    plugins: [react(),
    nodePolyfills(),
    graphql()
    ],
    define: {
      "process.env": {},
    },
    server: {
      port: parseInt(process.env.VITE_UI_PORT),
    },
  })
}