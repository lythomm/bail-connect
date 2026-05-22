import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Regex to validate DossierFacile public sharing URLs (accepts locataire.dossierfacile.logement.gouv.fr or locataire.dossierfacile.fr)
const DOSSIER_FACILE_REGEX = /^https:\/\/[a-z0-9.-]*dossierfacile\.(logement\.gouv\.fr|fr)\/(file|pf)\/[a-zA-Z0-9-]+$/i;

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
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== userId) {
      throw new Error("Unauthorized access to this campaign's candidates");
    }

    // Return candidates sorted by creation date (newest first)
    return await ctx.db
      .query("candidates")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();
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
    monthlyIncome: v.number(),
    jobStatus: v.string(),
    hasGuarantor: v.boolean(),
    dossierFacileUrl: v.string(),
    nameTrigram: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Strict DossierFacile URL Validation
    const cleanUrl = args.dossierFacileUrl.trim();
    if (!DOSSIER_FACILE_REGEX.test(cleanUrl)) {
      throw new Error(
        "Invalid DossierFacile URL. A valid public sharing URL from dossierfacile.logement.gouv.fr is required."
      );
    }

    // Valider que la campagne existe
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // 2. Insert candidate with default "pending" status
    const candidateId = await ctx.db.insert("candidates", {
      campaignId: args.campaignId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email.trim(),
      phone: args.phone.trim(),
      status: "pending",
      monthlyIncome: args.monthlyIncome,
      jobStatus: args.jobStatus.trim() as any,
      hasGuarantor: args.hasGuarantor,
      dossierFacileUrl: cleanUrl,
      nameTrigram: args.nameTrigram.trim().toUpperCase(),
      createdAt: Date.now(),
    });

    // 3. Queue email notification to landlord
    await ctx.scheduler.runAfter(0, internal.candidates.sendNotificationEmail, {
      campaignId: args.campaignId,
      candidateTrigram: args.nameTrigram.trim().toUpperCase(),
      candidateJobStatus: args.jobStatus.trim(),
      candidateMonthlyIncome: args.monthlyIncome,
      candidateHasGuarantor: args.hasGuarantor,
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
    candidateTrigram: v.string(),
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
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Trigramme anonyme :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #000091; font-family: monospace;">${args.candidateTrigram}</td>
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
          from: "BailConnect <onboarding@resend.dev>",
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

      const nameTrigram = (firstName.slice(0, 1) + lastName.slice(0, 2)).toUpperCase();
      const dossierFacileUrl = `https://locataire.dossierfacile.logement.gouv.fr/file/dummy-file-id-${i}`;

      await ctx.db.insert("candidates", {
        campaignId: args.campaignId,
        firstName,
        lastName,
        email,
        phone,
        status,
        monthlyIncome,
        jobStatus,
        hasGuarantor,
        dossierFacileUrl,
        nameTrigram,
        createdAt: Date.now() - (20 - i) * 3600000, // staggered over the last 20 hours
      });
    }
  },
});

