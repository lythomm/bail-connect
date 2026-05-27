import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";

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

    // Prevent creating past slots
    if (args.startTime < Date.now()) {
      throw new ConvexError("Impossible de créer un créneau de visite dans le passé.");
    }

    // Validate slot time parameters
    if (args.startTime >= args.endTime) {
      throw new ConvexError("La date de début doit être antérieure à la date de fin.");
    }

    // Validate capacity
    if (!Number.isInteger(args.maxCapacity) || args.maxCapacity <= 0) {
      throw new ConvexError("La capacité maximale doit être un nombre entier supérieur à 0.");
    }

    // Check for overlapping slots
    const existingSlots = await ctx.db
      .query("slots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const hasOverlap = existingSlots.some(
      (slot) => slot.startTime < args.endTime && slot.endTime > args.startTime
    );

    if (hasOverlap) {
      throw new ConvexError("Un créneau de visite existe déjà sur cette plage horaire.");
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

    // Delete appointments on this slot and notify candidates
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .collect();

    for (const appt of appointments) {
      await ctx.scheduler.runAfter(0, internal.emails.sendAppointmentCancellationToCandidate, {
        candidateId: appt.candidateId,
        campaignTitle: campaign.title,
        slotStartTime: slot.startTime,
      });
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
  args: {
    candidateId: v.id("candidates"),
    bookingToken: v.string(),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.bookingToken !== args.bookingToken) {
      return null;
    }

    if (candidate.status !== "accepted") {
      return {
        candidate: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
        },
        campaign: null,
        slots: [],
        currentAppointment: null,
        error: "Candidate status is not accepted",
      };
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign || campaign.status === "archived") {
      return null;
    }

    const slots = await ctx.db
      .query("slots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", candidate.campaignId))
      .collect();

    // Sort chronologically by startTime
    slots.sort((a, b) => a.startTime - b.startTime);

    // Check if this candidate already booked a slot
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    return {
      candidate: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
      },
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
    bookingToken: v.string(),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.bookingToken !== args.bookingToken) {
      throw new Error("Accès refusé : jeton de réservation invalide.");
    }

    if (candidate.status !== "accepted") {
      throw new Error("Candidate is not accepted for booking");
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign || campaign.status === "archived") {
      throw new Error("Campaign is archived");
    }

    const targetSlot = await ctx.db.get(args.slotId);
    if (!targetSlot) {
      throw new Error("Target slot not found");
    }

    if (targetSlot.campaignId !== candidate.campaignId) {
      throw new Error("Slot belongs to a different campaign");
    }

    // Prevent booking past slots (must be in the future)
    if (targetSlot.startTime < Date.now()) {
      throw new ConvexError("Impossible de réserver un créneau déjà passé.");
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

    let isReschedule = false;

    if (existingAppt) {
      if (existingAppt.slotId === args.slotId) {
        // Already booked this exact slot, do nothing
        return existingAppt._id;
      }

      isReschedule = true;

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

    const apptId = await ctx.db.insert("appointments", {
      slotId: args.slotId,
      candidateId: args.candidateId,
      campaignId: candidate.campaignId,
      createdAt: Date.now(),
    });

    // Send immediate booking notification to landlord
    if (isReschedule) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendRescheduleNotification, {
        candidateId: args.candidateId,
        slotId: args.slotId,
        landlordUserId: campaign.userId,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.notifications.sendBookingNotification, {
        candidateId: args.candidateId,
        slotId: args.slotId,
        landlordUserId: campaign.userId,
      });
    }

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

/**
 * Cancel an appointment for a candidate.
 */
export const cancelAppointment = mutation({
  args: {
    candidateId: v.id("candidates"),
    bookingToken: v.string(),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.bookingToken !== args.bookingToken) {
      throw new Error("Accès refusé : jeton de réservation invalide.");
    }

    if (candidate.status !== "accepted") {
      throw new Error("Candidate status is not accepted");
    }

    const campaign = await ctx.db.get(candidate.campaignId);
    if (!campaign || campaign.status === "archived") {
      throw new Error("Campaign is archived");
    }

    const existingAppt = await ctx.db
      .query("appointments")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    if (!existingAppt) {
      throw new Error("No appointment found for this candidate");
    }

    const slot = await ctx.db.get(existingAppt.slotId);
    if (slot) {
      await ctx.db.patch(slot._id, {
        bookedCount: Math.max(0, slot.bookedCount - 1),
      });
    }

    // Send immediate booking cancellation email to landlord
    await ctx.scheduler.runAfter(0, internal.notifications.sendCancellationNotification, {
      candidateId: args.candidateId,
      slotId: existingAppt.slotId,
      landlordUserId: campaign.userId,
    });

    await ctx.db.delete(existingAppt._id);
    return true;
  },
});

/**
 * Update an existing visit slot for a campaign.
 */
export const updateSlot = mutation({
  args: {
    slotId: v.id("slots"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
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
      throw new Error("Unauthorized access to this campaign");
    }

    const newStartTime = args.startTime !== undefined ? args.startTime : slot.startTime;
    const newEndTime = args.endTime !== undefined ? args.endTime : slot.endTime;
    const newMaxCapacity = args.maxCapacity !== undefined ? args.maxCapacity : slot.maxCapacity;

    // Prevent defining a slot in the past if startTime is modified
    if (args.startTime !== undefined && args.startTime < Date.now()) {
      throw new ConvexError("Impossible de définir un créneau de visite dans le passé.");
    }

    // Validate startTime < endTime
    if (newStartTime >= newEndTime) {
      throw new ConvexError("La date de début doit être antérieure à la date de fin.");
    }

    // Validate capacity is positive integer
    if (!Number.isInteger(newMaxCapacity) || newMaxCapacity <= 0) {
      throw new ConvexError("La capacité maximale doit être un nombre entier supérieur à 0.");
    }

    // Validate capacity is not below current bookedCount
    if (newMaxCapacity < slot.bookedCount) {
      throw new ConvexError("La nouvelle capacité est inférieure au nombre de réservations existantes.");
    }

    // If start time has changed, notify booked candidates
    const startTimeChanged = args.startTime !== undefined && args.startTime !== slot.startTime;

    // Update slot
    await ctx.db.patch(args.slotId, {
      startTime: newStartTime,
      endTime: newEndTime,
      maxCapacity: newMaxCapacity,
    });

    if (startTimeChanged) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
        .collect();

      for (const appt of appointments) {
        await ctx.scheduler.runAfter(0, internal.emails.sendAppointmentRescheduleToCandidate, {
          candidateId: appt.candidateId,
          campaignTitle: campaign.title,
          oldSlotStartTime: slot.startTime,
          newSlotStartTime: newStartTime,
        });
      }
    }

    return true;
  },
});



