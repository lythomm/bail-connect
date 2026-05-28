import { getAuthUserId } from "@convex-dev/auth/server";
import { query, internalMutation, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { sha256 } from "js-sha256";

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
    tier: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { tier: args.tier });
    return await ctx.db.get(args.userId);
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Non autorisé");
    }

    if (args.phone && args.phone.trim() !== "") {
      const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
      if (!phoneRegex.test(args.phone.trim())) {
        throw new ConvexError("Le numéro de téléphone doit être un numéro français valide.");
      }
    }

    await ctx.db.patch(userId, {
      name: args.name,
      phone: args.phone ? args.phone.trim() : undefined,
    });
    return await ctx.db.get(userId);
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    notificationPreference: v.union(v.literal("daily"), v.literal("none")),
    digestHour: v.number(), // 0–23
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");
    // Validate hour range
    if (args.digestHour < 0 || args.digestHour > 23 || !Number.isInteger(args.digestHour)) {
      throw new Error("digestHour doit être un entier entre 0 et 23");
    }
    await ctx.db.patch(userId, {
      notificationPreference: args.notificationPreference,
      digestHour: args.digestHour,
    });
  },
});

/**
 * Verify user's email using a 6-digit OTP code.
 */
export const verifyEmailOTP = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable");

    if (user.emailVerificationTime) {
      return { success: true, message: "E-mail déjà vérifié." };
    }

    const { emailVerificationCode, emailVerificationCodeExpires } = user;

    if (!emailVerificationCode || !emailVerificationCodeExpires) {
      throw new Error("Aucun code de vérification n'a été généré pour ce compte.");
    }

    if (emailVerificationCodeExpires < Date.now()) {
      throw new Error("Le code de vérification a expiré.");
    }

    if (emailVerificationCode !== args.code.trim()) {
      throw new Error("Le code de vérification est incorrect.");
    }

    // Success! Mark email as verified and clear verification fields
    await ctx.db.patch(userId, {
      emailVerificationTime: Date.now(),
      emailVerificationCode: undefined,
      emailVerificationCodeExpires: undefined,
    });

    return { success: true };
  },
});

/**
 * Regenerate and resend verification OTP code to user.
 */
export const resendVerificationCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable");

    if (user.emailVerificationTime) {
      return { success: true, alreadyVerified: true };
    }

    if (!user.email) {
      throw new Error("L'utilisateur n'a pas d'adresse e-mail associée.");
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = Date.now() + 15 * 60 * 1000;

    await ctx.db.patch(userId, {
      emailVerificationCode: newCode,
      emailVerificationCodeExpires: newExpires,
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendOTPCode, {
      email: user.email,
      code: newCode,
    });

    return { success: true };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");
    await ctx.db.patch(userId, { isOnboarded: true });
    return { success: true };
  },
});

export const completeCalendarOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");
    await ctx.db.patch(userId, { isCalendarOnboarded: true });
    return { success: true };
  },
});

export const completeCampaignOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Non autorisé");
    await ctx.db.patch(userId, { isCampaignOnboarded: true });
    return { success: true };
  },
});

export const checkAndRecordScrape = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Non autorisé");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    if (user.tier !== "pro") {
      throw new Error("Cette fonctionnalité nécessite un abonnement PRO");
    }

    const now = Date.now();
    const minInterval = 10000; // 10 secondes
    if (user.lastScrapeTime && now - user.lastScrapeTime < minInterval) {
      const waitSeconds = Math.ceil((minInterval - (now - user.lastScrapeTime)) / 1000);
      throw new Error(`Veuillez patienter encore ${waitSeconds} seconde(s) avant le prochain import.`);
    }

    await ctx.db.patch(userId, {
      lastScrapeTime: now,
    });
    return { success: true };
  },
});

export const checkPhoneUnique = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const cleaned = args.phone.replace(/[\s.-]/g, "");
    if (!cleaned) {
      return { isValid: false, isUnique: false, error: "Le numéro de téléphone est requis." };
    }
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(cleaned)) {
      return { isValid: false, isUnique: false, error: "Format du numéro de téléphone invalide." };
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("phone", (q) => q.eq("phone", cleaned))
      .first();
    return {
      isValid: true,
      isUnique: existing === null,
      error: existing ? "Ce numéro de téléphone est déjà utilisé." : null,
    };
  },
});

export const getEmailFromResetCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    // Nettoyer et valider le format de l'argument (rule 16)
    if (!/^[a-zA-Z0-9-]+$/.test(args.code)) {
      return null;
    }

    const codeHash = sha256(args.code);
    const verificationCode = await ctx.db
      .query("authVerificationCodes")
      .withIndex("code", (q) => q.eq("code", codeHash))
      .unique();

    if (!verificationCode) {
      return null;
    }

    if (verificationCode.expirationTime < Date.now()) {
      return null;
    }

    const account = await ctx.db.get(verificationCode.accountId);
    if (!account) {
      return null;
    }

    return account.providerAccountId; // Retourne l'e-mail
  },
});

export const saveResetTokenForTest = mutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const isDev = process.env.CONVEX_DEPLOY_ENVIRONMENT === "development" || !process.env.PROD;
    if (!isDev) {
      throw new Error("Action non autorisée en production");
    }

    const email = args.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'e-mail invalide.");
    }
    if (email.includes("/") || email.includes("?") || email.includes("%")) {
      throw new Error("Caractères interdits détectés.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        passwordResetCode: args.token,
      });
    }
  },
});


