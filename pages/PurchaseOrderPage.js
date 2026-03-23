class PurchaseOrderPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToME21N() {
    const txnField = this.page.getByRole('combobox', { name: 'Enter transaction code' });
    await txnField.fill('ME21N');
    await this.page.keyboard.press('Enter');
    await this.page.getByRole('heading', { name: 'Create Purchase Order' }).waitFor({ timeout: 30000 });
  }

  async fillSupplier(supplier) {
    if (!supplier) return;
    const field = this.page.getByRole('textbox', { name: 'Supplier', exact: true });
    await field.click();
    await this.page.waitForTimeout(300);
    await this.page.keyboard.type(supplier, { delay: 50 });
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(3000);
  }

  async fillOrgData(purchOrg, purchGroup, companyCode) {
    await this.page.getByRole('tab', { name: 'Org. Data' }).click();
    await this.page.waitForTimeout(500);

    if (purchOrg) {
      const orgField = this.page.getByRole('textbox', { name: 'Purch. Org.' });
      await orgField.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.type(purchOrg, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
    }

    if (purchGroup) {
      const grpField = this.page.getByRole('textbox', { name: 'Purch. Group' });
      await grpField.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.type(purchGroup, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
    }

    if (companyCode) {
      const ccField = this.page.getByRole('textbox', { name: 'Company Code' });
      await ccField.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.type(companyCode, { delay: 50 });
      await this.page.keyboard.press('Tab');
    }

    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async expandHeader() {
    const expandBtn = this.page.getByRole('button', { name: 'Expand Header Ctrl+F2' });
    if (await expandBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expandBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async expandItems() {
    const expandBtn = this.page.getByRole('button', { name: 'Expand Items Ctrl+F3' });
    if (await expandBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expandBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  // Click a cell in the first item row by its column header name and type value
  async fillCellByColumnHeader(columnName, value) {
    if (!value) return;
    const header = this.page.getByRole('columnheader', { name: columnName }).first();
    const headerBox = await header.boundingBox();
    if (headerBox) {
      await this.page.mouse.click(headerBox.x + headerBox.width / 2, headerBox.y + 40);
      await this.page.waitForTimeout(300);
      await this.page.keyboard.type(value, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(300);
    }
  }

  async fillLineItem(itemData, rowIndex = 0) {
    if (rowIndex === 0) {
      // First row: use column header position approach (no aria labels on first row)
      await this.fillCellByColumnHeader('Material', itemData.material);
      await this.page.waitForTimeout(1000);
      await this.fillCellByColumnHeader('PO Quantity', itemData.poQuantity);
      await this.fillCellByColumnHeader('Deliv. Date', itemData.delivDate);
      await this.fillCellByColumnHeader('Net Price', itemData.netPrice);
      await this.fillCellByColumnHeader('Currency', itemData.currency);
      await this.fillCellByColumnHeader('Plant', itemData.plant);
      await this.fillCellByColumnHeader('Stor. Location', itemData.storLocation);
    } else {
      // Subsequent rows have proper aria labels
      const fillField = async (name, value) => {
        if (!value) return;
        const field = this.page.getByRole('textbox', { name }).nth(rowIndex);
        if (await field.isVisible({ timeout: 3000 }).catch(() => false)) {
          await field.click();
          await this.page.waitForTimeout(200);
          await this.page.keyboard.type(value, { delay: 50 });
          await this.page.keyboard.press('Tab');
          await this.page.waitForTimeout(300);
        }
      };
      await fillField('Material', itemData.material);
      await this.page.waitForTimeout(1000);
      await fillField('PO Quantity', itemData.poQuantity);
      await fillField('Deliv. Date', itemData.delivDate);
      await fillField('Net Price', itemData.netPrice);
      await fillField('Currency', itemData.currency);
      await fillField('Plant', itemData.plant);
      await fillField('Stor. Location', itemData.storLocation);
    }
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async fillHeaderData(headerData) {
    await this.fillSupplier(headerData.supplier);
    await this.expandHeader();
    await this.fillOrgData(headerData.purchOrg, headerData.purchGroup, headerData.companyCode);
  }

  async fillAllItems(items) {
    await this.expandItems();
    for (let i = 0; i < items.length; i++) {
      await this.fillLineItem(items[i], i);
    }
  }

  async save() {
    // Dismiss any popup/dialog that might block the Save button
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000);
    }
    await this.page.getByRole('button', { name: 'Save Emphasized' }).click({ force: true, timeout: 10000 });
    await this.page.waitForTimeout(5000);
  }

  async getMessageBarText() {
    // Try multiple selectors for message bar
    const msgBar = this.page.getByRole('note', { name: 'Message Bar' });
    if (await msgBar.isVisible({ timeout: 10000 }).catch(() => false)) {
      return await msgBar.textContent();
    }
    // Fallback: look for any status message at bottom of page
    const statusMsg = this.page.locator('.lsStatusbar__message, .urMsgBar, [id*="MsgBar"]').first();
    if (await statusMsg.isVisible({ timeout: 5000 }).catch(() => false)) {
      return await statusMsg.textContent();
    }
    // Fallback: check for error/success note anywhere
    const anyNote = this.page.getByRole('note').first();
    if (await anyNote.isVisible({ timeout: 3000 }).catch(() => false)) {
      return await anyNote.textContent();
    }
    return null;
  }

  async extractPONumber(messageText) {
    if (!messageText) return null;
    const match = messageText.match(/(\d{10})/);
    return match ? match[1] : null;
  }

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}

module.exports = PurchaseOrderPage;
