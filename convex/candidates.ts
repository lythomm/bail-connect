import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, internalQuery, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";


// Regex to validate DossierFacile public sharing URLs (accepts locataire.dossierfacile.logement.gouv.fr or locataire.dossierfacile.fr)
const DOSSIER_FACILE_REGEX = /^https:\/\/[a-z0-9.-]*dossierfacile\.(logement\.gouv\.fr|fr)\/(file|pf|public-file)\/[a-zA-Z0-9-]+$/i;

export function maskCandidate(candidate: any) {
  if (candidate.status !== "accepted") {
    return {
      ...candidate,
      lastName: candidate.lastName ? `${candidate.lastName.trim().charAt(0)}.` : "",
      email: "Masqué (en attente)",
      phone: "Masqué (en attente)",
    };
  }
  return candidate;
}

/**
 * Fetch all candidates linked to a specific campaign.
 */
export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return [];
    }

    if (campaign.userId !== userId) {
      throw new Error("Unauthorized access to this campaign's candidates");
    }

    // Return candidates sorted by creation date (newest first)
    const candidates = await ctx.db
      .query("candidates")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();

    return candidates.map(maskCandidate);
  },
});

/**
 * Submit a new candidate application.
 * Enforces strict validation of the DossierFacile public URL.
 */
export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    age: v.number(),
    monthlyIncome: v.number(),
    jobStatus: v.string(),
    hasGuarantor: v.boolean(),
    dossierFacileUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Strict DossierFacile URL Validation
    const cleanUrl = args.dossierFacileUrl.trim();
    if (!DOSSIER_FACILE_REGEX.test(cleanUrl)) {
      throw new Error(
        "Invalid DossierFacile URL. A valid public sharing URL from dossierfacile.logement.gouv.fr is required."
      );
    }

    // Valider que la campagne existe et n'est pas archivée
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.status === "archived") {
      throw new Error("Cette campagne n'existe pas ou a été archivée.");
    }

    // Validation des données candidat
    if (args.age < 18) {
      throw new ConvexError("Vous devez avoir au moins 18 ans pour candidater.");
    }
    if (args.monthlyIncome < 0) {
      throw new ConvexError("Revenu net mensuel invalide.");
    }
    if (!args.email.includes("@")) {
      throw new ConvexError("Veuillez saisir une adresse email valide.");
    }

    // Check for duplicate candidates in the same campaign
    const existingCandidates = await ctx.db
      .query("candidates")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const isDuplicate = existingCandidates.some(
      (c) =>
        c.email.trim().toLowerCase() === args.email.trim().toLowerCase() ||
        c.phone.trim() === args.phone.trim() ||
        c.dossierFacileUrl.trim() === cleanUrl
    );

    if (isDuplicate) {
      throw new ConvexError("L'email, le téléphone ou le lien dossierFacile existe déjà");
    }

    // 2. Generate secure booking token
    const token = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 3. Insert candidate with default "pending" status
    const candidateId = await ctx.db.insert("candidates", {
      campaignId: args.campaignId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email.trim(),
      phone: args.phone.trim(),
      age: args.age,
      status: "pending",
      monthlyIncome: args.monthlyIncome,
      jobStatus: args.jobStatus.trim() as any,
      hasGuarantor: args.hasGuarantor,
      dossierFacileUrl: cleanUrl,
      bookingToken: token,
      createdAt: Date.now(),
    });

    // 3. Enqueue digest notification for landlord
    const maskedLastName = args.lastName.trim() ? `${args.lastName.trim().charAt(0)}.` : "";
    const maskedName = `${args.firstName.trim()} ${maskedLastName}`;

    await ctx.db.insert("notificationQueue", {
      userId: campaign.userId,
      campaignId: args.campaignId,
      type: "candidate",
      payload: {
        maskedName,
        jobStatus: args.jobStatus.trim(),
        monthlyIncome: args.monthlyIncome,
        hasGuarantor: args.hasGuarantor,
      },
      sent: false,
      createdAt: Date.now(),
    });

    return candidateId;
  },
});

