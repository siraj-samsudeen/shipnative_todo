/**
 * Convex Auth Service
 *
 * Implements the AuthService interface for Convex Auth.
 *
 * Convex Auth is a native authentication solution that runs directly
 * on your Convex backend. This service bridges the Convex Auth API
 * to the unified AuthService interface.
 */

import type {
  AuthService,
  AuthResult,
  BackendUser,
  BackendSession,
  SignUpCredentials,
  SignInCredentials,
  UpdateUserAttributes,
  OAuthProvider,
  AuthChangeEvent,
} from "../types"
import { getConvexClient, convexSecureStorage, isUsingMockConvex } from "./client"
import { logger } from "../../../utils/Logger"

// ============================================================================
// Internal State
// ============================================================================

interface ConvexAuthState {
  user: BackendUser | null
  session: BackendSession | null
  isAuthenticated: boolean
  listeners: Set<(event: AuthChangeEvent, session: BackendSession | null) => void>
}

const authState: ConvexAuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  listeners: new Set(),
}

function notifyListeners(event: AuthChangeEvent, session: BackendSession | null) {
  authState.listeners.forEach((listener) => {
    try {
      listener(event, session)
    } catch (error) {
      logger.error("Auth listener error", {}, error as Error)
    }
  })
}

// ============================================================================
// Convex Auth Service Implementation
// ============================================================================

/**
 * Create a Convex Auth service instance.
 *
 * Note: Convex Auth requires the `@convex-dev/auth` package and
 * corresponding Convex functions to be set up. This service assumes
 * the following Convex functions exist:
 *
 * - auth.signUp: Sign up with email/password
 * - auth.signIn: Sign in with email/password
 * - auth.signOut: Sign out
 * - auth.getSession: Get current session
 * - auth.getUser: Get current user
 * - auth.resetPassword: Request password reset
 * - auth.verifyOtp: Verify OTP code
 *
 * For OAuth, Convex Auth handles this through the ConvexAuthProvider
 * and requires additional configuration.
 */
