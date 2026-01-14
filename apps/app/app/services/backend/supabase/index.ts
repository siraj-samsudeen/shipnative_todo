/**
 * Supabase Backend Implementation
 *
 * Complete Supabase backend implementation conforming to the Backend interface.
 */

import type { Backend } from "../types"
import { createSupabaseAuthService } from "./auth"
import {
  getSupabaseClient,
  destroySupabaseClient,
  isUsingMockSupabase,
  supabase,
  supabaseUrl,
  supabaseKey,
} from "./client"
import { createSupabaseDatabaseService } from "./database"
import { createSupabaseRealtimeService } from "./realtime"
import { createSupabaseStorageService } from "./storage"

// ============================================================================
// Supabase Backend Factory
// ============================================================================

let backendInstance: Backend | null = null

/**
 * Create or get the Supabase backend instance
 */
export function createSupabaseBackend(): Backend {
  if (backendInstance) {
    return backendInstance
  }

  backendInstance = {
    provider: "supabase",
    isMock: isUsingMockSupabase,

    auth: createSupabaseAuthService(),
    db: createSupabaseDatabaseService(),
    storage: createSupabaseStorageService(),
    realtime: createSupabaseRealtimeService(),

    getRawClient() {
      return getSupabaseClient()
    },

    async initialize() {
      // Supabase client is initialized lazily, nothing to do here
      // The client is created on first access
      getSupabaseClient()
    },

    async destroy() {
      destroySupabaseClient()
      backendInstance = null
    },
  }

  return backendInstance
}

// ============================================================================
// Exports for Direct Access (Advanced Use Cases)
// ============================================================================

export {
  // Client
  supabase,
  getSupabaseClient,
  isUsingMockSupabase,
  supabaseUrl,
  supabaseKey,

  // Services
  createSupabaseAuthService,
  createSupabaseDatabaseService,
  createSupabaseStorageService,
  createSupabaseRealtimeService,
}
