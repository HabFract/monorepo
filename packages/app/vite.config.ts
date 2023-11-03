import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import graphql from '@rollup/plugin-graphql';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    nodePolyfills(),
    graphql()
  ],
  define: {
    "process.env": {},
  }
})
