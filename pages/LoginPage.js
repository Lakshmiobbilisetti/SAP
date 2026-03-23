class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.getByRole('textbox', { name: 'User Required' }).waitFor({ timeout: 30000 });
  }

  async login(username, password, client = '100') {
    const clientField = this.page.getByRole('textbox', { name: 'Client Required' });
    const currentClient = await clientField.inputValue();
    if (currentClient !== client) {
      await clientField.clear();
      await clientField.fill(client);
    }

    await this.page.getByRole('textbox', { name: 'User Required' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password Required' }).fill(password);
    await this.page.getByRole('button', { name: 'Log On Emphasized' }).click();

    await this.page.getByRole('heading', { name: 'SAP Easy Access' }).waitFor({ timeout: 30000 });
  }

  async isLoggedIn() {
    return await this.page.getByRole('heading', { name: 'SAP Easy Access' })
      .isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getErrorMessage() {
    const errorNote = this.page.getByRole('note', { name: /Error/ });
    if (await errorNote.isVisible({ timeout: 5000 }).catch(() => false)) {
      return await errorNote.textContent();
    }
    return null;
  }
}

module.exports = LoginPage;
