import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    tier: v.optional(v.union(
      v.literal("free"),
      v.literal("pro")
    )),
  }).index("email", ["email"])
    .index("phone", ["phone"]),

  campaigns: defineTable({
    userId: v.id("users"), // Landlord who created the campaign
    title: v.string(), // e.g., "Studio 20m² Paris 11"
    slug: v.string(), // Unique identifier for public application URL
    description: v.optional(v.string()),
    rentAmount: v.optional(v.number()), // Monthly rent amount CC (in EUR)
    adType: v.optional(v.union(v.literal("free"), v.literal("pass"))),
    createdAt: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_userId", ["userId"]), // INDISPENSABLE pour lister les campagnes d'un proprio connecté,

  candidates: defineTable({
    campaignId: v.id("campaigns"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    age: v.number(),
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

  slots: defineTable({
    campaignId: v.id("campaigns"),
    startTime: v.number(),
    endTime: v.number(),
    maxCapacity: v.number(),
    bookedCount: v.number(),
  }).index("by_campaignId", ["campaignId"]),

  appointments: defineTable({
    slotId: v.id("slots"),
    candidateId: v.id("candidates"),
    campaignId: v.id("campaigns"),
    createdAt: v.number(),
  }).index("by_slotId", ["slotId"])
    .index("by_candidateId", ["candidateId"])
    .index("by_campaignId", ["campaignId"]),
});
