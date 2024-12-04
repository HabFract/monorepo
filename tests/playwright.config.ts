import { defineConfig, devices } from '@playwright/test';
import { TEST_ENV } from './e2e/setup';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    // Base URL for your Tauri app
    baseURL: `http://localhost:${TEST_ENV.APP_WS_PORT}`,
    trace: 'on-first-retry',
    // Enable screenshots on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Configure webview context
        contextOptions: {
          viewport: { width: 393, height: 851 },
        },
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});