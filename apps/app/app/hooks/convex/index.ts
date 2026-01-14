/**
 * Convex Hooks (Internal)
 *
 * IMPORTANT: For auth, use `useAuth()` from "@/hooks" instead.
 *
 * This folder contains Convex-specific hooks used internally by the unified `useAuth()` hook.
 * Only import directly from here if you need Convex-specific data hooks (useQuery, useMutation).
 *
 * Usage:
 * ```tsx
 * // For auth - use the unified hook:
 * import { useAuth } from "@/hooks"
 *
 * // For data - use Convex hooks:
 * import { useQuery, useMutation } from "@/hooks"
 * import { api } from "@convex/_generated/api"
 *
 * const posts = useQuery(api.posts.list)
 * const createPost = useMutation(api.posts.create)
 * ```
 */

// Re-export core Convex hooks
export { useQuery, useMutation, useAction, useConvex } from "convex/react"

// Re-export auth-aware components
export { Authenticated, Unauthenticated, AuthLoading } from "convex/react"

// Re-export Convex Auth hooks (native)
export { useAuthActions, useAuthToken } from "@convex-dev/auth/react"
export { useConvexAuth as useConvexAuthBase } from "convex/react"

// Custom unified auth hooks
export {
  useConvexAuth,
  useConvexUser,
  useConvexAuthState,
  type ConvexUser,
  type ConvexAuthState,
  type ConvexAuthActions,
} from "./useConvexAuth"

// Social auth hooks
export {
  useConvexSocialAuth,
  type SocialProvider,
  type SocialAuthResult,
  type UseConvexSocialAuthReturn,
} from "./useConvexSocialAuth"

// Password auth hooks
export {
  useConvexPasswordAuth,
  type PasswordAuthResult,
  type SignUpOptions,
  type SignInOptions,
  type UseConvexPasswordAuthReturn,
} from "./useConvexPasswordAuth"

// Magic link / OTP hooks
export {
  useConvexMagicLink,
  type MagicLinkResult,
  type UseConvexMagicLinkReturn,
} from "./useConvexMagicLink"

// Note: OptimisticUpdate was removed in newer convex versions - use FunctionArgs/FunctionReturnType instead
