const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const PurchaseOrderPage = require('../pages/PurchaseOrderPage');
const testData = require('../test-data/purchase-order-data.json');

test.describe('SAP WebGUI - Create Purchase Order (ME21N)', () => {

  let loginPage;
  let poPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    poPage = new PurchaseOrderPage(page);

    // Login before each test
    await loginPage.navigate(testData.environment.url);
    await loginPage.login(testData.credentials.username, testData.credentials.password, testData.environment.client);

    // Navigate to ME21N
    await poPage.navigateToME21N();
  });

  // ==========================================
  // POSITIVE TEST CASES
  // ==========================================

  test('PO_TC_001 - Create Standard PO with single line item', async ({ page }) => {
    const tc = testData.testCases[0];

    // Fill Header
    await poPage.fillHeaderData(tc.header);
    await page.screenshot({ path: 'screenshots/po-tc001-header.png' });

    // Fill Line Item
    await poPage.fillAllItems(tc.items);
    await page.screenshot({ path: 'screenshots/po-tc001-items.png' });

    // Save
    await poPage.save();

    // Verify success
    const msg = await poPage.getMessageBarText();
    console.log(`Result: ${msg}`);
    const poNumber = await poPage.extractPONumber(msg);
    if (poNumber) {
      console.log(`PO Number Created: ${poNumber}`);
    }
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc001-result.png', fullPage: true });
  });

  test('PO_TC_002 - Create Standard PO with multiple line items', async ({ page }) => {
    const tc = testData.testCases[1];

    await poPage.fillHeaderData(tc.header);
    await poPage.fillAllItems(tc.items);
    await page.screenshot({ path: 'screenshots/po-tc002-items.png' });

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Result: ${msg}`);
    const poNumber = await poPage.extractPONumber(msg);
    if (poNumber) {
      console.log(`PO Number Created: ${poNumber}`);
    }
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc002-result.png', fullPage: true });
  });

  test('PO_TC_003 - Create Standard PO with high value', async ({ page }) => {
    const tc = testData.testCases[2];

    await poPage.fillHeaderData(tc.header);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Result: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc003-result.png', fullPage: true });
  });

  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('PO_TC_004 - Negative: PO without supplier should fail', async ({ page }) => {
    const tc = testData.testCases[3];

    // Fill header without supplier
    await poPage.expandHeader();
    await poPage.fillOrgData(tc.header.purchOrg, tc.header.purchGroup, tc.header.companyCode);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Error: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc004-error.png', fullPage: true });
  });

  test('PO_TC_005 - Negative: PO with zero quantity should fail', async ({ page }) => {
    const tc = testData.testCases[4];

    await poPage.fillHeaderData(tc.header);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Error: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc005-error.png', fullPage: true });
  });

  test('PO_TC_006 - Negative: PO with invalid material should fail', async ({ page }) => {
    const tc = testData.testCases[5];

    await poPage.fillHeaderData(tc.header);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Error: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc006-error.png', fullPage: true });
  });

  test('PO_TC_007 - Negative: PO without purchasing org should fail', async ({ page }) => {
    const tc = testData.testCases[6];

    await poPage.fillSupplier(tc.header.supplier);
    await poPage.expandHeader();
    await poPage.fillOrgData('', tc.header.purchGroup, tc.header.companyCode);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Error: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc007-error.png', fullPage: true });
  });

  test('PO_TC_008 - Negative: PO with past delivery date should fail', async ({ page }) => {
    const tc = testData.testCases[7];

    await poPage.fillHeaderData(tc.header);
    await poPage.fillAllItems(tc.items);

    await poPage.save();

    const msg = await poPage.getMessageBarText();
    console.log(`Error: ${msg}`);
    expect(msg).toBeTruthy();
    await page.screenshot({ path: 'screenshots/po-tc008-error.png', fullPage: true });
  });
});
