/**
 * Supabase Auth Store Exports
 *
 * Supabase-specific authentication store implementation.
 * This directory is deleted when using Convex backend.
 */

export { useAuthStore } from "./authStore"
export {
  syncOnboardingToDatabase,
  syncOnboardingStatus,
  fetchOnboardingFromDatabase,
  updateUserState,
  getEmailRedirectUrl,
  getPasswordResetRedirectUrl,
} from "./authHelpers"
