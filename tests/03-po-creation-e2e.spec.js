const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const PurchaseOrderPage = require('../pages/PurchaseOrderPage');
const testData = require('../test-data/purchase-order-data.json');

test.describe.serial('SAP WebGUI - Purchase Order Creation E2E Flow', () => {

  let page;
  let loginPage;
  let poPage;
  const tc = testData.testCases[0];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    poPage = new PurchaseOrderPage(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Step 1 - Navigate to SAP WebGUI Login Page', async () => {
    await loginPage.navigate(testData.environment.url);
    const userField = page.getByRole('textbox', { name: 'User Required' });
    await expect(userField).toBeVisible();
    await page.screenshot({ path: 'screenshots/e2e-step1-login-page.png', fullPage: true });
  });

  test('Step 2 - Login to SAP with valid credentials', async () => {
    await loginPage.login(testData.credentials.username, testData.credentials.password, testData.environment.client);
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    await page.screenshot({ path: 'screenshots/e2e-step2-logged-in.png', fullPage: true });
  });

  test('Step 3 - Navigate to ME21N (Create Purchase Order)', async () => {
    await poPage.navigateToME21N();
    const heading = page.getByRole('heading', { name: 'Create Purchase Order' });
    await expect(heading).toBeVisible();
    await page.screenshot({ path: 'screenshots/e2e-step3-me21n.png', fullPage: true });
  });

  test('Step 4 - Fill Supplier Details', async () => {
    await poPage.fillSupplier(tc.header.supplier);
    await page.screenshot({ path: 'screenshots/e2e-step4-supplier.png', fullPage: true });
  });

  test('Step 5 - Fill Organization Data (Purch Org, Group, Company Code)', async () => {
    await poPage.expandHeader();
    await poPage.fillOrgData(tc.header.purchOrg, tc.header.purchGroup, tc.header.companyCode);
    await page.screenshot({ path: 'screenshots/e2e-step5-org-data.png', fullPage: true });
  });

  test('Step 6 - Fill Line Item Details (Material, Qty, Date, Price, Plant)', async () => {
    await poPage.fillAllItems(tc.items);
    await page.screenshot({ path: 'screenshots/e2e-step6-line-items.png', fullPage: true });
  });

  test('Step 7 - Save Purchase Order', async () => {
    await poPage.save();
    const msg = await poPage.getMessageBarText();
    console.log(`Result: ${msg}`);
    expect(msg).toBeTruthy();

    const poNumber = await poPage.extractPONumber(msg);
    if (poNumber) {
      console.log(`PO Number Created: ${poNumber}`);
    }
    await page.screenshot({ path: 'screenshots/e2e-step7-po-created.png', fullPage: true });
  });

});
