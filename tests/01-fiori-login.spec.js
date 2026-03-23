const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const testData = require('../test-data/purchase-order-data.json');

test.describe('SAP WebGUI - Login Tests', () => {

  test('TC_LOGIN_001 - Successful login to SAP', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate(testData.environment.url);
    await loginPage.login(testData.credentials.username, testData.credentials.password, testData.environment.client);

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });
  });

  test('TC_LOGIN_002 - Login with invalid credentials should fail', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate(testData.environment.url);

    await page.getByRole('textbox', { name: 'User Required' }).fill('VOLTUS');
    await page.getByRole('textbox', { name: 'Password Required' }).fill('WrongPassword123');
    await page.getByRole('button', { name: 'Log On Emphasized' }).click();
    await page.waitForTimeout(3000);

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg).toContain('not correct');

    await page.screenshot({ path: 'screenshots/login-failure.png', fullPage: true });
  });
});
