import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { sendEmail } from "./resend";
import { formatDateParis, formatTimeParis, getParisHour } from "../lib/dateUtils";

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * Fetch all users eligible for digest at the given hour.
 * Eligible = notificationPreference is "daily" (or not set, default daily) and digestHour matches.
 */
export const getUsersForDigestHour = internalQuery({
  args: { hour: v.number() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => {
      const pref = u.notificationPreference ?? "daily";
      if (pref === "none") return false;
      const dh = u.digestHour ?? 18;
      return dh === args.hour;
    });
  },
});

/**
 * Fetch unsent queue items for a user.
 */
export const getPendingItems = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationQueue")
      .withIndex("by_userId_sent", (q) =>
        q.eq("userId", args.userId).eq("sent", false)
      )
      .collect();
  },
});

/**
 * Fetch campaign title by ID.
 */
export const getCampaignTitle = internalQuery({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    return { id: args.campaignId as string, title: c?.title ?? "Annonce inconnue" };
  },
});

/**
 * Fetch user email by ID.
 */
export const getUserEmail = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const u = await ctx.db.get(args.userId);
    return u?.email ?? null;
  },
});

/**
 * Fetch all info needed for immediate booking notification email.
 */
export const getLandlordBookingInfo = internalQuery({
  args: {
    candidateId: v.id("candidates"),
    slotId: v.id("slots"),
    landlordUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const landlord = await ctx.db.get(args.landlordUserId);
    const candidate = await ctx.db.get(args.candidateId);
    const slot = await ctx.db.get(args.slotId);
    if (!landlord || !candidate || !slot) return null;
    const campaign = await ctx.db.get(candidate.campaignId);
    return {
      landlordEmail: landlord.email ?? null,
      candidateTrigram: candidate.nameTrigram,
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      campaignTitle: campaign?.title ?? "Annonce inconnue",
      slotStartTime: slot.startTime,
      slotEndTime: slot.endTime,
    };
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Mark a batch of notificationQueue items as sent.
 */
export const markItemsSent = internalMutation({
  args: { ids: v.array(v.id("notificationQueue")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { sent: true });
    }
  },
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Send digest for a single user: group items by campaign, build HTML, send via Resend, mark sent.
 */
export const sendDigestForUser = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const [email, items] = await Promise.all([
      ctx.runQuery(internal.notifications.getUserEmail, { userId: args.userId }),
      ctx.runQuery(internal.notifications.getPendingItems, { userId: args.userId }),
    ]);

    if (!email || items.length === 0) return;

    // Only process candidate-type items in the digest (bookings are sent immediately)
    const candidateItems = items.filter((i) => i.type === "candidate");
    if (candidateItems.length === 0) return;

    // Group by campaignId
    const byCampaign: Record<string, { id: string; title: string; count: number }> = {};

    for (const item of candidateItems) {
      const cid = item.campaignId as string;
      if (!byCampaign[cid]) {
        const info = await ctx.runQuery(internal.notifications.getCampaignTitle, {
          campaignId: item.campaignId,
        });
        byCampaign[cid] = { id: info.id, title: info.title, count: 0 };
      }
      byCampaign[cid].count++;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const campaignLines = Object.values(byCampaign).map(({ id, title, count }) => {
      const url = `${siteUrl}/dashboard/campaigns/${id}`;
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #EEEEEE;">
            <span style="font-size: 14px; font-weight: bold; color: #161616;">${title}</span><br/>
            <span style="font-size: 13px; color: #666666;">${count} nouveau${count > 1 ? "x" : ""} candidat${count > 1 ? "s" : ""}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #EEEEEE; text-align: right; vertical-align: middle;">
            <a href="${url}" style="display: inline-block; background-color: #000091; color: white; padding: 8px 16px; text-decoration: none; font-weight: bold; font-size: 12px; border-radius: 4px; white-space: nowrap;">
              Voir les dossiers
            </a>
          </td>
        </tr>
      `;
    }).join("");

    const totalCandidates = candidateItems.length;
    const summaryText = `${totalCandidates} nouveau${totalCandidates > 1 ? "x" : ""} candidat${totalCandidates > 1 ? "s" : ""}`;
    const subject = `${summaryText} aujourd'hui`;

    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 24px;">
          BailConnect
        </div>
        <h2 style="font-size: 18px; margin-bottom: 6px; color: #161616;">Récap du jour 📋</h2>
        <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">
          Vous avez reçu <strong>${summaryText}</strong> sur vos annonces :
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          ${campaignLines}
        </table>
        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Email automatique BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <notifications@bailconnect.fr>",
      to: [email],
      subject,
      html,
    });

    if (emailResult.success) {
      console.log(`Digest sent to ${email} (${items.length} items)`);
    } else {
      console.error("Digest email failed:", emailResult.error);
      return;
    }

    // Mark candidate items as sent
    await ctx.runMutation(internal.notifications.markItemsSent, {
      ids: candidateItems.map((i) => i._id),
    });
  },
});

/**
 * Send an immediate booking notification email to the landlord.
 */
export const sendBookingNotification = internalAction({
  args: {
    candidateId: v.id("candidates"),
    slotId: v.id("slots"),
    landlordUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.notifications.getLandlordBookingInfo, {
      candidateId: args.candidateId,
      slotId: args.slotId,
      landlordUserId: args.landlordUserId,
    });

    if (!info || !info.landlordEmail) {
      console.error("Landlord info not found for booking notification");
      return;
    }

    const dateStr = formatDateParis(info.slotStartTime, { year: "numeric" });
    const timeStr = formatTimeParis(info.slotStartTime);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const subject = `📅 Créneau réservé – ${info.campaignTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 24px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 6px; color: #161616;">Un candidat vient de réserver un créneau</h2>
        <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">Annonce : <strong>${info.campaignTitle}</strong></p>

        <div style="background: #F5F5FE; border-left: 4px solid #000091; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Trigramme :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #000091; font-family: monospace;">${info.candidateTrigram}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #666666;">Date de visite :</td>
              <td style="padding: 6px 0; color: #161616; font-weight: bold;">${dateStr} à ${timeStr}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${siteUrl}/calendar"
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Voir mon calendrier
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Email automatique BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <notifications@bailconnect.fr>",
      to: [info.landlordEmail],
      subject,
      html,
    });

    if (emailResult.success) {
      console.log(`Booking notification sent to ${info.landlordEmail} for ${info.campaignTitle}`);
    } else {
      console.error("Booking notification email failed:", emailResult.error);
    }
  },
});

/**
 * Send an immediate booking cancellation email to the landlord.
 */
export const sendCancellationNotification = internalAction({
  args: {
    candidateId: v.id("candidates"),
    slotId: v.id("slots"),
    landlordUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.notifications.getLandlordBookingInfo, {
      candidateId: args.candidateId,
      slotId: args.slotId,
      landlordUserId: args.landlordUserId,
    });

    if (!info || !info.landlordEmail) {
      console.error("Landlord info not found for cancellation notification");
      return;
    }

    const dateStr = formatDateParis(info.slotStartTime, { year: "numeric" });
    const timeStr = formatTimeParis(info.slotStartTime);

    const subject = `❌ Visite annulée – ${info.campaignTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 24px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 6px; color: #161616;">Un candidat a annulé sa visite</h2>
        <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">Annonce : <strong>${info.campaignTitle}</strong></p>

        <div style="background: #F6F6F6; border-left: 4px solid #D63031; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #161616;">
            Le candidat <strong>${info.candidateFirstName} ${info.candidateLastName}</strong> a annulé la visite prévue le <strong>${dateStr} à ${timeStr}</strong>.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Email automatique BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <notifications@bailconnect.fr>",
      to: [info.landlordEmail],
      subject,
      html,
    });

    if (emailResult.success) {
      console.log(`Cancellation notification sent to ${info.landlordEmail} for ${info.campaignTitle}`);
    } else {
      console.error("Cancellation notification email failed:", emailResult.error);
    }
  },
});

