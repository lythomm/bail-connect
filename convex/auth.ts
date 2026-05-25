import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId) return;
      
      const user = await ctx.db.get(args.userId);
      const email = user?.email;
      const name = typeof args.profile.name === "string" ? args.profile.name : undefined;
      
      let otpCode: string | undefined = undefined;
      let otpExpires: number | undefined = undefined;
      
      if (email) {
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpires = Date.now() + 15 * 60 * 1000;
      }

      await ctx.db.patch(args.userId, {
        tier: "free",
        name,
        digestHour: 18,
        notificationPreference: "daily",
        emailVerificationCode: otpCode,
        emailVerificationCodeExpires: otpExpires,
      });

      if (email && otpCode) {
        await ctx.scheduler.runAfter(0, internal.emails.sendOTPCode, {
          email,
          code: otpCode,
        });
      }
    },
  },
});
