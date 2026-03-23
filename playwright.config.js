const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 30000,
  },
  use: {
    baseURL: 'https://44.197.54.157:44300',
    ignoreHTTPSErrors: true,
    headless: false,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 30000,
    navigationTimeout: 60000,
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  retries: 0,
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
});
