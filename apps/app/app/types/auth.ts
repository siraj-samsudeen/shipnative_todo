/**
 * Platform-agnostic authentication types
 *
 * These types provide a unified interface for authentication services
 * across different platforms and providers (Supabase, etc.)
 */

export type AuthProvider = "supabase" | "mock"

export interface User {
  id: string
  aud: string
  email?: string
  created_at: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
  [key: string]: any
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: "bearer"
  user: User
}

export interface AuthResponse<T = User> {
  data: {
    user: T | null
    session: Session | null
  }
  error: Error | null
}

export interface SignUpCredentials {
  email: string
  password: string
  options?: {
    data?: Record<string, any>
    emailRedirectTo?: string
  }
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface ResetPasswordOptions {
  redirectTo?: string
}

export interface UpdateUserAttributes {
  email?: string
  password?: string
  data?: Record<string, any>
}

export type AuthChangeEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY"

export interface AuthStateChangeCallback {
  (event: AuthChangeEvent, session: Session | null): void
}

export interface AuthService {
  provider: AuthProvider

  // Sign up
  signUp(credentials: SignUpCredentials): Promise<AuthResponse>

  // Sign in
  signInWithPassword(credentials: SignInCredentials): Promise<AuthResponse>

  // Sign out
  signOut(): Promise<{ error: Error | null }>

  // Session management
  getSession(): Promise<{ data: { session: Session | null }; error: Error | null }>
  getUser(): Promise<{ data: { user: User | null }; error: Error | null }>

  // Password reset
  resetPasswordForEmail(
    email: string,
    options?: ResetPasswordOptions,
  ): Promise<{
    data: any
    error: Error | null
  }>

  // Update user
  updateUser?(attributes: UpdateUserAttributes): Promise<AuthResponse>

  // Auth state changes
  onAuthStateChange(callback: AuthStateChangeCallback): {
    data: { subscription: { unsubscribe: () => void } }
  }
}

/**
 * Helper to check if user is authenticated
 */
export function isAuthenticated(session: Session | null): boolean {
  if (!session) return false

  // Check if session is expired
  if (session.expires_at && session.expires_at < Date.now() / 1000) {
    return false
  }

  return true
}

/**
 * Helper to get user from session
 */
export function getUserFromSession(session: Session | null): User | null {
  return session?.user || null
}
