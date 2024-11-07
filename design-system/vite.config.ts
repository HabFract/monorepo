import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import postcss from "rollup-plugin-postcss";
import path from "path";

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
      entry: "./src/index.ts",
      name: "HabitFractDesignSystem",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "antd",
        "react/jsx-runtime",
        "tailwindcss",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      plugins: [
        postcss({
          extract: true,
          modules: true,
          extensions: ["css"],
        }),
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../ui"),
    },
  },
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: [
      '@ant-design/cssinjs',
      'classnames',
      'rc-util',
      'rc-util/lib/hooks/useState',
      '@babel/runtime/helpers/esm/slicedToArray',
      '@ctrl/tinycolor',
      '@ant-design/colors',
      '@ant-design/icons',
      'rc-motion',
      'rc-util/lib/hooks/useLayoutEffect',
      'rc-util/lib/ref',
      'rc-util/lib/Dom/addEventListener',
      'rc-util/lib/Dom/canUseDom',
      'rc-util/lib/hooks/useLayoutUpdateEffect',
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
