/**
 * Auth Store Selectors
 *
 * Memoized selectors for derived auth state
 */

import { useAuthStore } from "../auth"
import type { AuthState } from "../auth/authTypes"

/**
 * Check if user is authenticated
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectIsAuthenticated = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.isAuthenticated)

/**
 * Get current user
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectUser = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.user)

/**
 * Get user email
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectUserEmail = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.user?.email)

/**
 * Get user ID
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectUserId = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.user?.id)

/**
 * Check if onboarding is completed
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectHasCompletedOnboarding = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.hasCompletedOnboarding)

/**
 * Check if auth is loading
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectAuthLoading = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => state.loading)

/**
 * Get full auth state
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectAuthState = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAuthStore((state: AuthState) => ({
    user: state.user,
    session: state.session,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
  }))
