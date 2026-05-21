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
      .filter((q) => q.eq(q.field("userId"), userId))
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
      createdAt: Date.now(),
    });

    return campaignId;
  },
});
