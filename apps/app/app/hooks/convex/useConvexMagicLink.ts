/**
 * Convex Magic Link / OTP Auth Hook
 *
 * Provides passwordless authentication via email magic links or OTP codes.
 * Uses the Resend provider configured in convex/auth.ts.
 */

import { useCallback, useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"

import { logger } from "../../utils/Logger"

// ============================================================================
// Types
// ============================================================================

export interface MagicLinkResult {
  error: Error | null
}

export interface UseConvexMagicLinkReturn {
  /** Send a magic link / OTP to the email */
  sendMagicLink: (email: string) => Promise<MagicLinkResult>
  /** Verify the OTP code */
  verifyOtp: (email: string, code: string) => Promise<MagicLinkResult>
  /** Whether an operation is in progress */
  loading: boolean
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for magic link / OTP authentication with Convex
 *
 * @example
 * ```tsx
 * function MagicLinkLogin() {
 *   const { sendMagicLink, verifyOtp, loading } = useConvexMagicLink()
 *   const [email, setEmail] = useState("")
 *   const [code, setCode] = useState("")
 *   const [codeSent, setCodeSent] = useState(false)
 *
 *   const handleSendCode = async () => {
 *     const { error } = await sendMagicLink(email)
 *     if (!error) setCodeSent(true)
 *   }
 *
 *   const handleVerify = async () => {
 *     const { error } = await verifyOtp(email, code)
 *     if (error) alert(error.message)
 *   }
 *
 *   return codeSent ? (
 *     <div>
 *       <input value={code} onChange={e => setCode(e.target.value)} />
 *       <button onClick={handleVerify} disabled={loading}>Verify</button>
 *     </div>
 *   ) : (
 *     <div>
 *       <input value={email} onChange={e => setEmail(e.target.value)} />
 *       <button onClick={handleSendCode} disabled={loading}>Send Code</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useConvexMagicLink(): UseConvexMagicLinkReturn {
  const { signIn } = useAuthActions()
  const [loading, setLoading] = useState(false)

  /**
   * Send a magic link / OTP to the email
   *
   * Uses the "resend" provider configured in convex/auth.ts
   */
  const sendMagicLink = useCallback(
    async (email: string): Promise<MagicLinkResult> => {
      setLoading(true)

      try {
        // Validate email format
        if (!email || !email.includes("@")) {
          return { error: new Error("Please enter a valid email address") }
        }

        // Send the magic link / OTP
        // The "resend" provider is configured in convex/auth.ts
        await signIn("resend", { email })

        if (__DEV__) {
          logger.debug("[ConvexMagicLink] OTP sent to", { email })
        }

        return { error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Handle specific error cases
        if (errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
          return { error: new Error("Too many requests. Please try again later.") }
        }

        if (errorMessage.includes("not configured") || errorMessage.includes("RESEND_API_KEY")) {
          return { error: new Error("Email service not configured. Please contact support.") }
        }

        logger.error("[ConvexMagicLink] Send magic link failed", {}, error as Error)
        return { error: error as Error }
      } finally {
        setLoading(false)
      }
    },
    [signIn],
  )

  /**
   * Verify the OTP code
   *
   * Called after the user receives and enters the code from their email
   */
  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<MagicLinkResult> => {
      setLoading(true)

      try {
        // Validate inputs
        if (!email || !email.includes("@")) {
          return { error: new Error("Please enter a valid email address") }
        }

        if (!code || code.length < 4) {
          return { error: new Error("Please enter a valid verification code") }
        }

        // Verify the OTP code
        await signIn("resend", { email, code })

        if (__DEV__) {
          logger.debug("[ConvexMagicLink] OTP verified for", { email })
        }

        return { error: null }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Handle specific error cases
        if (
          errorMessage.includes("invalid") ||
          errorMessage.includes("expired") ||
          errorMessage.includes("incorrect")
        ) {
          return { error: new Error("Invalid or expired verification code") }
        }

        if (errorMessage.includes("too many")) {
          return { error: new Error("Too many attempts. Please request a new code.") }
        }

        logger.error("[ConvexMagicLink] OTP verification failed", {}, error as Error)
        return { error: error as Error }
      } finally {
        setLoading(false)
      }
    },
    [signIn],
  )

  return {
    sendMagicLink,
    verifyOtp,
    loading,
  }
}
