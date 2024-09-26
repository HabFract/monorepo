import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from 'vite-plugin-dts'
import postcss from 'rollup-plugin-postcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: './src/index.ts',
      name: 'HabitFractDesignSystem',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd', 'react/jsx-runtime', 'tailwindcss'],
      output: {
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