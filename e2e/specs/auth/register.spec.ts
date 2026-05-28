import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

test.describe('Auth - Inscription & Validation OTP', () => {
  test.describe.configure({ mode: 'serial' });

  const randomId = Math.floor(Math.random() * 90000) + 10000;
  const randomPhone = '06' + Math.floor(10000000 + Math.random() * 90000000);
  const testUser = {
    name: `John E2E`,
    phone: randomPhone,
    email: `test-e2e-${randomId}@example.com`,
    password: 'SuperSecurePassword123!',
  };

  test('Devrait valider les erreurs de formulaire par étape, valider les erreurs OTP, puis réussir l\'inscription', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const verifyEmailPage = new VerifyEmailPage(page);

    await registerPage.goto();

    // Étape 1 : Prénom trop court
    await registerPage.nameInput.fill('A');
    await registerPage.continueButton.click();
    await expect(page.locator('text=Le prénom doit comporter au moins 2 caractères.')).toBeVisible();
    await registerPage.nameInput.fill(testUser.name);
    await registerPage.continueButton.click();

    // Étape 2 : Téléphone invalide
    await registerPage.phoneInput.fill('0123');
    await registerPage.continueButton.click();
    await expect(page.locator('text=Format du numéro de téléphone invalide. Ex: 06 12 34 56 78')).toBeVisible();
    await registerPage.phoneInput.fill(testUser.phone);
    await registerPage.continueButton.click();

    // Étape 3 : Email invalide (valide pour le navigateur mais invalide pour notre regex car sans le point)
    await registerPage.emailInput.fill('invalid-email@domain');
    await registerPage.continueButton.click();
    await expect(page.locator('text=Veuillez saisir une adresse e-mail valide.')).toBeVisible();
    await registerPage.emailInput.fill(testUser.email);
    await registerPage.continueButton.click();

    // Étape 4 : Mot de passe trop court et non concordant
    await registerPage.passwordInput.fill('short');
    await registerPage.confirmPasswordInput.fill('short');
    await registerPage.continueButton.click();
    await expect(page.locator('text=Le mot de passe doit comporter au moins 8 caractères.')).toBeVisible();

    await registerPage.passwordInput.fill(testUser.password);
    await registerPage.confirmPasswordInput.fill('Mismatched123!');
    await registerPage.continueButton.click();
    await expect(page.locator('text=Les mots de passe ne correspondent pas.')).toBeVisible();

    // Finalisation étape 4 correcte
    await registerPage.passwordInput.fill(testUser.password);
    await registerPage.confirmPasswordInput.fill(testUser.password);
    await registerPage.continueButton.click();

    // Validation redirection vers page OTP
    await page.waitForURL('**/verify-email');
    await expect(page.locator('text=Saisir le code de vérification')).toBeVisible();

    // Test OTP : Code au mauvais format (< 6 chiffres)
    await verifyEmailPage.codeInput.fill('123');
    // Le bouton de validation doit être désactivé si le code n'a pas 6 chiffres
    await expect(verifyEmailPage.submitButton).toBeDisabled();

    // Test OTP : Code erroné (6 chiffres)
    await verifyEmailPage.verify('999999');
    await expect(page.locator('.gov-callout-warning', { hasText: 'Le code de vérification est incorrect.' })).toBeVisible();

    // Récupération et soumission du bon OTP
    let otp: string | null = null;
    for (let i = 0; i < 10; i++) {
      otp = await convexClient.query(api.tests.getVerificationCode, { email: testUser.email });
      if (otp) break;
      await page.waitForTimeout(500);
    }
    expect(otp).not.toBeNull();
    await verifyEmailPage.verify(otp!);

    // Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Ravi de vous revoir')).toBeVisible();
  });

  test('Devrait refuser l\'inscription avec un email ou un téléphone déjà utilisé', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    // Étape 1 : Saisie prénom valide
    await registerPage.fillStep1('Another User');

    // Étape 2 : Téléphone déjà utilisé
    await registerPage.fillStep2(testUser.phone);
    await expect(page.locator('text=Ce numéro de téléphone est déjà utilisé.')).toBeVisible();

    // Saisie d'un téléphone unique pour passer à l'étape suivante
    const anotherPhone = '06' + Math.floor(10000000 + Math.random() * 90000000);
    await registerPage.fillStep2(anotherPhone);

    // Étape 3 : Email déjà utilisé
    await registerPage.fillStep3(testUser.email);
    // Étape 4 : Saisie mot de passe et soumission finale
    await registerPage.fillStep4('SomePassword123!');
    
    // Devrait afficher l'erreur d'email déjà utilisé
    await expect(page.locator('text=Cette adresse email est déjà enregistrée.')).toBeVisible();
  });
});
