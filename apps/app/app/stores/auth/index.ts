/**
 * Auth Store Exports
 *
 * Re-exports from the backend-specific implementation.
 *
 * During `yarn setup`, the unused backend directory (supabase/ or convex/) is deleted,
 * and this file is updated to directly export from the remaining implementation.
 *
 * IMPORTANT: For new code, prefer using useAuth() from @/hooks directly.
 * The useAuthStore exists for backwards compatibility with code that uses
 * useAuthStore.getState() patterns.
 */

import { isConvex } from "../../config/env"

// Export shared types and constants (these are backend-agnostic)
export { GUEST_USER_KEY } from "./authConstants"
export type { AuthState, PersistedAuthState } from "./authTypes"

// Conditionally export from the correct backend implementation
// Note: After `yarn setup`, only one directory will exist and this file
// will be simplified to a direct export.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const backendModule = isConvex ? require("./convex") : require("./supabase")

export const useAuthStore = backendModule.useAuthStore
export const syncOnboardingToDatabase = backendModule.syncOnboardingToDatabase
export const syncOnboardingStatus = backendModule.syncOnboardingStatus
export const fetchOnboardingFromDatabase = backendModule.fetchOnboardingFromDatabase
export const updateUserState = backendModule.updateUserState
export const getEmailRedirectUrl = backendModule.getEmailRedirectUrl
export const getPasswordResetRedirectUrl = backendModule.getPasswordResetRedirectUrl