/**
 * Update candidate status (pending, accepted, rejected).
 * Restricted to the owner of the campaign.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("candidates"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const candidate = await ctx.db.get(args.id);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new Error("Unauthorized access");
    }

    await ctx.db.patch(args.id, { status: args.status });

    if (args.status === "accepted") {
      await ctx.scheduler.runAfter(0, internal.emails.sendCandidateInvitation, {
        candidateId: args.id,
      });
    } else if (args.status === "rejected") {
      await ctx.scheduler.runAfter(0, internal.emails.sendCandidateRejection, {
        candidateId: args.id,
      });
    }

    return args.status;
  },
});

/**
 * Update status for multiple candidates.
 * Restricted to the owner of the campaign.
 */
export const updateStatuses = mutation({
  args: {
    ids: v.array(v.id("candidates")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    for (const id of args.ids) {
      const candidate = await ctx.db.get(id);
      if (!candidate) {
        continue;
      }

      const campaign = await ctx.db.get(candidate.campaignId);
      if (!campaign || campaign.userId !== userId) {
        throw new Error("Unauthorized access");
      }

      await ctx.db.patch(id, { status: args.status });

      if (args.status === "accepted") {
        await ctx.scheduler.runAfter(0, internal.emails.sendCandidateInvitation, {
          candidateId: id,
        });
      } else if (args.status === "rejected") {
        await ctx.scheduler.runAfter(0, internal.emails.sendCandidateRejection, {
          candidateId: id,
        });
      }
    }

    return args.status;
  },
});

/**
 * Internal query to fetch landlord email and campaign title.
 */
export const getLandlordInfo = internalQuery({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return null;
    }
    const user = await ctx.db.get(campaign.userId);
    if (!user) {
      return null;
    }
    return {
      landlordEmail: user.email,
      campaignTitle: campaign.title,
    };
  },
});

/**
 * Internal action to send Resend email.
 */
