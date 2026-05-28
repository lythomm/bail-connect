import { Locator, Page } from '@playwright/test';

export class VerifyEmailPage {
  readonly page: Page;
  readonly codeInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.locator('#code');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async verify(otp: string) {
    await this.codeInput.fill(otp);
    await this.submitButton.click();
  }
}
