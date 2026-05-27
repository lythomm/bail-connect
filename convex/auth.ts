import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { DatabaseWriter } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          phone: (params.phone as string) ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId) return;
      
      const db = ctx.db as unknown as DatabaseWriter;
      const user = await db.get(args.userId);
      const email = user?.email;
      const name = typeof args.profile.name === "string" ? args.profile.name : undefined;
      const rawPhone = typeof args.profile.phone === "string" ? args.profile.phone : undefined;
      
      let phone: string | undefined = undefined;
      if (rawPhone && rawPhone.trim() !== "") {
        const cleaned = rawPhone.replace(/[\s.-]/g, "");
        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
        if (!phoneRegex.test(cleaned)) {
          throw new Error("Format du numéro de téléphone invalide.");
        }
        phone = cleaned;

        const existing = await db
          .query("users")
          .withIndex("phone", (q) => q.eq("phone", cleaned))
          .filter((q) => q.neq(q.field("_id"), args.userId))
          .first();
        if (existing) {
          throw new Error("Ce numéro de téléphone est déjà utilisé.");
        }
      }

      await db.patch(args.userId, {
        tier: "free",
        name,
        phone,
        phoneVerificationTime: phone ? Date.now() : undefined,
        emailVerificationTime: Date.now(),
        digestHour: 18,
        notificationPreference: "daily",
      });
    },
  },
});
