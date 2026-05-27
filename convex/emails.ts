import { internalQuery, internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { sendEmail } from "./resend";
import { formatDateParis, formatTimeParis } from "../lib/dateUtils";

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
      bookingToken: candidate.bookingToken,
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const bookingUrl = `${siteUrl}/calendar/book?candidateId=${args.candidateId}&bookingToken=${info.bookingToken}`;

    const subject = `📅 Planifiez votre visite – ${info.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Votre dossier est accepté pour une visite !</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Le propriétaire de l'annonce <strong>${info.campaignTitle}</strong> a accepté votre dossier de candidature. 
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

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send candidate email via Resend:", emailResult.error);
    } else {
      console.log("Candidate booking invitation sent successfully to", info.candidateEmail);
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

    const subject = `Candidature pour ${info.campaignTitle}`;
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

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send candidate rejection email via Resend:", emailResult.error);
    } else {
      console.log("Candidate rejection email sent successfully to", info.candidateEmail);
    }
  },
});

/**
 * Send a 6-digit OTP code to verify a user's email.
 */
export const sendOTPCode = internalAction({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {

    const subject = `🔑 Votre code de vérification : ${args.code}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Vérification de votre adresse e-mail</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour,
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Merci de vous être inscrit sur BailConnect. Veuillez saisir le code de validation ci-dessous pour finaliser la création de votre compte :
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <div style="display: inline-block; background-color: #F5F5FE; border: 1px solid #000091; color: #000091; padding: 16px 32px; font-size: 24px; font-weight: bold; letter-spacing: 6px; border-radius: 4px; font-family: monospace;">
            ${args.code}
          </div>
        </div>
        
        <p style="font-size: 13px; line-height: 1.5; color: #666666;">
          Ce code est valable pendant <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un email automatique envoyé par BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [args.email],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send OTP verification email via Resend:", emailResult.error);
    } else {
      console.log("OTP verification email sent successfully to", args.email);
    }
  },
});

/**
 * Send an email to a candidate notifying that their slot has been cancelled by the landlord.
 */
export const sendAppointmentCancellationToCandidate = internalAction({
  args: {
    candidateId: v.id("candidates"),
    campaignTitle: v.string(),
    slotStartTime: v.number(),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) return;

    const dateStr = formatDateParis(args.slotStartTime);
    const timeStr = formatTimeParis(args.slotStartTime);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const bookingUrl = `${siteUrl}/calendar/book?candidateId=${args.candidateId}&bookingToken=${info.bookingToken}`;

    const subject = `❌ Visite annulée – ${args.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Votre visite a été annulée</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Le propriétaire de l'annonce <strong>${args.campaignTitle}</strong> a dû annuler le créneau de visite prévu le <strong>${dateStr} à ${timeStr}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Vous restez prioritaire. Nous vous invitons à choisir un nouveau créneau de visite parmi les disponibilités du propriétaire.
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bookingUrl}" 
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Choisir un nouveau créneau
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #666666;">
          Si le bouton ci-dessus ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
          <a href="${bookingUrl}" style="color: #000091; word-break: break-all;">${bookingUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un e-mail automatique envoyé par BailConnect. Ne pas répondre.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send slot cancellation email to candidate:", emailResult.error);
    } else {
      console.log("Slot cancellation email sent successfully to", info.candidateEmail);
    }
  },
});

/**
 * Send an email to a candidate notifying that the campaign has been archived (a tenant was found).
 */
export const sendCampaignArchivedCancellation = internalAction({
  args: {
    candidateId: v.id("candidates"),
    campaignTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) return;

    const subject = `🏠 Un locataire a été trouvé – ${args.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Clôture de la recherche de location</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous vous informons que la recherche de locataire pour le logement <strong>${args.campaignTitle}</strong> est désormais clôturée car un locataire a été trouvé.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          En conséquence, les visites prévues ou en attente pour cette annonce sont annulées.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous vous remercions pour votre intérêt et vous souhaitons une excellente continuation dans votre recherche de logement.
        </p>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un e-mail automatique envoyé par BailConnect. Ne pas répondre.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send campaign archived cancellation email to candidate:", emailResult.error);
    } else {
      console.log("Campaign archived cancellation email sent successfully to", info.candidateEmail);
    }
  },
});

/**
 * Send an email to the chosen candidate congratulating them.
 */
