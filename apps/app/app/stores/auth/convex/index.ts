/**
 * Convex Auth Store
 *
 * Provides a Zustand-compatible interface for code that uses useAuthStore.
 * For Convex, the actual auth state is managed by ConvexAuthProvider and the useAuth() hook.
 *
 * This store acts as a bridge, allowing existing code that uses useAuthStore.getState()
 * to work with Convex. The ConvexAuthSync component syncs state from Convex → this store.
 *
 * IMPORTANT: For new code, prefer using useAuth() from @/hooks directly.
 * This store exists only for backwards compatibility.
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { AUTH_STORAGE_KEY, GUEST_USER_KEY, getUserKey, mmkvStorage, sanitizePersistedAuthState } from "../authConstants"
import type { AuthState } from "../authTypes"
import { logger } from "../../../utils/Logger"
import { queryClient } from "../../../hooks/queries"
import { useSubscriptionStore } from "../../subscriptionStore"

/**
 * Convex Auth Store
 *
 * This store is synced from ConvexAuthProvider via the ConvexAuthSync component.
 * Most auth actions are no-ops or delegate to useAuth() - they should not be called directly.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State - synced from ConvexAuthSync
      session: null,
      user: null,
      loading: true,
      isAuthenticated: false,
      isEmailConfirmed: false,
      hasCompletedOnboarding: false,
      onboardingStatusByUserId: { [GUEST_USER_KEY]: true },

      // Setters - called by ConvexAuthSync to sync state
      setSession: (session) => {
        set({
          session,
          isAuthenticated: !!session,
        })
      },

      setUser: (user) => {
        set({
          user,
          isEmailConfirmed: !!user?.email_confirmed_at || !!(user as unknown as { emailVerificationTime?: unknown })?.emailVerificationTime,
        })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      setHasCompletedOnboarding: async (completed) => {
        const { user } = get()
        const userKey = getUserKey(user)
        set((state) => ({
          hasCompletedOnboarding: completed,
          onboardingStatusByUserId: {
            ...state.onboardingStatusByUserId,
            [userKey]: completed,
          },
        }))
        // Note: For Convex, onboarding sync happens via useAuth().completeOnboarding()
        // which calls a Convex mutation. This store method just updates local state.
      },

      // Auth Actions - These should use useAuth() from @/hooks instead
      // They are stubs that log warnings to help developers migrate
      signIn: async (_email, _password) => {
        logger.warn("[ConvexAuthStore] signIn called - use useAuth().signIn instead")
        return { error: new Error("Use useAuth().signIn for Convex authentication") }
      },

      signUp: async (_email, _password) => {
        logger.warn("[ConvexAuthStore] signUp called - use useAuth().signUp instead")
        return { error: new Error("Use useAuth().signUp for Convex authentication") }
      },

      resendConfirmationEmail: async (_email) => {
        logger.warn("[ConvexAuthStore] resendConfirmationEmail called - use useAuth() instead")
        return { error: new Error("Use useAuth() for Convex authentication") }
      },

      verifyEmail: async (_code) => {
        logger.warn("[ConvexAuthStore] verifyEmail called - use useAuth().verifyOtp instead")
        return { error: new Error("Use useAuth().verifyOtp for Convex authentication") }
      },

      signOut: async () => {
        // Clear local state for signOut - this is safe to call
        queryClient.clear()
        const subscriptionState = useSubscriptionStore.getState()
        subscriptionState.setCustomerInfo(null)
        subscriptionState.setWebSubscriptionInfo(null)
        subscriptionState.setPackages([])
        subscriptionState.checkProStatus()

        const guestOnboarding = get().onboardingStatusByUserId[GUEST_USER_KEY] ?? false
        set({
          session: null,
          user: null,
          isAuthenticated: false,
          isEmailConfirmed: false,
          hasCompletedOnboarding: guestOnboarding,
        })
        // Note: The actual Convex signOut happens via useAuth().signOut()
      },

      resetPassword: async (_email) => {
        logger.warn("[ConvexAuthStore] resetPassword called - use useAuth().resetPassword instead")
        return { error: new Error("Use useAuth().resetPassword for Convex authentication") }
      },

      /**
       * Initialize - For Convex, auth initialization is handled by ConvexAuthProvider.
       * This just sets loading to false.
       */
      initialize: async () => {
        if (__DEV__) {
          logger.debug("[ConvexAuthStore] initialize called - Convex handles auth via ConvexAuthProvider")
        }
        set({ loading: false })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => mmkvStorage),
      version: 3,
      partialize: (state) => sanitizePersistedAuthState(state) as unknown as AuthState,
      migrate: (persistedState) => {
        const sanitizedState = sanitizePersistedAuthState(persistedState as Partial<AuthState>)
        const onboardingStatusByUserId = {
          ...sanitizedState.onboardingStatusByUserId,
          [GUEST_USER_KEY]: sanitizedState.onboardingStatusByUserId[GUEST_USER_KEY] ?? true,
        }
        sanitizedState.onboardingStatusByUserId = onboardingStatusByUserId
        return sanitizedState as AuthState
      },
    },
  ),
)

/**
 * Helper functions - Convex versions
 * These are no-ops or simple implementations since Convex handles sync differently.
 */

export async function syncOnboardingToDatabase(_userId: string, _completed: boolean): Promise<void> {
  // For Convex, onboarding is synced via mutations in useAuth().completeOnboarding()
  // This is a no-op for backwards compatibility
}

export async function syncOnboardingStatus(_userId: string, localStatus: boolean): Promise<boolean> {
  // For Convex, onboarding status comes from the user object via useQuery(api.users.me)
  // Just return local status for backwards compatibility
  return localStatus
}

export async function fetchOnboardingFromDatabase(_userId: string): Promise<boolean | null> {
  // For Convex, onboarding status is part of the user object
  return null
}

export function updateUserState(user: AuthState["user"], session: AuthState["session"]) {
  const emailConfirmed = !!user?.email_confirmed_at ||
    !!(user as unknown as { emailVerificationTime?: unknown })?.emailVerificationTime
  return {
    user,
    session,
    isEmailConfirmed: emailConfirmed,
    isAuthenticated: !!session && emailConfirmed,
  }
}

// URL helpers - not used for Convex but exported for compatibility
export function getEmailRedirectUrl(): string | undefined {
  return undefined
}

export function getPasswordResetRedirectUrl(): string | undefined {
  return undefined
}
