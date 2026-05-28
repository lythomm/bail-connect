import { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly userMenuButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenuButton = page.locator('#user-menu-button');
    this.signOutButton = page.locator('button:has-text("Se déconnecter")');
  }

  async dismissOnboardingIfVisible() {
    const skipButton = this.page.locator('text=Passer l\'introduction');
    try {
      // Attente courte au cas où le modal met un peu de temps à apparaître
      await skipButton.waitFor({ state: 'visible', timeout: 3000 });
      await skipButton.click();
      await skipButton.waitFor({ state: 'hidden' });
    } catch (e) {
      // Le modal n'est pas apparu ou a déjà été fermé, on ignore
    }
  }

  async logout() {
    await this.dismissOnboardingIfVisible();
    await this.userMenuButton.click();
    await this.signOutButton.click();
  }
}
