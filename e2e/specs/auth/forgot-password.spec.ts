import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { SignInPage } from '../../pages/signin.page';
import { ForgotPasswordPage } from '../../pages/forgot-password.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

test.describe('Auth - Mot de passe oublié', () => {
  test.describe.configure({ mode: 'serial' });
  let testUser: any;

  test.beforeAll(async () => {
    const randomId = Math.floor(Math.random() * 90000) + 10000;
    testUser = {
      name: `John Reset`,
      phone: '06' + Math.floor(10000000 + Math.random() * 90000000),
      email: `test-reset-${randomId}@example.com`,
      password: 'OldPassword123!',
      newPassword: 'BrandNewPassword123!',
    };
  });

  test('Devrait suivre tout le parcours de réinitialisation de mot de passe', async ({ page }) => {


    const registerPage = new RegisterPage(page);
    const verifyEmailPage = new VerifyEmailPage(page);
    const signInPage = new SignInPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Inscription et validation OTP pour avoir un compte actif
    await registerPage.register(testUser);
    await page.waitForURL('**/verify-email');

    let otp: string | null = null;
    for (let i = 0; i < 10; i++) {
      otp = await convexClient.query(api.tests.getVerificationCode, { email: testUser.email });
      if (otp) break;
      await page.waitForTimeout(500);
    }
    expect(otp).not.toBeNull();
    await verifyEmailPage.verify(otp!);
    await page.waitForURL('**/dashboard');

    // 2. Déconnexion
    await dashboardPage.logout();
    await page.waitForURL('**/');

    // 3. Navigation vers la page de connexion, puis clic sur "Mot de passe oublié"
    await signInPage.goto();
    await page.click('text=Mot de passe oublié ?');
    await page.waitForURL('**/forgot-password');

    // 4. Demande de réinitialisation
    await forgotPasswordPage.requestReset(testUser.email);
    await expect(page.locator('text=E-mail envoyé')).toBeVisible();

    // 5. Récupération du token de réinitialisation via la query de test
    let resetToken: string | null = null;
    for (let i = 0; i < 10; i++) {
      resetToken = await convexClient.query(api.tests.getPasswordResetCode, { email: testUser.email });
      if (resetToken) break;
      await page.waitForTimeout(500);
    }
    expect(resetToken).not.toBeNull();
    // 6. Saisie du nouveau mot de passe
    await forgotPasswordPage.gotoReset(resetToken!);

    await forgotPasswordPage.newPasswordInput.fill(testUser.newPassword);
    await forgotPasswordPage.confirmPasswordInput.fill(testUser.newPassword);
    await forgotPasswordPage.resetSubmitButton.click();

    // 6. La validation connecte l'utilisateur et le redirige directement sur le Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Ravi de vous revoir')).toBeVisible();

    // 7. Déconnexion et reconnexion avec le NOUVEAU mot de passe pour valider le changement
    await dashboardPage.logout();
    await page.waitForURL('**/');

    await signInPage.login(testUser.email, testUser.newPassword);
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Ravi de vous revoir')).toBeVisible();
  });
});
