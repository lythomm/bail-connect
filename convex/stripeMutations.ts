import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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

    const slugify = (text: string): string => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    };

    const baseSlug = slugify(args.title) || "listing";
    const rand = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${rand}`;

    // Generate unique 6-digit code
    let code = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const candidateCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await ctx.db
        .query("campaigns")
        .withIndex("by_code", (q) => q.eq("code", candidateCode))
        .unique();
      if (!existing) {
        code = candidateCode;
        isUnique = true;
      }
      attempts++;
    }
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }

    return await ctx.db.insert("campaigns", {
      userId: args.userId,
      title: args.title.trim(),
      slug,
      code,
      description: args.description?.trim(),
      rentAmount: args.rentAmount,
      address: args.address?.trim(),
      adType: "pass",
      status: "active",
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
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
    }
  },
});

