import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from 'vite-plugin-dts'
import path from 'node:path';
import postcss from 'rollup-plugin-postcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    nodePolyfills(),
    dts({
      include: ["src"],
      insertTypesEntry: true,
    })
  ],
  build: {
    copyPublicDir: false,
    lib: {
      name: "Habit/Fract Design System",
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd', 'react/jsx-runtime', 'tailwindcss'],
      output: {
        preserveModules: true,
        exports: "named",
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: [
        postcss({
          extract: true,
          modules: true,
          extensions: ['css']
        })
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  define: {
    "process.env": {},
  }
})