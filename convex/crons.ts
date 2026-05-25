import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour at :00 — triggers digest for users whose digestHour matches current hour
crons.hourly("send pending digests", { minuteUTC: 0 }, internal.notifications.sendPendingDigests);

export default crons;
