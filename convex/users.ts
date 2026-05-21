import { getAuthUserId } from "@convex-dev/auth/server";
import { query, internalMutation } from "./_generated/server";
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

export const updateTier = internalMutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pass"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { tier: args.tier });
    return await ctx.db.get(args.userId);
  },
});
