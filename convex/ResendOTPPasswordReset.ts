import { Email } from "@convex-dev/auth/providers/Email";
import { sendEmail } from "./resend";

const baseEmailProvider = Email({
  sendVerificationRequest: async ({ identifier: email, token }) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/forgot-password?token=${token}`;

    const subject = "🔑 Réinitialisation de votre mot de passe - BailConnect";
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Réinitialisation du mot de passe</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour,
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte propriétaire BailConnect. Veuillez cliquer sur le bouton ci-dessous pour modifier votre mot de passe :
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.5; color: #666666;">
          Si le bouton ci-dessus ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
          <a href="${resetUrl}" style="color: #000091; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 12px; color: #666666; mt-2;">
          Ce lien est unique et expire dans <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un email automatique envoyé par BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const isDev = process.env.CONVEX_DEPLOY_ENVIRONMENT === "development" || !process.env.PROD;
    if (isDev && process.env.CONVEX_SITE_URL) {
      try {
        await fetch(`${process.env.CONVEX_SITE_URL}/save-test-token`, {
          method: "POST",
          body: JSON.stringify({ email, token }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Erreur lors de la sauvegarde du token de test:", err);
      }
    }

    const result = await sendEmail({
      to: [email],
      subject,
      html: htmlContent,
    });

    if (!result.success && !isDev) {
      throw new Error("Impossible d'envoyer l'e-mail de réinitialisation : " + result.error);
    }
  },
});

export const ResendOTPPasswordReset = {
  ...baseEmailProvider,
  id: "resend-otp",
  maxAge: 15 * 60, // 15 minutes
};
