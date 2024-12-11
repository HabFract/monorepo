import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      '@state': path.resolve(__dirname, '../ui/src/state')
    }
  },
  plugins: [react()],
  test: {
    server: {
      deps: {
        inline: ["@apollo/client"],
      },
    },
    setupFiles: ["./setup.ts"],
    environment: "jsdom",
    globals: true,
    include: ["**/*.test.tsx"],
  },
});
