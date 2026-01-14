/**
 * Supabase Client
 *
 * Platform-aware Supabase client initialization with secure storage.
 */

import { AppState, Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
import type { SupportedStorage } from "@supabase/auth-js"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import "react-native-url-polyfill/auto"

import { env } from "../../../config/env"
import type { SupabaseDatabase } from "../../../types/supabase"
import { logger } from "../../../utils/Logger"
import { webSecureStorage } from "../../../utils/webStorageEncryption"
import { createMockSupabaseClient } from "../../mocks/supabase"

// ============================================================================
// Secure Storage Configuration
// ============================================================================

const secureStoreOptions: SecureStore.SecureStoreOptions =
  Platform.OS === "ios"
    ? {
        keychainService: "shipnativeapp.supabase",
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    : { keychainService: "shipnativeapp.supabase" }

const SECURESTORE_CHUNK_SIZE = 1800
const getChunkCountKey = (key: string) => `${key}.__chunks`
const getChunkKey = (key: string, index: number) => `${key}.__chunk_${index}`

// ============================================================================
// Storage Adapters
// ============================================================================

const SecureStoreAdapter: SupportedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const chunkCountRaw = await SecureStore.getItemAsync(
        getChunkCountKey(key),
        secureStoreOptions,
      )
      const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : 0
      if (chunkCount > 0) {
        const chunks: string[] = []
        for (let i = 0; i < chunkCount; i += 1) {
          const chunk = await SecureStore.getItemAsync(getChunkKey(key, i), secureStoreOptions)
          if (!chunk) return null
          chunks.push(chunk)
        }
        return chunks.join("")
      }
      return await SecureStore.getItemAsync(key, secureStoreOptions)
    } catch (error) {
      logger.error("SecureStore getItem failed for Supabase auth", { key }, error as Error)
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value.length <= SECURESTORE_CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value, secureStoreOptions)
        await SecureStore.deleteItemAsync(getChunkCountKey(key), secureStoreOptions)
        return
      }

      const chunks = Math.ceil(value.length / SECURESTORE_CHUNK_SIZE)
      for (let i = 0; i < chunks; i += 1) {
        const start = i * SECURESTORE_CHUNK_SIZE
        const chunk = value.slice(start, start + SECURESTORE_CHUNK_SIZE)
        await SecureStore.setItemAsync(getChunkKey(key, i), chunk, secureStoreOptions)
      }
      await SecureStore.setItemAsync(getChunkCountKey(key), String(chunks), secureStoreOptions)
      await SecureStore.deleteItemAsync(key, secureStoreOptions)
    } catch (error) {
      logger.error("SecureStore setItem failed for Supabase auth", { key }, error as Error)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      const chunkCountRaw = await SecureStore.getItemAsync(
        getChunkCountKey(key),
        secureStoreOptions,
      )
      const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : 0
      if (chunkCount > 0) {
        for (let i = 0; i < chunkCount; i += 1) {
          await SecureStore.deleteItemAsync(getChunkKey(key, i), secureStoreOptions)
        }
        await SecureStore.deleteItemAsync(getChunkCountKey(key), secureStoreOptions)
      }
      await SecureStore.deleteItemAsync(key, secureStoreOptions)
    } catch (error) {
      logger.error("SecureStore removeItem failed for Supabase auth", { key }, error as Error)
    }
  },
}

const PlatformStorageAdapter: SupportedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      if (key.includes("auth") || key.includes("token") || key.includes("session")) {
        return webSecureStorage.getItem(key)
      }
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null
    }
    return SecureStoreAdapter.getItem(key)
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (key.includes("auth") || key.includes("token") || key.includes("session")) {
        webSecureStorage.setItem(key, value)
        return
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value)
      }
      return
    }
    await SecureStoreAdapter.setItem(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (key.includes("auth") || key.includes("token") || key.includes("session")) {
        webSecureStorage.removeItem(key)
        return
      }
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key)
      }
      return
    }
    await SecureStoreAdapter.removeItem(key)
  },
}

// ============================================================================
// Client Creation
// ============================================================================

export const supabaseUrl = env.supabaseUrl ?? ""
export const supabaseKey = env.supabasePublishableKey ?? ""

// Use mock Supabase if credentials are missing in development
const useMock = __DEV__ && (!supabaseUrl || !supabaseKey)
export const isUsingMockSupabase = useMock

export type TypedSupabaseClient = SupabaseClient<SupabaseDatabase>

let clientInstance: TypedSupabaseClient | null = null
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (clientInstance) {
    return clientInstance
  }

  if (useMock) {
    if (__DEV__) {
      logger.warn("⚠️  Supabase credentials not found - using mock authentication")
      logger.info(
        "💡 Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to apps/app/.env",
      )
    }
    clientInstance = createMockSupabaseClient() as unknown as TypedSupabaseClient
    return clientInstance
  }

  clientInstance = createClient<SupabaseDatabase>(supabaseUrl, supabaseKey, {
    auth: {
      storage: PlatformStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
      flowType: "pkce",
    },
  })

  // Set up auto-refresh for real client
  appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      clientInstance?.auth.startAutoRefresh?.()
    } else {
      clientInstance?.auth.stopAutoRefresh?.()
    }
  })

  return clientInstance
}

/**
 * Clean up Supabase client resources
 */
export function destroySupabaseClient(): void {
  if (appStateSubscription) {
    appStateSubscription.remove()
    appStateSubscription = null
  }
  clientInstance = null
}

// For backward compatibility - lazy initialization
export const supabase = new Proxy({} as TypedSupabaseClient, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof TypedSupabaseClient]
  },
})
