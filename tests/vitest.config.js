import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    server: {
      deps: {
        inline: ["@apollo/client"]
      }
    },
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.tsx'],
  },
})
