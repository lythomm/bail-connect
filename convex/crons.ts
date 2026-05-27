import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour at :00 — triggers digest for users whose digestHour matches current hour
crons.hourly("send pending digests", { minuteUTC: 0 }, internal.notifications.sendPendingDigests);

// Run daily at 02:00 UTC to clean up expired passes
crons.daily(
  "expire campaign passes",
  { hourUTC: 2, minuteUTC: 0 },
  internal.campaigns.expireCampaignPasses
);

export default crons;
