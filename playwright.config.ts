import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration
 * Applied E2E Skill recommendations:
 * - Proper timeouts for async operations
 * - Multiple browser configs (Chromium, Firefox)
 * - Screenshots on failure
 * - Video recording for debugging
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  
  use: {
    // Navigate to local dev server
    baseURL: 'http://localhost:5173',
    
    // Capture traces
    trace: 'on-first-retry',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Global timeout settings
  timeout: 30 * 1000,
  globalTimeout: 10 * 60 * 1000,
})