/**
 * Send an immediate reschedule notification email to the landlord.
 */
export const sendRescheduleNotification = internalAction({
  args: {
    candidateId: v.id("candidates"),
    slotId: v.id("slots"),
    landlordUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.notifications.getLandlordBookingInfo, {
      candidateId: args.candidateId,
      slotId: args.slotId,
      landlordUserId: args.landlordUserId,
    });

    if (!info || !info.landlordEmail) {
      console.error("Landlord info not found for reschedule notification");
      return;
    }

    const dateStr = formatDateParis(info.slotStartTime, { year: "numeric" });
    const timeStr = formatTimeParis(info.slotStartTime);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const subject = `📅 Rendez-vous déplacé – ${info.campaignTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 24px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 6px; color: #161616;">Un candidat a déplacé son rendez-vous</h2>
        <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">Annonce : <strong>${info.campaignTitle}</strong></p>

        <div style="background: #F5F5FE; border-left: 4px solid #000091; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #161616;">
            Le candidat <strong>${info.candidateFirstName} ${info.candidateLastName}</strong> a modifié son rendez-vous.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #161616; font-weight: bold;">
            Nouvelle date : ${dateStr} à ${timeStr}
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${siteUrl}/calendar"
             style="display: inline-block; background-color: #000091; color: white; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 4px;">
            Voir mon calendrier
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Email automatique BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <notifications@bailconnect.fr>",
      to: [info.landlordEmail],
      subject,
      html,
    });

    if (emailResult.success) {
      console.log(`Reschedule notification sent to ${info.landlordEmail} for ${info.campaignTitle}`);
    } else {
      console.error("Reschedule notification email failed:", emailResult.error);
    }
  },
});


/**
 * Main cron entry: find all users whose digest hour matches the current UTC+2 hour, send digest.
 */
export const sendPendingDigests = internalAction({
  args: {},
  handler: async (ctx) => {
    // Use Paris local hour — handles CET/CEST automatically via Intl
    const nowHour = getParisHour();

    const users = await ctx.runQuery(internal.notifications.getUsersForDigestHour, {
      hour: nowHour,
    });

    for (const user of users) {
      await ctx.runAction(internal.notifications.sendDigestForUser, {
        userId: user._id,
      });
    }
  },
});

/**
 * Send an immediate withdrawal notification email to the landlord.
 */
export const sendWithdrawalNotification = internalAction({
  args: {
    candidateFirstName: v.string(),
    candidateLastName: v.string(),
    campaignTitle: v.string(),
    landlordUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const landlordEmail = await ctx.runQuery(internal.notifications.getUserEmail, {
      userId: args.landlordUserId,
    });
    if (!landlordEmail) {
      console.error("Landlord email not found for withdrawal notification");
      return;
    }

    const subject = `⚠️ Désistement de candidat – ${args.campaignTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #DDDDDD; color: #161616;">
        <div style="background-color: #000091; color: white; padding: 15px 20px; font-weight: bold; font-size: 18px; margin-bottom: 24px;">
          BailConnect
        </div>
        <h2 style="font-size: 20px; margin-bottom: 6px; color: #161616;">Retrait de candidature</h2>
        <p style="font-size: 14px; color: #666666; margin-bottom: 20px;">Annonce : <strong>${args.campaignTitle}</strong></p>

        <div style="background: #F6F6F6; border-left: 4px solid #D63031; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #161616;">
            Le candidat <strong>${args.candidateFirstName} ${args.candidateLastName}</strong> a retiré sa candidature pour votre annonce.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666666;">
            Son dossier et ses éventuels rendez-vous de visite ont été supprimés de la plateforme.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #DDDDDD; margin: 30px 0 15px 0;" />
        <p style="font-size: 11px; color: #666666; text-align: center;">
          Email automatique BailConnect. Ne pas répondre directement à cet email.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      from: "BailConnect <notifications@bailconnect.fr>",
      to: [landlordEmail],
      subject,
      html,
    });

    if (emailResult.success) {
      console.log(`Withdrawal notification sent to ${landlordEmail} for ${args.campaignTitle}`);
    } else {
      console.error("Withdrawal notification email failed:", emailResult.error);
    }
  },
});