export function createConvexAuthService(): AuthService {
  const getClient = () => getConvexClient()

  /**
   * Helper to create a session object from Convex auth response
   */
  const createSession = (token: string, user: BackendUser): BackendSession => ({
    accessToken: token,
    user,
    _raw: { token, user },
  })

  /**
   * Helper to convert Convex user to BackendUser
   */
  const convertUser = (convexUser: Record<string, unknown>): BackendUser => ({
    id: convexUser._id as string,
    email: convexUser.email as string | undefined,
    emailConfirmedAt: convexUser.emailVerified ? new Date().toISOString() : null,
    createdAt: convexUser._creationTime
      ? new Date(convexUser._creationTime as number).toISOString()
      : new Date().toISOString(),
    userMetadata: convexUser,
    _raw: convexUser,
  })

  return {
    // ========================================================================
    // Session Management
    // ========================================================================

    async getSession(): Promise<AuthResult<BackendSession>> {
      try {
        const token = await convexSecureStorage.getToken()

        if (!token) {
          return { data: null, error: null }
        }

        // For Convex, we store the session locally and validate on the server
        if (authState.session) {
          return { data: authState.session, error: null }
        }

        // If we have a token but no session state, we need to restore it
        // This would typically be done via a Convex query
        return { data: null, error: null }
      } catch (error) {
        return {
          data: null,
          error: { name: "AuthError", message: (error as Error).message },
        }
      }
    },

    async setSession(session: {
      accessToken: string
      refreshToken: string
    }): Promise<AuthResult<BackendSession>> {
      try {
        await convexSecureStorage.setToken(session.accessToken)
        if (session.refreshToken) {
          await convexSecureStorage.setRefreshToken(session.refreshToken)
        }

        // Update internal state
        if (authState.user) {
          authState.session = createSession(session.accessToken, authState.user)
          authState.isAuthenticated = true
          notifyListeners("SIGNED_IN", authState.session)
          return { data: authState.session, error: null }
        }

        return { data: null, error: null }
      } catch (error) {
        return {
          data: null,
          error: { name: "AuthError", message: (error as Error).message },
        }
      }
    },

    async refreshSession(): Promise<AuthResult<BackendSession>> {
      // Convex Auth handles token refresh automatically
      // This is a no-op for Convex
      return { data: authState.session, error: null }
    },

    // ========================================================================
    // Email/Password Auth
    // ========================================================================

    async signUp(
      credentials: SignUpCredentials,
    ): Promise<AuthResult<{ user: BackendUser; session: BackendSession | null }>> {
      try {
        if (isUsingMockConvex) {
          // Mock implementation
          const mockUser: BackendUser = {
            id: `mock-${Date.now()}`,
            email: credentials.email,
            createdAt: new Date().toISOString(),
            userMetadata: credentials.options?.data,
          }
          authState.user = mockUser
          return { data: { user: mockUser, session: null }, error: null }
        }

        // In a real implementation, this would call a Convex mutation
        // The Convex Auth library provides signIn action that handles both signup and signin
        // You would use: `useAuthActions().signIn("password", { email, password, flow: "signUp" })`

        // For now, return an error indicating the action should be handled via ConvexAuthProvider
        return {
          data: null,
          error: {
            name: "AuthError",
            message: "Sign up should be handled via ConvexAuthProvider and useAuthActions hook",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "AuthError", message: (error as Error).message },
        }
      }
    },

    async signInWithPassword(
      credentials: SignInCredentials,
    ): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      try {
        if (isUsingMockConvex) {
          // Mock implementation
          const mockUser: BackendUser = {
            id: `mock-${Date.now()}`,
            email: credentials.email,
            emailConfirmedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
          const mockToken = `mock-token-${Date.now()}`
          const mockSession = createSession(mockToken, mockUser)

          authState.user = mockUser
          authState.session = mockSession
          authState.isAuthenticated = true

          await convexSecureStorage.setToken(mockToken)
          notifyListeners("SIGNED_IN", mockSession)

          return { data: { user: mockUser, session: mockSession }, error: null }
        }

        // For Convex Auth, sign in is handled via the ConvexAuthProvider
        return {
          data: null,
          error: {
            name: "AuthError",
            message: "Sign in should be handled via ConvexAuthProvider and useAuthActions hook",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "AuthError", message: (error as Error).message },
        }
      }
    },

    async signOut(options?: { scope?: "local" | "global" }): Promise<AuthResult<void>> {
      try {
        // Clear local state
        authState.user = null
        authState.session = null
        authState.isAuthenticated = false

        // Clear stored tokens
        await convexSecureStorage.clear()

        // Clear Convex client auth
        const client = getClient()
        if (
          client &&
          typeof (client as unknown as { clearAuth?: () => void }).clearAuth === "function"
        ) {
          ;(client as unknown as { clearAuth: () => void }).clearAuth()
        }

        notifyListeners("SIGNED_OUT", null)

        return { data: null, error: null }
      } catch (error) {
        return {
          data: null,
          error: { name: "AuthError", message: (error as Error).message },
        }
      }
    },

    // ========================================================================
    // OAuth
    // ========================================================================

    async signInWithOAuth(options: {
      provider: OAuthProvider
      redirectTo?: string
      skipBrowserRedirect?: boolean
    }): Promise<AuthResult<{ url?: string }>> {
      // Convex Auth OAuth is handled via the ConvexAuthProvider
      // The flow is: signIn("oauth", { provider: "google" })
      return {
        data: null,
        error: {
          name: "AuthError",
          message: `OAuth sign in with ${options.provider} should be handled via ConvexAuthProvider and useAuthActions hook`,
        },
      }
    },

    async signInWithIdToken(options: {
      provider: OAuthProvider
      token: string
      accessToken?: string
    }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      // ID token sign in is provider-specific
      // For native Google/Apple sign in, the token would be verified server-side
      return {
        data: null,
        error: {
          name: "AuthError",
          message: `ID token sign in for ${options.provider} should be handled via Convex function`,
        },
      }
    },

    async exchangeCodeForSession(code: string): Promise<AuthResult<{ session: BackendSession }>> {
      // OAuth code exchange is handled by Convex Auth internally
      return {
        data: null,
        error: {
          name: "AuthError",
          message: "Code exchange is handled internally by Convex Auth",
        },
      }
    },

    // ========================================================================
    // Magic Link / OTP
    // ========================================================================

    async signInWithOtp(options: {
      email: string
      options?: { emailRedirectTo?: string; captchaToken?: string }
    }): Promise<AuthResult<void>> {
      // Convex Auth OTP: signIn("resend-otp", { email })
      return {
        data: null,
        error: {
          name: "AuthError",
          message: "OTP sign in should be handled via ConvexAuthProvider and useAuthActions hook",
        },
      }
    },

    async verifyOtp(options: {
      email: string
      token: string
      type: "email" | "sms" | "phone_change" | "email_change"
    }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      // OTP verification is handled via signIn("resend-otp", { code })
      return {
        data: null,
        error: {
          name: "AuthError",
          message:
            "OTP verification should be handled via ConvexAuthProvider and useAuthActions hook",
        },
      }
    },

    // ========================================================================
    // Password Management
    // ========================================================================

    async resetPasswordForEmail(
      email: string,
      options?: { redirectTo?: string },
    ): Promise<AuthResult<void>> {
      // Convex Auth: signIn("password", { email, flow: "reset" })
      return {
        data: null,
        error: {
          name: "AuthError",
          message:
            "Password reset should be handled via ConvexAuthProvider and useAuthActions hook",
        },
      }
    },

    async updateUser(attributes: UpdateUserAttributes): Promise<AuthResult<{ user: BackendUser }>> {
      // User updates would be handled via a custom Convex mutation
      return {
        data: null,
        error: {
          name: "AuthError",
          message: "User update should be handled via a custom Convex mutation",
        },
      }
    },

    // ========================================================================
    // User Info
    // ========================================================================

    async getUser(): Promise<AuthResult<{ user: BackendUser }>> {
      if (authState.user) {
        return { data: { user: authState.user }, error: null }
      }
      return { data: null, error: null }
    },

    // ========================================================================
    // Listeners
    // ========================================================================

    onAuthStateChange(callback: (event: AuthChangeEvent, session: BackendSession | null) => void): {
      unsubscribe: () => void
    } {
      authState.listeners.add(callback)

      // Emit initial state
      if (authState.isAuthenticated && authState.session) {
        callback("INITIAL_SESSION", authState.session)
      }

      return {
        unsubscribe: () => {
          authState.listeners.delete(callback)
        },
      }
    },

    // ========================================================================
    // Auto-refresh (handled by Convex internally)
    // ========================================================================

    startAutoRefresh(): void {
      // Convex handles token refresh automatically
    },

    stopAutoRefresh(): void {
      // No-op for Convex
    },
  }
}

// ============================================================================
// Auth State Management (for ConvexAuthProvider integration)
// ============================================================================

/**
 * Update the internal auth state.
 * This should be called by the ConvexAuthProvider when auth state changes.
 */
export function updateConvexAuthState(user: BackendUser | null, token: string | null): void {
  const wasAuthenticated = authState.isAuthenticated

  authState.user = user
  authState.isAuthenticated = !!user && !!token

  if (user && token) {
    authState.session = {
      accessToken: token,
      user,
      _raw: { token, user },
    }
  } else {
    authState.session = null
  }

  // Notify listeners of state change
  if (authState.isAuthenticated && !wasAuthenticated) {
    notifyListeners("SIGNED_IN", authState.session)
  } else if (!authState.isAuthenticated && wasAuthenticated) {
    notifyListeners("SIGNED_OUT", null)
  } else if (authState.isAuthenticated) {
    notifyListeners("TOKEN_REFRESHED", authState.session)
  }
}

/**
 * Get current Convex auth state (for provider components)
 */
export function getConvexAuthState(): Readonly<ConvexAuthState> {
  return authState
}
