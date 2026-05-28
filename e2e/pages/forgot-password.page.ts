import { Locator, Page } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly requestEmailInput: Locator;
  readonly requestSubmitButton: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly resetSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.requestEmailInput = page.locator('#requestEmail');
    this.requestSubmitButton = page.locator('button[type="submit"]');
    this.newPasswordInput = page.locator('#newPassword');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.resetSubmitButton = page.locator('button[type="submit"]');
  }

  async gotoRequest() {
    await this.page.goto('/forgot-password');
  }

  async gotoReset(code: string) {
    await this.page.goto(`/forgot-password?token=${code}`);
  }

  async requestReset(email: string) {
    await this.gotoRequest();
    await this.requestEmailInput.fill(email);
    await this.requestSubmitButton.click();
  }

  async resetPassword(code: string, newPassword: string) {
    await this.gotoReset(code);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.resetSubmitButton.click();
  }
}
