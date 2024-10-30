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
    include: ['antd'],
    exclude: ['@ant-design/icons']
  }
});