export const sendCampaignArchivedCongratulations = internalAction({
  args: {
    candidateId: v.id("candidates"),
    campaignTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) return;

    const subject = `🎉 Félicitations, votre dossier a été retenu ! – ${args.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Votre candidature a été retenue !</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Nous avons le plaisir de vous annoncer que votre candidature pour le logement <strong>${args.campaignTitle}</strong> a été retenue par le propriétaire !
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Le propriétaire va vous contacter prochainement pour convenir des modalités de signature du bail et de remise des clés si ce n'est pas déjà fait.
        </p>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un e-mail automatique envoyé par BailConnect. Ne pas répondre.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send congratulations email to chosen candidate:", emailResult.error);
    } else {
      console.log("Congratulations email sent successfully to", info.candidateEmail);
    }
  },
});

/**
 * Send an email to a candidate notifying that their slot date/time has been changed by the landlord.
 */
export const sendAppointmentRescheduleToCandidate = internalAction({
  args: {
    candidateId: v.id("candidates"),
    campaignTitle: v.string(),
    oldSlotStartTime: v.number(),
    newSlotStartTime: v.number(),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.emails.getCandidateInvitationInfo, {
      candidateId: args.candidateId,
    });
    if (!info) return;

    const oldDateStr = formatDateParis(args.oldSlotStartTime);
    const oldTimeStr = formatTimeParis(args.oldSlotStartTime);
    const newDateStr = formatDateParis(args.newSlotStartTime);
    const newTimeStr = formatTimeParis(args.newSlotStartTime);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const bookingUrl = `${siteUrl}/calendar/book?candidateId=${args.candidateId}&bookingToken=${info.bookingToken}`;

    const subject = `📅 Visite déplacée – ${args.campaignTitle}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Votre visite a été modifiée</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Bonjour ${info.candidateFirstName} ${info.candidateLastName},
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Le propriétaire de l'annonce <strong>${args.campaignTitle}</strong> a modifié l'horaire de votre visite.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          La visite initialement prévue le ${oldDateStr} à ${oldTimeStr} est maintenant programmée le :<br/>
          <strong>${newDateStr} à ${newTimeStr}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Si cet horaire ne vous convient pas, vous pouvez modifier ou annuler votre rendez-vous en cliquant sur le lien ci-dessous.
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bookingUrl}" 
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Gérer mon rendez-vous
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #666666;">
          Si le bouton ci-dessus ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
          <a href="${bookingUrl}" style="color: #000091; word-break: break-all;">${bookingUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Ceci est un e-mail automatique envoyé par BailConnect. Ne pas répondre.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <noreply@bailconnect.fr>",
      to: [info.candidateEmail],
      subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send slot reschedule email to candidate:", emailResult.error);
    } else {
      console.log("Slot reschedule email sent successfully to", info.candidateEmail);
    }
  },
});

/**
 * Send support request to contact@bailconnect.fr
 */
export const sendSupportEmail = action({
  args: {
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.current);
    if (!user) {
      throw new Error("Non autorisé");
    }

    const cleanSubject = args.subject.trim().substring(0, 150);
    const cleanMessage = args.message.trim().substring(0, 1000);

    if (!cleanSubject || !cleanMessage) {
      throw new Error("Sujet et message requis.");
    }

    const isPro = user.tier === "pro";

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
          <span>BailConnect — Demande de Support</span>
          ${isPro ? '<span style="background-color: #E8F6EE; color: #18753C; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; margin-left: 7px;">PRO</span>' : ""}
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          <strong>De :</strong> ${user.name || "Utilisateur"} (${user.email})${isPro ? ' <span style="background-color: #E8F6EE; color: #18753C; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: bold; vertical-align: middle; margin-left: 5px;">PRO</span>' : ""}<br/>
          <strong>ID Utilisateur :</strong> ${user._id}<br/>
          <strong>Objet :</strong> ${cleanSubject}
        </p>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 20px 0;" />
        <p style="font-size: 14px; line-height: 1.5; color: #161616; white-space: pre-wrap;">
          ${cleanMessage}
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect Support <noreply@bailconnect.fr>",
      to: ["contact@bailconnect.fr"],
      subject: isPro ? `[Support BailConnect] [PRO] ${cleanSubject}` : `[Support BailConnect] ${cleanSubject}`,
      html: htmlContent,
    });

    if (!emailResult.success) {
      throw new Error("Erreur lors de l'envoi de l'email : " + emailResult.error);
    }

    return { success: true };
  },
});