export const sendNotificationEmail = internalAction({
  args: {
    campaignId: v.id("campaigns"),
    candidateName: v.string(),
    candidateJobStatus: v.string(),
    candidateMonthlyIncome: v.number(),
    candidateHasGuarantor: v.boolean(),
  },
  handler: async (ctx, args) => {
    const landlordInfo = await ctx.runQuery(internal.candidates.getLandlordInfo, {
      campaignId: args.campaignId,
    });

    if (!landlordInfo || !landlordInfo.landlordEmail) {
      console.error("Landlord email or info not found");
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured. Email notification skipped.");
      return;
    }

    const { landlordEmail, campaignTitle } = landlordInfo;

    const subject = `[BailConnect] Nouvelle candidature pour ${campaignTitle}`;
    const guarantorText = args.candidateHasGuarantor ? "Oui" : "Non";
    
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 15px; color: #161616;">Nouvelle candidature reçue !</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A;">
          Un nouveau candidat a soumis son dossier pour votre annonce : <strong>${campaignTitle}</strong>.
        </p>
        
        <div style="background-color: #F6F6F6; padding: 15px; margin: 20px 0; border-left: 4px solid #000091;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Candidat :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #000091;">${args.candidateName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Situation professionnelle :</td>
              <td style="padding: 6px 0; color: #161616;">${args.candidateJobStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Revenus mensuels :</td>
              <td style="padding: 6px 0; color: #161616; font-weight: bold;">${args.candidateMonthlyIncome.toLocaleString("fr-FR")} €</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Garant :</td>
              <td style="padding: 6px 0; color: #161616;">${guarantorText}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #3A3A3A; margin-bottom: 24px;">
          Connectez-vous à votre espace propriétaire sur BailConnect pour consulter son lien DossierFacile certifié et modifier son statut.
        </p>
        
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard" 
           style="display: inline-block; background-color: #000091; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
          Accéder à mon tableau de bord
        </a>
        
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
          from: "BailConnect <noreply@bailconnect.fr>",
          to: [landlordEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send email via Resend:", errorText);
      } else {
        console.log("Email notification sent successfully to", landlordEmail);
      }
    } catch (err) {
      console.error("Error calling Resend API:", err);
    }
  },
});

/**
 * Seed 20 dummy candidates for testing purposes.
 */
/*
export const seedCandidates = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const firstNames = [
      "Thomas", "Emma", "Lucas", "Léa", "Hugo", "Chloé", "Enzo", "Manon", "Nathan", "Sarah",
      "Louis", "Inès", "Arthur", "Camille", "Jules", "Jade", "Mathis", "Lola", "Gabriel", "Clara"
    ];
    const lastNames = [
      "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent",
      "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard"
    ];
    const jobStatuses = ["CDI", "CDD", "Student", "Freelance", "Functionary", "Other"] as const;

    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const phone = `06${Math.floor(10000000 + Math.random() * 90000000)}`;
      const jobStatus = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
      const hasGuarantor = Math.random() > 0.4;
      const status = Math.random() > 0.8 ? (Math.random() > 0.5 ? "accepted" : "rejected") : "pending";
      
      // Income based on job status
      let monthlyIncome = 1500 + Math.floor(Math.random() * 2500);
      if (jobStatus === "Student") {
        monthlyIncome = 500 + Math.floor(Math.random() * 800);
      } else if (jobStatus === "CDI" || jobStatus === "Functionary") {
        monthlyIncome = 2000 + Math.floor(Math.random() * 3000);
      }

      const dossierFacileUrl = `https://locataire.dossierfacile.logement.gouv.fr/file/dummy-file-id-${i}`;

      await ctx.db.insert("candidates", {
        campaignId: args.campaignId,
        firstName,
        lastName,
        email,
        phone,
        age: 18 + Math.floor(Math.random() * 40),
        status,
        monthlyIncome,
        jobStatus,
        hasGuarantor,
        dossierFacileUrl,
        createdAt: Date.now() - (20 - i) * 3600000, // staggered over the last 20 hours
      });
    }
  },
});
*/

/**
 * Withdraw a candidate application.
 */
export const withdraw = mutation({
  args: {
    candidateId: v.id("candidates"),
    bookingToken: v.string(),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.bookingToken !== args.bookingToken) {
      throw new ConvexError("Accès refusé : jeton de retrait invalide.");
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign) {
      throw new ConvexError("Campagne introuvable.");
    }

    // Find any appointment for this candidate
    const existingAppt = await ctx.db
      .query("appointments")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    if (existingAppt) {
      const slot = await ctx.db.get(existingAppt.slotId);
      if (slot) {
        // Decrement bookedCount
        await ctx.db.patch(slot._id, {
          bookedCount: Math.max(0, slot.bookedCount - 1),
        });
      }
      // Delete appointment
      await ctx.db.delete(existingAppt._id);
    }

    // Send withdrawal email notification to landlord ONLY if candidate status was accepted
    if (candidate.status === "accepted") {
      await ctx.scheduler.runAfter(0, internal.notifications.sendWithdrawalNotification, {
        candidateFirstName: candidate.firstName,
        candidateLastName: candidate.lastName,
        campaignTitle: campaign.title,
        landlordUserId: campaign.userId,
      });
    }

    // Delete candidate
    await ctx.db.delete(args.candidateId);

    return true;
  },
});

/**
 * Update candidate notes by landlord.
 */
export const updateNotes = mutation({
  args: {
    candidateId: v.id("candidates"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Veuillez vous connecter pour effectuer cette action.");
    }

    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      throw new ConvexError("Candidat introuvable.");
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new ConvexError("Accès non autorisé aux informations de ce candidat.");
    }

    if (args.notes.length > 1024) {
      throw new ConvexError("La note ne doit pas dépasser 1024 caractères.");
    }

    await ctx.db.patch(args.candidateId, {
      notes: args.notes.trim(),
    });

    return true;
  },
});

