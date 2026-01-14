/**
 * Backend Provider Types
 *
 * Shared interfaces for backend providers (Supabase, Convex).
 * These types enable seamless switching between providers while maintaining
 * type safety and a consistent API surface.
 */

// ============================================================================
// Provider Configuration
// ============================================================================

export type BackendProvider = "supabase" | "convex"

export interface BackendConfig {
  provider: BackendProvider
  /** Whether using mock implementation (dev mode without credentials) */
  isMock: boolean
}

// ============================================================================
// User & Session Types (Provider-Agnostic)
// ============================================================================

export interface BackendUser {
  id: string
  email?: string
  emailConfirmedAt?: string | null
  phone?: string
  phoneConfirmedAt?: string | null
  createdAt: string
  updatedAt?: string
  lastSignInAt?: string
  appMetadata?: Record<string, unknown>
  userMetadata?: Record<string, unknown>
  /** Original provider-specific user object */
  _raw?: unknown
}

export interface BackendSession {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  expiresIn?: number
  tokenType?: string
  user: BackendUser
  /** Original provider-specific session object */
  _raw?: unknown
}

// ============================================================================
// Auth Types
// ============================================================================

export interface SignUpCredentials {
  email: string
  password: string
  options?: {
    data?: Record<string, unknown>
    emailRedirectTo?: string
  }
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface UpdateUserAttributes {
  email?: string
  password?: string
  data?: Record<string, unknown>
}

export type OAuthProvider = "google" | "apple" | "github"

export interface AuthResult<T = unknown> {
  data: T | null
  error: AuthError | null
}

export interface AuthError extends Error {
  code?: string
  status?: number
}

// ============================================================================
// Auth Service Interface
// ============================================================================

export interface AuthService {
  // Session Management
  getSession(): Promise<AuthResult<BackendSession>>
  setSession(session: {
    accessToken: string
    refreshToken: string
  }): Promise<AuthResult<BackendSession>>
  refreshSession(): Promise<AuthResult<BackendSession>>

  // Email/Password Auth
  signUp(
    credentials: SignUpCredentials,
  ): Promise<AuthResult<{ user: BackendUser; session: BackendSession | null }>>
  signInWithPassword(
    credentials: SignInCredentials,
  ): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>>
  signOut(options?: { scope?: "local" | "global" }): Promise<AuthResult<void>>

  // OAuth
  signInWithOAuth(options: {
    provider: OAuthProvider
    redirectTo?: string
    skipBrowserRedirect?: boolean
  }): Promise<AuthResult<{ url?: string }>>
  signInWithIdToken(options: {
    provider: OAuthProvider
    token: string
    accessToken?: string
  }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>>
  exchangeCodeForSession(code: string): Promise<AuthResult<{ session: BackendSession }>>

  // Magic Link / OTP
  signInWithOtp(options: {
    email: string
    options?: { emailRedirectTo?: string; captchaToken?: string }
  }): Promise<AuthResult<void>>
  verifyOtp(options: {
    email: string
    token: string
    type: "email" | "sms" | "phone_change" | "email_change"
  }): Promise<AuthResult<{ user: BackendUser; session: BackendSession }>>

  // Password Management
  resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<AuthResult<void>>
  updateUser(attributes: UpdateUserAttributes): Promise<AuthResult<{ user: BackendUser }>>

  // User Info
  getUser(): Promise<AuthResult<{ user: BackendUser }>>

  // Listeners
  onAuthStateChange(callback: (event: AuthChangeEvent, session: BackendSession | null) => void): {
    unsubscribe: () => void
  }

  // Auto-refresh (optional, may not be supported by all providers)
  startAutoRefresh?(): void
  stopAutoRefresh?(): void
}

export type AuthChangeEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY"
  | "INITIAL_SESSION"

// ============================================================================
// Database Types
// ============================================================================

export interface QueryFilter {
  column: string
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "contains"
  value: unknown
}

export interface QueryOptions {
  filters?: QueryFilter[]
  orderBy?: { column: string; ascending?: boolean }[]
  limit?: number
  offset?: number
  select?: string
}

export interface DatabaseResult<T = unknown> {
  data: T | null
  error: DatabaseError | null
  count?: number | null
}

export interface DatabaseError extends Error {
  code?: string
  details?: string
  hint?: string
}

// ============================================================================
// Database Service Interface
// ============================================================================

export interface DatabaseService {
  /**
   * Query data from a table/collection
   */
  query<T = unknown>(table: string, options?: QueryOptions): Promise<DatabaseResult<T[]>>

  /**
   * Get a single record by ID
   */
  get<T = unknown>(
    table: string,
    id: string,
    options?: { select?: string },
  ): Promise<DatabaseResult<T>>

  /**
   * Insert one or more records
   */
  insert<T = unknown>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options?: { returning?: boolean },
  ): Promise<DatabaseResult<T>>

  /**
   * Update records matching filters
   */
  update<T = unknown>(
    table: string,
    data: Partial<T>,
    filters: QueryFilter[],
  ): Promise<DatabaseResult<T>>

