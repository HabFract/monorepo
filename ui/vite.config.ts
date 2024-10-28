import dts from "vite-plugin-dts";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";

const host = process.env.TAURI_DEV_HOST;
const port = process.env.VITE_UI_PORT;

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    server: {
      host: host || false,
      port: +(port as string) || 1420,
      strictPort: true,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1430,
          }
        : undefined,
    },
    build: {
      lib: {
        entry: "./src/state/index.ts",
        name: "HabitFractState",
        formats: ["es"],
        fileName: (format) => `state.${format}.js`,
      },
      target: "esnext",
      rollupOptions: {
        input: {
          main: "././index.html",
          state: "./src/state/index.ts",
        },
        output: {
          inlineDynamicImports: false,
          dir: "dist",
          format: "es",
          entryFileNames: "[name].[format].js",
          chunkFileNames: "[name].[format].js",
          assetFileNames: "[name].[ext]",
        },
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        },
      },
    },
    resolve: {
      alias: {
        "@state": path.resolve(__dirname, "src/state"),
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
    ],
    define: {
      "process.env": {},
      esbuild: {
        tsconfig: "tsconfig.build.json", // Ensure Vite uses the correct tsconfig
      },
    },
  });
};
