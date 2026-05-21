import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  campaigns: defineTable({
    userId: v.id("users"), // Landlord who created the campaign
    title: v.string(), // e.g., "Studio 20m² Paris 11"
    slug: v.string(), // Unique identifier for public application URL
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_userId", ["userId"]), // INDISPENSABLE pour lister les campagnes d'un proprio connecté,

  candidates: defineTable({
    campaignId: v.id("campaigns"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    monthlyIncome: v.number(),
    jobStatus: v.union(
      v.literal("CDI"),
      v.literal("CDD"),
      v.literal("Student"),
      v.literal("Freelance"),
      v.literal("Functionary"),
      v.literal("Other")
    ),
    hasGuarantor: v.boolean(),
    dossierFacileUrl: v.string(),
    nameTrigram: v.string(), // First 3 letters of full name, or custom trigram
    createdAt: v.number(),
  }).index("by_campaignId", ["campaignId"]),
});
