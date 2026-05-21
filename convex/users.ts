import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch the currently authenticated user's record.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

/**
 * Update the user's tier.
 */
export const updateTier = mutation({
  args: {
    tier: v.union(v.literal("free"), v.literal("pass"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(userId, { tier: args.tier });
    return await ctx.db.get(userId);
  },
});
