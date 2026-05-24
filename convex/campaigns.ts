import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to slugify a text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, ""); // Clean trailing/leading hyphens
}

/**
 * List all campaigns for the authenticated landlord.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get details of a specific campaign (restricted to the landlord owner).
 */
export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      return null;
    }

    if (campaign.userId !== userId) {
      throw new Error("Unauthorized access to this campaign");
    }

    return campaign;
  },
});

/**
 * Get public info of a campaign by its unique slug (unauthenticated candidate access).
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!campaign) {
      return null;
    }

    // Return only public information
    return {
      _id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      slug: campaign.slug,
      rentAmount: campaign.rentAmount,
    };
  },
});

/**
 * Create a new campaign.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    rentAmount: v.optional(v.number()),
    adType: v.optional(v.union(v.literal("free"), v.literal("pass"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to create a campaign");
    }

    // Generate unique slug
    const baseSlug = slugify(args.title) || "listing";
    const rand = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${rand}`;

    const campaignId = await ctx.db.insert("campaigns", {
      userId,
      title: args.title.trim(),
      slug,
      description: args.description?.trim(),
      rentAmount: args.rentAmount,
      adType: args.adType || "free",
      createdAt: Date.now(),
    });

    return campaignId;
  },
});

/**
 * List all campaigns for the authenticated landlord with computed candidate stats.
 */
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const results = [];
    for (const campaign of campaigns) {
      const candidates = await ctx.db
        .query("candidates")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaign._id))
        .collect();

      const total = candidates.length;
      const accepted = candidates.filter((c) => c.status === "accepted").length;
      const rejected = candidates.filter((c) => c.status === "rejected").length;
      const pending = candidates.filter((c) => c.status === "pending").length;

      results.push({
        ...campaign,
        stats: {
          total,
          accepted,
          rejected,
          pending,
        },
      });
    }

    return results;
  },
});

/**
 * Upgrade a campaign's adType to premium "pass" (restricted to landlord owner).
 */
export const upgradeToPass = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { adType: "pass" });
    return { success: true };
  },
});

/**
 * Delete a campaign and all associated candidates, slots, and appointments.
 */
export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // 1. Delete appointments associated with the campaign
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
      .collect();
    for (const appt of appointments) {
      await ctx.db.delete(appt._id);
    }

    // 2. Delete slots associated with the campaign
    const slots = await ctx.db
      .query("slots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
      .collect();
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }

    // 3. Delete candidates associated with the campaign
    const candidates = await ctx.db
      .query("candidates")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
      .collect();
    for (const candidate of candidates) {
      await ctx.db.delete(candidate._id);
    }

    // 4. Delete the campaign itself
    await ctx.db.delete(args.id);

    return { success: true };
  },
});



