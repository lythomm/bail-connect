import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new visit slot for a campaign.
 */
export const createSlot = mutation({
  args: {
    campaignId: v.id("campaigns"),
    startTime: v.number(),
    endTime: v.number(),
    maxCapacity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new Error("Unauthorized access to this campaign");
    }

    const slotId = await ctx.db.insert("slots", {
      campaignId: args.campaignId,
      startTime: args.startTime,
      endTime: args.endTime,
      maxCapacity: args.maxCapacity,
      bookedCount: 0,
    });

    return slotId;
  },
});

/**
 * Delete a slot and its appointments.
 */
export const deleteSlot = mutation({
  args: {
    slotId: v.id("slots"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const campaign = await ctx.db.get(slot.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new Error("Unauthorized access");
    }

    // Delete appointments on this slot
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .collect();

    for (const appt of appointments) {
      await ctx.db.delete(appt._id);
    }

    await ctx.db.delete(args.slotId);
    return true;
  },
});

/**
 * Get all slots and their booked candidates for a campaign (Landlord View).
 */
export const getCampaignSlots = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== userId) {
      throw new Error("Unauthorized access");
    }

    const slots = await ctx.db
      .query("slots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("asc")
      .collect();

    const results = [];
    for (const slot of slots) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_slotId", (q) => q.eq("slotId", slot._id))
        .collect();

      const candidates = [];
      for (const appt of appointments) {
        const candidate = await ctx.db.get(appt.candidateId);
        if (candidate) {
          candidates.push({
            appointmentId: appt._id,
            ...candidate,
          });
        }
      }

      results.push({
        ...slot,
        candidates,
      });
    }

    return results;
  },
});

/**
 * Fetch candidate details and their campaign's slots for booking (Public View).
 */
export const getBookingPageData = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      return null;
    }

    if (candidate.status !== "accepted") {
      return {
        candidate,
        campaign: null,
        slots: [],
        currentAppointment: null,
        error: "Candidate status is not accepted",
      };
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign) {
      return null;
    }

    // Get all slots for this campaign
    const slots = await ctx.db
      .query("slots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", candidate.campaignId))
      .order("asc")
      .collect();

    // Check if this candidate already booked a slot
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    return {
      candidate,
      campaign: {
        _id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        rentAmount: campaign.rentAmount,
        address: campaign.address,
      },
      slots,
      currentAppointment: existingAppointment,
    };
  },
});

/**
 * Book or reschedule a slot for an accepted candidate.
 */
export const bookAppointment = mutation({
  args: {
    slotId: v.id("slots"),
    candidateId: v.id("candidates"),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    if (candidate.status !== "accepted") {
      throw new Error("Candidate is not accepted for booking");
    }

    const targetSlot = await ctx.db.get(args.slotId);
    if (!targetSlot) {
      throw new Error("Target slot not found");
    }

    if (targetSlot.campaignId !== candidate.campaignId) {
      throw new Error("Slot belongs to a different campaign");
    }

    // Check if target slot is full
    if (targetSlot.bookedCount >= targetSlot.maxCapacity) {
      throw new Error("This slot is already full");
    }

    // Check if candidate already has an appointment
    const existingAppt = await ctx.db
      .query("appointments")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    if (existingAppt) {
      if (existingAppt.slotId === args.slotId) {
        // Already booked this exact slot, do nothing
        return existingAppt._id;
      }

      // Rescheduling: decrement bookedCount on previous slot
      const previousSlot = await ctx.db.get(existingAppt.slotId);
      if (previousSlot) {
        await ctx.db.patch(previousSlot._id, {
          bookedCount: Math.max(0, previousSlot.bookedCount - 1),
        });
      }
      // Delete old appointment
      await ctx.db.delete(existingAppt._id);
    }

    // Increment bookedCount on new slot
    await ctx.db.patch(args.slotId, {
      bookedCount: targetSlot.bookedCount + 1,
    });

    // Create new appointment
    const apptId = await ctx.db.insert("appointments", {
      slotId: args.slotId,
      candidateId: args.candidateId,
      campaignId: candidate.campaignId,
      createdAt: Date.now(),
    });

    return apptId;
  },
});

/**
 * Get all appointments across all campaigns for the landlord.
 */
export const getAllUpcomingAppointments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const results = [];
    for (const campaign of campaigns) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaign._id))
        .collect();

      for (const appt of appointments) {
        const slot = await ctx.db.get(appt.slotId);
        const candidate = await ctx.db.get(appt.candidateId);
        if (slot && candidate) {
          results.push({
            appointmentId: appt._id,
            slotId: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            candidate,
            campaign,
          });
        }
      }
    }

    return results.sort((a, b) => a.startTime - b.startTime);
  },
});

/**
 * Get all slots and candidate bookings across all campaigns of the landlord.
 */
export const getAllCampaignSlots = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const results = [];
    for (const campaign of campaigns) {
      const slots = await ctx.db
        .query("slots")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaign._id))
        .collect();

      for (const slot of slots) {
        const appointments = await ctx.db
          .query("appointments")
          .withIndex("by_slotId", (q) => q.eq("slotId", slot._id))
          .collect();

        const candidates = [];
        for (const appt of appointments) {
          const candidate = await ctx.db.get(appt.candidateId);
          if (candidate) {
            candidates.push({
              appointmentId: appt._id,
              ...candidate,
            });
          }
        }

        results.push({
          ...slot,
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          candidates,
        });
      }
    }

    return results;
  },
});


