import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

test.describe('Auth - Inscription & Validation OTP', () => {
  test('Devrait inscrire un utilisateur et le rediriger vers le dashboard après validation OTP', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const verifyEmailPage = new VerifyEmailPage(page);

    const randomId = Math.floor(Math.random() * 90000) + 10000;
    const randomPhone = '06' + Math.floor(10000000 + Math.random() * 90000000);
    const testUser = {
      name: `John E2E`,
      phone: randomPhone,
      email: `test-e2e-${randomId}@example.com`,
      password: 'SuperSecurePassword123!',
    };

    // 1. Inscription
    await registerPage.register(testUser);

    // 2. Attente de la page verify-email
    await page.waitForURL('**/verify-email');
    await expect(page.locator('text=Saisir le code de vérification')).toBeVisible();

    // 3. Récupération du code OTP via Convex
    let otp: string | null = null;
    for (let i = 0; i < 10; i++) {
      otp = await convexClient.query(api.tests.getVerificationCode, { email: testUser.email });
      if (otp) break;
      await page.waitForTimeout(500); // Laisse le temps à Convex d'insérer l'utilisateur
    }

    expect(otp).not.toBeNull();

    // 4. Soumission du code OTP
    await verifyEmailPage.verify(otp!);

    // 5. Redirection sur le Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Ravi de vous revoir')).toBeVisible();
  });
});
