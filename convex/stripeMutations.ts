import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { insertCampaignInternal } from "./campaigns";

export const createPaidCampaign = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    rentAmount: v.optional(v.number()),
    address: v.optional(v.string()),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("stripeSessionId"), args.stripeSessionId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await insertCampaignInternal(ctx, {
      userId: args.userId,
      title: args.title,
      description: args.description,
      rentAmount: args.rentAmount,
      address: args.address,
      adType: "pass",
      stripeSessionId: args.stripeSessionId,
      passExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    });
  },
});

export const markCampaignAsPaid = internalMutation({
  args: {
    campaignId: v.string(),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaignId = ctx.db.normalizeId("campaigns", args.campaignId);
    if (!campaignId) {
      throw new Error("Invalid campaign ID");
    }

    const campaign = await ctx.db.get(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.stripeSessionId !== args.stripeSessionId) {
      await ctx.db.patch(campaignId, {
        adType: "pass",
        stripeSessionId: args.stripeSessionId,
        passExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }
  },
});

export const markUserAsPro = internalMutation({
  args: {
    userId: v.id("users"),
    stripeSessionId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.stripeSessionId !== args.stripeSessionId || user.stripeSubscriptionId !== args.stripeSubscriptionId) {
      await ctx.db.patch(args.userId, {
        tier: "pro",
        stripeSessionId: args.stripeSessionId,
        stripeSubscriptionId: args.stripeSubscriptionId,
      });
    }
  },
});

async function cleanupProCampaignsOnDowngrade(ctx: any, userId: any) {
  const campaigns = await ctx.db
    .query("campaigns")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();

  const proCampaigns = campaigns.filter(
    (c: any) => c.adType === "pass" && (c.stripeSessionId === undefined || c.stripeSessionId === null)
  );

  for (const campaign of proCampaigns) {
    await ctx.db.patch(campaign._id, {
      adType: "free",
      passExpiresAt: undefined,
    });
  }
}

export const downgradeUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(args.userId, {
      tier: "free",
      stripeSubscriptionId: undefined,
    });
    await cleanupProCampaignsOnDowngrade(ctx, args.userId);
  },
});

export const saveCancellationReason = internalMutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("cancellations", {
      userId: args.userId,
      reason: args.reason,
      feedback: args.feedback,
      createdAt: Date.now(),
    });
  },
});

export const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

export const markCouponAsUsed = internalMutation({
  args: {
    userId: v.id("users"),
    couponId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const usedCoupons = user.usedCoupons || [];
    if (!usedCoupons.includes(args.couponId)) {
      await ctx.db.patch(args.userId, {
        usedCoupons: [...usedCoupons, args.couponId],
      });
    }
  },
});

export const downgradeUserBySubscriptionId = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripeSubscriptionId", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        tier: "free",
        stripeSubscriptionId: undefined,
      });
      await cleanupProCampaignsOnDowngrade(ctx, user._id);
    }
  },
});

