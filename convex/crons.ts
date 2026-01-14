/**
 * Convex Cron Jobs
 *
 * Schedule recurring tasks like cleanup operations.
 *
 * Learn more: https://docs.convex.dev/scheduling/cron-jobs
 */

import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// ============================================================================
// Presence Cleanup
// Clean up stale presence records every minute
// ============================================================================
crons.interval(
  "cleanup stale presence",
  { minutes: 1 },
  internal.realtime.cleanupStalePresence,
  { maxAgeMs: 60000 } // Remove presence older than 1 minute
)

// ============================================================================
// Broadcast Cleanup
// Clean up expired broadcast messages every 5 minutes
// ============================================================================
crons.interval(
  "cleanup expired broadcasts",
  { minutes: 5 },
  internal.realtime.cleanupExpiredBroadcasts,
  {}
)

export default crons
