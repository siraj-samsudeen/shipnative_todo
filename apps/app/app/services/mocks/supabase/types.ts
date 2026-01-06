/**
 * Mock Supabase Types
 *
 * Type definitions for the mock Supabase implementation
 */

import type { User, Session, AuthStateChangeCallback } from "../../../types/auth"
import type { DatabaseResponse } from "../../../types/database"

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

/**
 * Generic database record type for mock database operations
 */
export type DatabaseRecord = Record<string, unknown>

/**
 * Filter value type for query operations
 */
export type FilterValue = string | number | boolean | null | string[] | number[]

/**
 * Database filter definition
 */
export interface DatabaseFilter {
  column: string
  operator: string
  value: FilterValue
}

export type RealtimeCallback = (payload: {
  eventType: RealtimeEvent
  new: DatabaseRecord | null
  old: DatabaseRecord | null
  schema: string
  table: string
}) => void

export interface RealtimeSubscription {
  table: string
  event: RealtimeEvent
  callback: RealtimeCallback
  filter?: string
}

export interface StorageFile {
  id: string
  name: string
  bucket: string
  path: string
  size: number
  mimeType: string
  data: string // Base64 encoded data
  created_at: string
  updated_at: string
}

export interface MockUserData {
  email: string
  password: string
  user: User
}

export interface PendingOAuthState {
  provider: string
  state: string
  redirectTo?: string
  onComplete?: (session: Session | null, error: Error | null) => void
}

export interface SimulatedErrors {
  auth?: { signIn?: Error; signUp?: Error; signOut?: Error }
  database?: {
    [table: string]: { select?: Error; insert?: Error; update?: Error; delete?: Error }
  }
}

/**
 * RPC handler function type
 */
export type RpcHandler = (params?: Record<string, unknown>) => Promise<DatabaseResponse>

// Shared state object - using object properties allows mutation across modules
export const sharedState = {
  mockUsers: new Map<string, MockUserData>(),
  mockDatabase: new Map<string, Map<string, DatabaseRecord>>(),
  currentSession: null as Session | null,
  authStateListeners: [] as AuthStateChangeCallback[],
  isInitialized: false,
  realtimeSubscriptions: new Map<string, RealtimeSubscription[]>(),
  mockRpcHandlers: new Map<string, RpcHandler>(),
  mockFileStorage: new Map<string, StorageFile>(),
  mockBuckets: new Set<string>(["avatars", "uploads", "public"]),
  simulatedErrors: {} as SimulatedErrors,
  pendingOAuthState: null as PendingOAuthState | null,
}
