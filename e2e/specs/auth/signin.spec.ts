import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { SignInPage } from '../../pages/signin.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

test.describe('Auth - Connexion & Déconnexion', () => {
  test.describe.configure({ mode: 'serial' });
  let testUser: any;

  // Crée un utilisateur unique et vérifié avant les tests de connexion
  test.beforeAll(async () => {
    const randomId = Math.floor(Math.random() * 90000) + 10000;
    testUser = {
      name: `John Connex`,
      phone: '06' + Math.floor(10000000 + Math.random() * 90000000),
      email: `test-login-${randomId}@example.com`,
      password: 'SuperPassword123!',
    };

    // On utilise Playwright pour l'inscription initiale pour s'assurer que tout l'onboarding est OK
  });

  test('Devrait gérer le cycle de vie de connexion de A à Z', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const verifyEmailPage = new VerifyEmailPage(page);
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Inscription et validation OTP pour avoir un compte valide
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
    await page.waitForURL('**/'); // Redirigé sur la landing page
    await expect(page.locator('text=Se connecter').first()).toBeVisible();

    // 3. Connexion avec les bons identifiants
    await signInPage.login(testUser.email, testUser.password);
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Ravi de vous revoir')).toBeVisible();
  });

  test('Devrait afficher une erreur en cas de mot de passe incorrect', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.login(testUser.email, 'WrongPassword123!');
    await expect(page.locator('text=Email ou mot de passe incorrect.')).toBeVisible();
  });

  test('Devrait afficher une erreur en cas d\'email non enregistré', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.login('unknown-user-email@example.com', 'SomePassword123!');
    await expect(page.locator('text=Cette adresse email n\'est pas enregistrée.')).toBeVisible();
  });
});
