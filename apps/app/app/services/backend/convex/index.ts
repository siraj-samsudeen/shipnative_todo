/**
 * Convex Backend Implementation
 *
 * Complete Convex backend implementation conforming to the Backend interface.
 *
 * IMPORTANT: Convex works fundamentally differently from traditional backends!
 *
 * Key differences:
 * - Data is accessed via reactive queries (useQuery), not REST APIs
 * - Mutations are type-safe functions, not HTTP calls
 * - Authentication is handled via ConvexAuthProvider
 * - No direct database access from client - all through Convex functions
 *
 * For the best developer experience, use Convex's native hooks:
 * - useQuery(api.tableName.list)
 * - useMutation(api.tableName.create)
 * - useAction(api.actionName)
 *
 * This backend implementation provides:
 * 1. Compatibility layer for the unified Backend interface
 * 2. Migration path from Supabase
 *
 * NOTE: Convex does not support mock mode. Use `npx convex dev` for local development.
 */

import type { Backend } from "../types"
import { createConvexAuthService, updateConvexAuthState, getConvexAuthState } from "./auth"
import {
  getConvexClient,
  destroyConvexClient,
  convex,
  convexUrl,
  convexSecureStorage,
} from "./client"
import { createConvexDatabaseService } from "./database"
import { createConvexRealtimeService } from "./realtime"
import { createConvexStorageService } from "./storage"

// ============================================================================
// Convex Backend Factory
// ============================================================================

let backendInstance: Backend | null = null

/**
 * Create or get the Convex backend instance
 */
export function createConvexBackend(): Backend {
  if (backendInstance) {
    return backendInstance
  }

  backendInstance = {
    provider: "convex",
    isMock: false, // Convex does not support mock mode

    auth: createConvexAuthService(),
    db: createConvexDatabaseService(),
    storage: createConvexStorageService(),
    realtime: createConvexRealtimeService(),

    getRawClient() {
      return getConvexClient()
    },

    async initialize() {
      // Initialize client
      getConvexClient()

      // Restore session from secure storage if available
      const token = await convexSecureStorage.getToken()
      if (token) {
        // The session will be validated when the ConvexAuthProvider mounts
        // This just pre-loads the token
      }
    },

    async destroy() {
      // Clear stored credentials
      await convexSecureStorage.clear()

      // Destroy client
      destroyConvexClient()

      backendInstance = null
    },
  }

  return backendInstance
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Client
  convex,
  getConvexClient,
  convexUrl,
  convexSecureStorage,

  // Auth
  createConvexAuthService,
  updateConvexAuthState,
  getConvexAuthState,

  // Database
  createConvexDatabaseService,

  // Storage
  createConvexStorageService,

  // Realtime
  createConvexRealtimeService,
}

// ============================================================================
// Re-exports from Convex (for convenience when using Convex)
// ============================================================================

// These will be available when the user has Convex installed
// They're re-exported here for convenience
export type { ConvexReactClient } from "convex/react"
