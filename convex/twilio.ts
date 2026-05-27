import { v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Helper function to send SMS via Twilio API.
 */
export async function sendSMS(args: {
  to: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();

  // support Twilio API Keys
  const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim();
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_API_TOKEN)?.trim();

  const username = apiKeySid || accountSid;
  const password = apiKeySecret || authToken;

  if (!accountSid || !username || !password) {
    console.warn("TWILIO configuration is missing. SMS skipped.");
    return { success: false, error: "Missing TWILIO_ACCOUNT_SID, API Key or Auth Token" };
  }

  console.log("Envoi SMS Twilio - Account SID :", accountSid, " - Username utilisé :", username);

  const from = fromNumber || "";

  try {
    const auth = btoa(`${username}:${password}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: args.to,
          From: from,
          Body: args.body,
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio API error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error sending SMS via Twilio:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Internal action to run Twilio SMS send side-effect.
 */
export const sendSMSAction = internalAction({
  args: {
    to: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendSMS({ to: args.to, body: args.body });
  },
});

/**
 * Public mutation to generate and send an OTP code via SMS.
 */
export const sendPhoneOTP = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const cleaned = args.phone.replace(/[\s.-]/g, "");
    if (!cleaned) {
      throw new Error("Le numéro de téléphone est requis.");
    }
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(cleaned)) {
      throw new Error("Format du numéro de téléphone invalide.");
    }

    // Check if phone number is already registered by another user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("phone", (q) => q.eq("phone", cleaned))
      .first();
    if (existingUser) {
      throw new Error("Ce numéro de téléphone est déjà utilisé.");
    }

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // valid for 5 minutes

    // Store in phoneVerifications table
    // Delete any old pending verification for this phone first
    const existingVerifications = await ctx.db
      .query("phoneVerifications")
      .withIndex("by_phone", (q) => q.eq("phone", cleaned))
      .collect();
    for (const vRecord of existingVerifications) {
      await ctx.db.delete(vRecord._id);
    }

    await ctx.db.insert("phoneVerifications", {
      phone: cleaned,
      code,
      verified: false,
      expiresAt,
    });

    // Schedule SMS sending action
    const message = `BailConnect : Votre code de verification est ${code}. Il expire dans 5 minutes.`;
    await ctx.scheduler.runAfter(0, internal.twilio.sendSMSAction, {
      to: cleaned.startsWith("0") ? "+33" + cleaned.substring(1) : cleaned, // ensure international E.164 format for Twilio
      body: message,
    });

    return { success: true };
  },
});

/**
 * Public mutation to verify the SMS OTP code.
 */
export const verifyPhoneOTP = mutation({
  args: {
    phone: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const cleaned = args.phone.replace(/[\s.-]/g, "");
    const submittedCode = args.code.trim();

    if (!cleaned || !submittedCode) {
      throw new Error("Numéro de téléphone et code requis.");
    }

    // Find verification record
    const verification = await ctx.db
      .query("phoneVerifications")
      .withIndex("by_phone", (q) => q.eq("phone", cleaned))
      .order("desc")
      .first();

    if (!verification) {
      throw new Error("Aucun code n'a été demandé pour ce numéro.");
    }

    if (verification.expiresAt < Date.now()) {
      throw new Error("Le code de vérification a expiré. Veuillez en demander un nouveau.");
    }

    if (verification.code !== submittedCode) {
      throw new Error("Le code de vérification est incorrect.");
    }

    // Update verification record to verified: true
    await ctx.db.patch(verification._id, {
      verified: true,
    });

    return { success: true };
  },
});
