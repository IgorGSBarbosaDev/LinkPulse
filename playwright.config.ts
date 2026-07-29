import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'npm run dev -w apps/api',
      url: 'http://127.0.0.1:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://linkpulse:linkpulse@localhost:55432/linkpulse',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'e2e-test-secret-with-more-than-16-chars',
        APP_BASE_URL: 'http://127.0.0.1:3000',
        FRONTEND_URL: 'http://127.0.0.1:5173',
        RATE_LIMIT_REGISTER_MAX: '1000',
        RATE_LIMIT_LOGIN_MAX: '1000',
        RATE_LIMIT_CREATE_LINK_MAX: '1000',
      },
    },
    {
      command: 'npm run dev -w apps/web -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_BASE_URL: 'http://127.0.0.1:3000',
        VITE_APP_NAME: 'LinkPulse',
      },
    },
  ],
})
