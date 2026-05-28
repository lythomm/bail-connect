import { query } from "./_generated/server";
import { v } from "convex/values";

export const getVerificationCode = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Security check: only allow in non-production environments
    const isDev = process.env.CONVEX_DEPLOY_ENVIRONMENT === "development" || !process.env.PROD;
    if (!isDev) {
      throw new Error("Action non autorisée en production");
    }

    // Input validation (Rule 16)
    const email = args.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'e-mail invalide.");
    }

    // Disallow traversal or dangerous characters (Rule 16)
    if (email.includes("/") || email.includes("?") || email.includes("%")) {
      throw new Error("Caractères interdits détectés.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    return user?.emailVerificationCode ?? null;
  },
});