  /**
   * Delete records matching filters
   */
  delete<T = unknown>(table: string, filters: QueryFilter[]): Promise<DatabaseResult<T>>

  /**
   * Upsert (insert or update) records
   */
  upsert<T = unknown>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options?: { onConflict?: string; returning?: boolean },
  ): Promise<DatabaseResult<T>>

  /**
   * Execute a stored procedure / server function
   */
  rpc<T = unknown>(
    functionName: string,
    params?: Record<string, unknown>,
  ): Promise<DatabaseResult<T>>
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageUploadOptions {
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

export interface StorageResult<T = unknown> {
  data: T | null
  error: StorageError | null
}

export interface StorageError extends Error {
  code?: string
  statusCode?: number
}

export interface StorageFileInfo {
  id: string
  name: string
  size: number
  contentType?: string
  createdAt?: string
  updatedAt?: string
  /** Public URL if available */
  url?: string
}

// ============================================================================
// Storage Service Interface
// ============================================================================

export interface StorageService {
  /**
   * Upload a file
   */
  upload(
    bucket: string,
    path: string,
    file: Blob | ArrayBuffer | File,
    options?: StorageUploadOptions,
  ): Promise<StorageResult<{ path: string; id?: string }>>

  /**
   * Download a file
   */
  download(bucket: string, path: string): Promise<StorageResult<Blob>>

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string

  /**
   * Create a signed URL for temporary access
   */
  createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number,
  ): Promise<StorageResult<{ signedUrl: string }>>

  /**
   * Delete a file
   */
  remove(bucket: string, paths: string[]): Promise<StorageResult<void>>

  /**
   * List files in a bucket/path
   */
  list(
    bucket: string,
    path?: string,
    options?: { limit?: number; offset?: number },
  ): Promise<StorageResult<StorageFileInfo[]>>
}

// ============================================================================
// Realtime Types
// ============================================================================

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE" | "*"

export interface RealtimePayload<T = unknown> {
  eventType: RealtimeEventType
  new: T | null
  old: T | null
  table: string
}

export interface RealtimeChannel {
  /** Subscribe to changes */
  subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void): this
  /** Unsubscribe from the channel */
  unsubscribe(): Promise<void>
}

// ============================================================================
// Realtime Service Interface
// ============================================================================

export interface RealtimeService {
  /**
   * Subscribe to database changes on a table
   */
  subscribeToTable<T = unknown>(
    table: string,
    callback: (payload: RealtimePayload<T>) => void,
    options?: {
      event?: RealtimeEventType
      filter?: string
      schema?: string
    },
  ): RealtimeChannel

  /**
   * Create a presence channel for user presence tracking
   */
  createPresenceChannel(channelName: string): PresenceChannel

  /**
   * Create a broadcast channel for pub/sub messaging
   */
  createBroadcastChannel(channelName: string): BroadcastChannel
}

export interface PresenceChannel extends RealtimeChannel {
  /** Track current user's presence */
  track(state: Record<string, unknown>): Promise<void>
  /** Untrack current user */
  untrack(): Promise<void>
  /** Get current presence state */
  presenceState(): Record<string, unknown[]>
  /** Listen for presence sync events */
  onSync(callback: () => void): this
  /** Listen for user join events */
  onJoin(
    callback: (key: string, currentPresences: unknown[], newPresences: unknown[]) => void,
  ): this
  /** Listen for user leave events */
  onLeave(
    callback: (key: string, currentPresences: unknown[], leftPresences: unknown[]) => void,
  ): this
}

export interface BroadcastChannel extends RealtimeChannel {
  /** Send a message to all subscribers */
  send(event: string, payload: Record<string, unknown>): Promise<void>
  /** Listen for broadcast messages */
  onBroadcast(event: string, callback: (payload: Record<string, unknown>) => void): this
}

// ============================================================================
// Combined Backend Interface
// ============================================================================

export interface Backend {
  /** Provider identifier */
  provider: BackendProvider

  /** Whether using mock implementation */
  isMock: boolean

  /** Authentication service */
  auth: AuthService

  /** Database service */
  db: DatabaseService

  /** Storage service */
  storage: StorageService

  /** Realtime service */
  realtime: RealtimeService

  /**
   * Get the raw provider client (for advanced use cases)
   * Type depends on provider: SupabaseClient | ConvexReactClient
   */
  getRawClient(): unknown

  /**
   * Initialize the backend (called once at app startup)
   */
  initialize(): Promise<void>

  /**
   * Cleanup resources (called on app unmount)
   */
  destroy(): Promise<void>
}

// ============================================================================
// React Hook Types
// ============================================================================

export interface UseBackendReturn {
  backend: Backend
  isReady: boolean
  error: Error | null
}

export interface UseAuthReturn {
  user: BackendUser | null
  session: BackendSession | null
  loading: boolean
  isAuthenticated: boolean

  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null }>
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithApple: () => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string, captchaToken?: string) => Promise<{ error: Error | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateUser: (attributes: UpdateUserAttributes) => Promise<{ error: Error | null }>
}
