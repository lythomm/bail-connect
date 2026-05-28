import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";
import { stripeWebhook } from "./stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

const saveTestToken = httpAction(async (ctx, request) => {
  const { email, token } = await request.json();
  if (typeof email !== "string" || typeof token !== "string") {
    return new Response("Arguments invalides", { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail) || !/^[a-zA-Z0-9-]+$/.test(cleanToken)) {
    return new Response("Format d'arguments invalide", { status: 400 });
  }
  if (cleanEmail.includes("/") || cleanEmail.includes("?") || cleanEmail.includes("%") ||
      cleanToken.includes("/") || cleanToken.includes("?") || cleanToken.includes("%")) {
    return new Response("Caractères interdits détectés", { status: 400 });
  }

  await ctx.runMutation(api.users.saveResetTokenForTest, { email: cleanEmail, token: cleanToken });
  return new Response("OK", { status: 200 });
});

http.route({
  path: "/save-test-token",
  method: "POST",
  handler: saveTestToken,
});

http.route({
  path: "/stripe",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
