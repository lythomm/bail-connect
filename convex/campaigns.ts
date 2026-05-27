import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

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
 * Shared helper to create a campaign document in DB.
 * Handles unique slug and unique 6-digit candidate code generation.
 */
export async function insertCampaignInternal(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    title: string;
    description?: string;
    rentAmount?: number;
    address?: string;
    adType: "free" | "pass";
    stripeSessionId?: string;
  }
) {
  const baseSlug = slugify(args.title) || "listing";
  const rand = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug}-${rand}`;

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
    adType: args.adType,
    status: "active",
    stripeSessionId: args.stripeSessionId,
    createdAt: Date.now(),
  });
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

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return campaigns.filter((c) => c.status !== "archived");
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

    if (!campaign || campaign.status === "archived") {
      return null;
    }

    // Return only public information
    return {
      _id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      slug: campaign.slug,
      rentAmount: campaign.rentAmount,
      code: campaign.code,
    };
  },
});

/**
 * Get campaign by its unique 6-digit code (public access).
 */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    if (!args.code || args.code.length !== 6) {
      return null;
    }

    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();

    if (!campaign || campaign.status === "archived") {
      return null;
    }

    return {
      _id: campaign._id,
      title: campaign.title,
      slug: campaign.slug,
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
    address: v.optional(v.string()),
    adType: v.optional(v.union(v.literal("free"), v.literal("pass"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to create a campaign");
    }

    const user = await ctx.db.get(userId);
    let adType = args.adType || "free";

    if (adType === "pass") {
      if (user?.tier !== "pro") {
        throw new Error("Vous devez payer ou être membre Pro pour créer une annonce premium.");
      }
    } else {
      // adType === "free"
      if (!user || user.tier !== "pro") {
        const userCampaigns = await ctx.db
          .query("campaigns")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();

        const activeFreeCount = userCampaigns.filter(
          (c) =>
            (c.status === "active" || c.status === undefined) &&
            (c.adType === "free" || c.adType === undefined)
        ).length;

        if (activeFreeCount >= 1) {
          throw new ConvexError("Vous avez atteint la limite d'annonces actives pour le plan gratuit.");
        }
      }
    }

    return await insertCampaignInternal(ctx, {
      userId,
      title: args.title,
      description: args.description,
      rentAmount: args.rentAmount,
      address: args.address,
      adType,
    });
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

    const activeCampaigns = campaigns.filter((c) => c.status !== "archived");

    const results = [];
    for (const campaign of activeCampaigns) {
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
 * Archive a campaign (mark status as archived).
 */
export const archive = mutation({
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

    await ctx.db.patch(args.id, { status: "archived" });
    return { success: true };
  },
});
