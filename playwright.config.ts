import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  use: {
    ...devices['iPhone 14 Pro Max'],
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:5173',
    channel: 'msedge',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
