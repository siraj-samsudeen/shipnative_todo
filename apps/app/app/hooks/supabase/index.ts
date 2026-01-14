/**
 * Supabase Hooks (Internal)
 *
 * IMPORTANT: For auth, use `useAuth()` from "@/hooks" instead.
 *
 * This folder contains Supabase-specific hooks used internally by the unified `useAuth()` hook.
 * You should not need to import from here directly.
 *
 * Usage:
 * ```tsx
 * // For auth - use the unified hook:
 * import { useAuth } from "@/hooks"
 *
 * const { isAuthenticated, user, signIn, signOut } = useAuth()
 * ```
 */

export {
  useSupabaseAuth,
  useSupabaseUser,
  useSupabaseAuthState,
  type SupabaseAuthState,
  type SupabaseAuthActions,
} from "./useSupabaseAuth"
