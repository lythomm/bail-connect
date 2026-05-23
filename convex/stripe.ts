import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PASS_PRICE_ID = "price_1TaBcm3nf3q37Shxy8Jj8ulQ";
const PRO_PRICE_ID = "price_1TaBcq3nf3q37ShxV6bD29Ss";

export const createCheckoutSession = action({
  args: {
    type: v.union(v.literal("pass"), v.literal("upgrade_campaign"), v.literal("pro")),
    campaignId: v.optional(v.string()),
    campaignData: v.optional(v.object({
      title: v.string(),
      description: v.optional(v.string()),
      rentAmount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    let successUrl = "";
    let cancelUrl = "";
    let priceId = "";
    let mode: "payment" | "subscription" = "payment";
    const metadata: Record<string, string> = {
      userId,
      type: args.type,
    };

    if (args.type === "pass") {
      priceId = PASS_PRICE_ID;
      mode = "payment";
      successUrl = `${siteUrl}/dashboard/campaigns/new/success?session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${siteUrl}/dashboard/campaigns/new?canceled=true`;
      
      metadata.title = args.campaignData?.title || "";
      if (args.campaignData?.description) {
        metadata.description = args.campaignData.description;
      }
      if (args.campaignData?.rentAmount !== undefined) {
        metadata.rentAmount = String(args.campaignData.rentAmount);
      }
    } else if (args.type === "upgrade_campaign") {
      if (!args.campaignId) {
        throw new Error("Missing campaignId for upgrade");
      }
      priceId = PASS_PRICE_ID;
      mode = "payment";
      successUrl = `${siteUrl}/dashboard/campaigns/${args.campaignId}?success=true&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${siteUrl}/dashboard/campaigns/${args.campaignId}?canceled=true`;
      metadata.campaignId = args.campaignId;
    } else if (args.type === "pro") {
      priceId = PRO_PRICE_ID;
      mode = "subscription";
      successUrl = `${siteUrl}/profile?success=true&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${siteUrl}/profile?canceled=true`;
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is not configured on the server.");
    }

    const params = new URLSearchParams();
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("mode", mode);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");

    if (mode === "payment") {
      // Exclut MB WAY, Bancontact, Satispay et EPS. Seuls carte et Klarna autorisés.
      params.append("payment_method_types[0]", "card");
      params.append("payment_method_types[1]", "klarna");
    } else {
      // Exclut MB WAY, Bancontact, Satispay et EPS. Seule la carte autorisée pour abonnement.
      params.append("payment_method_types[0]", "card");
    }
    
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Stripe error:", errText);
      throw new Error(`Failed to create Stripe session: ${response.statusText}`);
    }

    const session = await response.json();
    return { url: session.url };
  },
});

export const verifySession = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args): Promise<
    | { success: boolean; error: string; type?: undefined; campaignId?: undefined }
    | { success: boolean; type: "pass"; campaignId: string; error?: undefined }
    | { success: boolean; type: "upgrade_campaign"; campaignId: string; error?: undefined }
    | { success: boolean; type: "pro"; campaignId?: undefined; error?: undefined }
  > => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is not configured on the server.");
    }

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${args.sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Stripe session retrieve error:", errText);
      throw new Error(`Failed to retrieve Stripe session: ${response.statusText}`);
    }

    const session = await response.json();
    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" };
    }

    const metadata = session.metadata || {};
    const type = metadata.type;
    const sessionUserId = metadata.userId;

    if (sessionUserId !== userId) {
      throw new Error("Unauthorized session verification");
    }

    if (type === "pass") {
      const title = metadata.title;
      const description = metadata.description || undefined;
      const rentAmount = metadata.rentAmount ? parseFloat(metadata.rentAmount) : undefined;

      const campaignId = await ctx.runMutation((internal as any).stripeMutations.createPaidCampaign, {
        userId,
        title,
        description,
        rentAmount,
        stripeSessionId: args.sessionId,
      });

      return { success: true, type: "pass", campaignId };
    } else if (type === "upgrade_campaign") {
      const campaignId = metadata.campaignId;
      await ctx.runMutation((internal as any).stripeMutations.markCampaignAsPaid, {
        campaignId,
        stripeSessionId: args.sessionId,
      });
      return { success: true, type: "upgrade_campaign", campaignId };
    } else if (type === "pro") {
      const subscriptionId = session.subscription || undefined;
      await ctx.runMutation((internal as any).stripeMutations.markUserAsPro, {
        userId,
        stripeSessionId: args.sessionId,
        stripeSubscriptionId: subscriptionId,
      });
      return { success: true, type: "pro" };
    }

    return { success: false, error: "Unknown session type" };
  },
});

export const cancelSubscription = action({
  args: {
    reason: v.string(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is not configured on the server.");
    }

    const user = await ctx.runQuery(api.users.current);
    if (!user) {
      throw new Error("User not found");
    }

    const subscriptionId = user.stripeSubscriptionId;
    if (!subscriptionId) {
      return { success: false, error: "Aucun abonnement actif trouvé." };
    }

    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Stripe subscription cancellation error:", errText);
      throw new Error(`Failed to cancel subscription: ${response.statusText}`);
    }

    await ctx.runMutation((internal as any).stripeMutations.downgradeUser, {
      userId: user._id,
    });

    await ctx.runMutation((internal as any).stripeMutations.saveCancellationReason, {
      userId: user._id,
      reason: args.reason,
      feedback: args.feedback,
    });

    return { success: true };
  },
});
