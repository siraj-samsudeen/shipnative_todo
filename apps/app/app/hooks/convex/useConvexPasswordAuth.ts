/**
 * Convex Password Auth Hook
 *
 * Provides email/password authentication functionality for Convex Auth.
 * Handles sign up, sign in, password reset, and email verification.
 */

import { useCallback, useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"

import { logger } from "../../utils/Logger"

// ============================================================================
// Types
// ============================================================================

export interface PasswordAuthResult {
  error: Error | null
}

export interface SignUpOptions {
  email: string
  password: string
  name?: string
}

export interface SignInOptions {
  email: string
  password: string
}

export interface UseConvexPasswordAuthReturn {
  /** Sign up with email and password */
  signUp: (options: SignUpOptions) => Promise<PasswordAuthResult>
  /** Sign in with email and password */
  signIn: (options: SignInOptions) => Promise<PasswordAuthResult>
  /** Request password reset email */
  resetPassword: (email: string) => Promise<PasswordAuthResult>
  /** Sign out the current user */
  signOut: () => Promise<PasswordAuthResult>
  /** Whether an auth operation is in progress */
  loading: boolean
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for email/password authentication with Convex
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { signIn, loading } = useConvexPasswordAuth()
 *   const [email, setEmail] = useState("")
 *   const [password, setPassword] = useState("")
 *
 *   const handleSubmit = async () => {
 *     const { error } = await signIn({ email, password })
 *     if (error) {
 *       alert(error.message)
 *     }
 *   }
 *
 *   return (
 *     <form>
 *       <input value={email} onChange={e => setEmail(e.target.value)} />
 *       <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
 *       <button onClick={handleSubmit} disabled={loading}>Sign In</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useConvexPasswordAuth(): UseConvexPasswordAuthReturn {
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions()
  const [loading, setLoading] = useState(false)

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (options: SignUpOptions): Promise<PasswordAuthResult> => {
      setLoading(true)

      try {
        // Build params object, only including name if provided
        const params: Record<string, string> = {
          email: options.email,
          password: options.password,
          flow: "signUp",
        }
        if (options.name) {
          params.name = options.name
        }
        await convexSignIn("password", params)

        return { error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Handle specific error cases
        if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
          return { error: new Error("An account with this email already exists") }
        }

        if (errorMessage.includes("password") && errorMessage.includes("weak")) {
          return { error: new Error("Password is too weak. Please use a stronger password.") }
        }

        if (errorMessage.includes("invalid email")) {
          return { error: new Error("Please enter a valid email address") }
        }

        logger.error("[ConvexPasswordAuth] Sign up failed", {}, error as Error)
        return { error: error as Error }
      } finally {
        setLoading(false)
      }
    },
    [convexSignIn],
  )

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (options: SignInOptions): Promise<PasswordAuthResult> => {
      setLoading(true)

      try {
        await convexSignIn("password", {
          email: options.email,
          password: options.password,
          flow: "signIn",
        })

        return { error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Handle specific error cases
        if (
          errorMessage.includes("Invalid credentials") ||
          errorMessage.includes("invalid password") ||
          errorMessage.includes("user not found")
        ) {
          return { error: new Error("Invalid email or password") }
        }

        if (errorMessage.includes("email not verified")) {
          return { error: new Error("Please verify your email before signing in") }
        }

        if (errorMessage.includes("too many")) {
          return { error: new Error("Too many attempts. Please try again later.") }
        }

        logger.error("[ConvexPasswordAuth] Sign in failed", {}, error as Error)
        return { error: error as Error }
      } finally {
        setLoading(false)
      }
    },
    [convexSignIn],
  )

  /**
   * Request password reset email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<PasswordAuthResult> => {
      setLoading(true)

      try {
        // Convex Auth handles password reset via the password provider
        // with flow: "reset"
        await convexSignIn("password", {
          email,
          flow: "reset",
        })

        return { error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Don't reveal if user exists
        if (errorMessage.includes("user not found")) {
          // Return success anyway to prevent email enumeration
          return { error: null }
        }

        logger.error("[ConvexPasswordAuth] Password reset failed", {}, error as Error)
        return { error: error as Error }
      } finally {
        setLoading(false)
      }
    },
    [convexSignIn],
  )

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<PasswordAuthResult> => {
    setLoading(true)

    try {
      await convexSignOut()
      return { error: null }
    } catch (error) {
      logger.error("[ConvexPasswordAuth] Sign out failed", {}, error as Error)
      return { error: error as Error }
    } finally {
      setLoading(false)
    }
  }, [convexSignOut])

  return {
    signUp,
    signIn,
    resetPassword,
    signOut,
    loading,
  }
}
