import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name');
    this.phoneInput = page.locator('#phone');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirm-password');
    this.continueButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillStep1(name: string) {
    await this.nameInput.fill(name);
    await this.continueButton.click();
  }

  async fillStep2(phone: string) {
    await this.phoneInput.fill(phone);
    await this.continueButton.click();
  }

  async fillStep3(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  async fillStep4(password: string) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.continueButton.click();
  }

  async register(user: { name: string; phone: string; email: string; password: string }) {
    await this.goto();
    await this.fillStep1(user.name);
    await this.fillStep2(user.phone);
    await this.fillStep3(user.email);
    await this.fillStep4(user.password);
  }
}
