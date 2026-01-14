/**
 * Convex Auth Hook
 *
 * Provides a unified auth interface for Convex that matches the app's auth patterns.
 * This wraps Convex Auth's native hooks to provide a consistent DX.
 */

import { useCallback, useMemo } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth as useConvexAuthBase } from "convex/react"
import { useQuery, useMutation } from "convex/react"

import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"

// ============================================================================
// Types
// ============================================================================

export interface ConvexUser {
  _id: Id<"users">
  _creationTime: number
  name?: string
  email?: string
  image?: string
  avatarUrl?: string
  bio?: string
  hasCompletedOnboarding?: boolean
  preferences?: {
    theme?: "light" | "dark" | "system"
    notifications?: boolean
    language?: string
  }
  lastSeenAt?: number
  emailVerificationTime?: number
  phone?: string
  phoneVerificationTime?: number
  isAnonymous?: boolean
}

export interface ConvexAuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Whether the auth state is loading */
  isLoading: boolean
  /** The current user (null if not authenticated or loading) */
  user: ConvexUser | null | undefined
  /** User ID shortcut */
  userId: Id<"users"> | null
  /** Whether the user's email is verified */
  isEmailVerified: boolean
  /** Whether onboarding is completed */
  hasCompletedOnboarding: boolean
}

export interface ConvexAuthActions {
  /** Sign in with email/password */
  signInWithPassword: (email: string, password: string) => Promise<void>
  /** Sign up with email/password */
  signUpWithPassword: (email: string, password: string) => Promise<void>
  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: "google" | "apple" | "github") => Promise<void>
  /** Sign out */
  signOut: () => Promise<void>
  /** Reset password */
  resetPassword: (email: string) => Promise<void>
  /** Update user profile */
  updateProfile: (data: { name?: string; bio?: string; avatarUrl?: string }) => Promise<void>
  /** Complete onboarding */
  completeOnboarding: () => Promise<void>
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * useConvexAuth - Primary auth hook for Convex
 *
 * Provides authentication state and actions in a unified interface.
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { isAuthenticated, isLoading, user, signOut } = useConvexAuth()
 *
 *   if (isLoading) return <Loading />
 *   if (!isAuthenticated) return <SignInPrompt />
 *
 *   return (
 *     <View>
 *       <Text>Hello, {user?.name}</Text>
 *       <Button onPress={signOut} title="Sign Out" />
 *     </View>
 *   )
 * }
 * ```
 */
export function useConvexAuth(): ConvexAuthState & ConvexAuthActions {
  // Core Convex auth state
  const { isAuthenticated, isLoading } = useConvexAuthBase()
  const { signIn, signOut: convexSignOut } = useAuthActions()

  // Get current user from Convex
  const user = useQuery(api.users.me)

  // Mutations
  const updateProfileMutation = useMutation(api.users.updateProfile)
  const completeOnboardingMutation = useMutation(api.users.completeOnboarding)

  // ========================================================================
  // Derived State
  // ========================================================================

  const userId = user?._id ?? null
  const isEmailVerified = !!user?.emailVerificationTime
  const hasCompletedOnboarding = user?.hasCompletedOnboarding ?? false

  // ========================================================================
  // Actions
  // ========================================================================

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      await signIn("password", { email, password, flow: "signIn" })
    },
    [signIn],
  )

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      await signIn("password", { email, password, flow: "signUp" })
    },
    [signIn],
  )

  const signInWithOAuth = useCallback(
    async (provider: "google" | "apple" | "github") => {
      await signIn(provider)
    },
    [signIn],
  )

  const signOut = useCallback(async () => {
    await convexSignOut()
  }, [convexSignOut])

  const resetPassword = useCallback(
    async (email: string) => {
      await signIn("password", { email, flow: "reset" })
    },
    [signIn],
  )

  const updateProfile = useCallback(
    async (data: { name?: string; bio?: string; avatarUrl?: string }) => {
      await updateProfileMutation(data)
    },
    [updateProfileMutation],
  )

  const completeOnboarding = useCallback(async () => {
    await completeOnboardingMutation({})
  }, [completeOnboardingMutation])

  // ========================================================================
  // Return
  // ========================================================================

  return useMemo(
    () => ({
      // State
      isAuthenticated,
      isLoading,
      user,
      userId,
      isEmailVerified,
      hasCompletedOnboarding,
      // Actions
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      signOut,
      resetPassword,
      updateProfile,
      completeOnboarding,
    }),
    [
      isAuthenticated,
      isLoading,
      user,
      userId,
      isEmailVerified,
      hasCompletedOnboarding,
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      signOut,
      resetPassword,
      updateProfile,
      completeOnboarding,
    ],
  )
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * useConvexUser - Get just the current user
 *
 * @example
 * ```tsx
 * const user = useConvexUser()
 * ```
 */
export function useConvexUser(): ConvexUser | null | undefined {
  return useQuery(api.users.me)
}

/**
 * useConvexAuthState - Get just the auth state (no actions)
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading } = useConvexAuthState()
 * ```
 */
export function useConvexAuthState(): Pick<ConvexAuthState, "isAuthenticated" | "isLoading"> {
  return useConvexAuthBase()
}
