/**
 * Supabase Auth Service
 *
 * Implements the AuthService interface for Supabase.
 */

import type {
  User as SupabaseUser,
  Session as SupabaseSession,
  AuthChangeEvent as SupabaseAuthChangeEvent,
} from "@supabase/supabase-js"

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
import { getSupabaseClient, isUsingMockSupabase } from "./client"

// ============================================================================
// Type Converters
// ============================================================================

function convertUser(user: SupabaseUser | null): BackendUser | null {
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at,
    phone: user.phone,
    phoneConfirmedAt: user.phone_confirmed_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastSignInAt: user.last_sign_in_at,
    appMetadata: user.app_metadata,
    userMetadata: user.user_metadata,
    _raw: user,
  }
}

function convertSession(session: SupabaseSession | null): BackendSession | null {
  if (!session) return null

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    expiresIn: session.expires_in,
    tokenType: session.token_type,
    user: convertUser(session.user)!,
    _raw: session,
  }
}

function convertAuthEvent(event: SupabaseAuthChangeEvent): AuthChangeEvent {
  const eventMap: Partial<Record<SupabaseAuthChangeEvent, AuthChangeEvent>> &
    Record<string, AuthChangeEvent> = {
    SIGNED_IN: "SIGNED_IN",
    SIGNED_OUT: "SIGNED_OUT",
    TOKEN_REFRESHED: "TOKEN_REFRESHED",
    USER_UPDATED: "USER_UPDATED",
    PASSWORD_RECOVERY: "PASSWORD_RECOVERY",
    INITIAL_SESSION: "INITIAL_SESSION",
    MFA_CHALLENGE_VERIFIED: "SIGNED_IN",
    USER_DELETED: "SIGNED_OUT",
  }
  return eventMap[event] ?? "SIGNED_IN"
}

// ============================================================================
// Supabase Auth Service Implementation
// ============================================================================

export function createSupabaseAuthService(): AuthService {
  const getClient = () => getSupabaseClient()

  return {
    // Session Management
    async getSession(): Promise<AuthResult<BackendSession>> {
      const { data, error } = await getClient().auth.getSession()
      return {
        data: convertSession(data.session),
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async setSession(session: {
      accessToken: string
      refreshToken: string
    }): Promise<AuthResult<BackendSession>> {
      const { data, error } = await getClient().auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
      })
      return {
        data: convertSession(data.session),
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async refreshSession(): Promise<AuthResult<BackendSession>> {
      const { data, error } = await getClient().auth.refreshSession()
      return {
        data: convertSession(data.session),
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // Email/Password Auth
    async signUp(
      credentials: SignUpCredentials,
    ): Promise<AuthResult<{ user: BackendUser; session: BackendSession | null }>> {
      const { data, error } = await getClient().auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: credentials.options,
      })
      return {
        data: data.user
          ? {
              user: convertUser(data.user)!,
              session: convertSession(data.session),
            }
          : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async signInWithPassword(
      credentials: SignInCredentials,
    ): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      const { data, error } = await getClient().auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      return {
        data:
          data.user && data.session
            ? {
                user: convertUser(data.user)!,
                session: convertSession(data.session)!,
              }
            : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async signOut(options?: { scope?: "local" | "global" }): Promise<AuthResult<void>> {
      const { error } = await getClient().auth.signOut({ scope: options?.scope ?? "local" })
      return {
        data: null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // OAuth
    async signInWithOAuth(options: {
      provider: OAuthProvider
      redirectTo?: string
      skipBrowserRedirect?: boolean
    }): Promise<AuthResult<{ url?: string }>> {
      const { data, error } = await getClient().auth.signInWithOAuth({
        provider: options.provider,
        options: {
          redirectTo: options.redirectTo,
          skipBrowserRedirect: options.skipBrowserRedirect,
        },
      })
      return {
        data: data ? { url: data.url ?? undefined } : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async signInWithIdToken(options: {
      provider: OAuthProvider
      token: string
      accessToken?: string
    }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      const { data, error } = await getClient().auth.signInWithIdToken({
        provider: options.provider,
        token: options.token,
        access_token: options.accessToken,
      })
      return {
        data:
          data.user && data.session
            ? {
                user: convertUser(data.user)!,
                session: convertSession(data.session)!,
              }
            : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async exchangeCodeForSession(code: string): Promise<AuthResult<{ session: BackendSession }>> {
      const { data, error } = await getClient().auth.exchangeCodeForSession(code)
      return {
        data: data.session ? { session: convertSession(data.session)! } : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // Magic Link / OTP
    async signInWithOtp(options: {
      email: string
      options?: { emailRedirectTo?: string; captchaToken?: string }
    }): Promise<AuthResult<void>> {
      const { error } = await getClient().auth.signInWithOtp({
        email: options.email,
        options: {
          emailRedirectTo: options.options?.emailRedirectTo,
          captchaToken: options.options?.captchaToken,
        },
      })
      return {
        data: null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async verifyOtp(options: {
      email: string
      token: string
      type: "email" | "sms" | "phone_change" | "email_change"
    }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>> {
      // Map type to Supabase's expected OTP type
      const otpType = options.type === "sms" ? "sms" : options.type
      const { data, error } = await getClient().auth.verifyOtp({
        email: options.email,
        token: options.token,
        type: otpType as "email" | "magiclink" | "signup" | "invite" | "recovery" | "email_change",
      })
      return {
        data:
          data.user && data.session
            ? {
                user: convertUser(data.user)!,
                session: convertSession(data.session)!,
              }
            : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // Password Management
    async resetPasswordForEmail(
      email: string,
      options?: { redirectTo?: string },
    ): Promise<AuthResult<void>> {
      const { error } = await getClient().auth.resetPasswordForEmail(email, {
        redirectTo: options?.redirectTo,
      })
      return {
        data: null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    async updateUser(attributes: UpdateUserAttributes): Promise<AuthResult<{ user: BackendUser }>> {
      const { data, error } = await getClient().auth.updateUser({
        email: attributes.email,
        password: attributes.password,
        data: attributes.data,
      })
      return {
        data: data.user ? { user: convertUser(data.user)! } : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // User Info
    async getUser(): Promise<AuthResult<{ user: BackendUser }>> {
      const { data, error } = await getClient().auth.getUser()
      return {
        data: data.user ? { user: convertUser(data.user)! } : null,
        error: error ? { ...error, name: "AuthError" } : null,
      }
    },

    // Listeners
    onAuthStateChange(callback: (event: AuthChangeEvent, session: BackendSession | null) => void): {
      unsubscribe: () => void
    } {
      const {
        data: { subscription },
      } = getClient().auth.onAuthStateChange((event, session) => {
        callback(convertAuthEvent(event), convertSession(session))
      })
      return {
        unsubscribe: () => subscription.unsubscribe(),
      }
    },

    // Auto-refresh
    startAutoRefresh(): void {
      if (!isUsingMockSupabase) {
        getClient().auth.startAutoRefresh?.()
      }
    },

    stopAutoRefresh(): void {
      if (!isUsingMockSupabase) {
        getClient().auth.stopAutoRefresh?.()
      }
    },
  }
}
