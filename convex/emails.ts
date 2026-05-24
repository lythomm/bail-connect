import { internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Internal query to fetch candidate details for email invitation.
 */
export const getCandidateInvitationInfo = internalQuery({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) return null;
    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign) return null;
    return {
      candidateEmail: candidate.email,
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      campaignTitle: campaign.title,
      campaignAddress: campaign.address,
    };
  },
});

/**
 * Send an email invitation to an accepted candidate.
 */
export const sendCandidateInvitation = internalAction({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) {
      console.error("Candidate info not found for ID:", args.candidateId);
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured. Invitation email skipped.");
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const bookingUrl = `${siteUrl}/calendar/book?candidateId=${args.candidateId}`;

    const subject = `[BailConnect] Votre dossier a été retenu pour ${info.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Félicitations, votre dossier a été retenu !</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Le propriétaire de l'annonce <strong>${info.campaignTitle}</strong> a retenu votre dossier de candidature. 
          ${info.campaignAddress ? `Le logement est situé à l'adresse suivante : <strong>${info.campaignAddress}</strong>.<br/><br/>` : ""}
          Vous pouvez dès maintenant choisir un créneau de visite sur son calendrier.
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bookingUrl}" 
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Choisir mon créneau de visite
          </a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.5; color: #666666;">
          Si le bouton ci-dessus ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
          <a href="${bookingUrl}" style="color: #000091; word-break: break-all;">${bookingUrl}</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un email automatique envoyé par BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "BailConnect <onboarding@resend.dev>",
          to: [info.candidateEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send candidate email via Resend:", errorText);
      } else {
        console.log("Candidate booking invitation sent successfully to", info.candidateEmail);
      }
    } catch (err) {
      console.error("Error calling Resend API for candidate email:", err);
    }
  },
});

/**
 * Send a rejection email to a candidate.
 */
export const sendCandidateRejection = internalAction({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) {
      console.error("Candidate info not found for ID:", args.candidateId);
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured. Rejection email skipped.");
      return;
    }

    const subject = `[BailConnect] Candidature pour ${info.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Mise à jour concernant votre candidature</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous vous remercions d'avoir postulé pour l'annonce <strong>${info.campaignTitle}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Après étude attentive de votre dossier par le propriétaire, nous avons le regret de vous informer que votre candidature n'a pas été retenue pour cette offre. Nous en sommes sincèrement désolés.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous vous remercions pour votre intérêt et nous vous souhaitons une excellente continuation ainsi que beaucoup de réussite dans vos recherches de logement.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un email automatique envoyé par BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "BailConnect <onboarding@resend.dev>",
          to: [info.candidateEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send candidate rejection email via Resend:", errorText);
      } else {
        console.log("Candidate rejection email sent successfully to", info.candidateEmail);
      }
    } catch (err) {
      console.error("Error calling Resend API for candidate rejection email:", err);
    }
  },
});

