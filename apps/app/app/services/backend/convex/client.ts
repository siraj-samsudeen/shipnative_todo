/**
 * Convex Client
 *
 * Platform-aware Convex client initialization for React Native.
 */

import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
import { ConvexReactClient } from "convex/react"

import { env } from "../../../config/env"
import { logger } from "../../../utils/Logger"
import { webSecureStorage } from "../../../utils/webStorageEncryption"

// ============================================================================
// Configuration
// ============================================================================

export const convexUrl = env.convexUrl ?? ""

// Convex does not support mock mode - use `npx convex dev` for local development
export const isUsingMockConvex = false

// ============================================================================
// Secure Storage for Convex Auth Tokens
// ============================================================================

const secureStoreOptions: SecureStore.SecureStoreOptions =
  Platform.OS === "ios"
    ? {
        keychainService: "shipnativeapp.convex",
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    : { keychainService: "shipnativeapp.convex" }

/**
 * Platform-aware secure storage for Convex auth tokens
 */
export const convexSecureStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return webSecureStorage.getItem("convex-auth-token")
      }
      return await SecureStore.getItemAsync("convex-auth-token", secureStoreOptions)
    } catch (error) {
      logger.error("Failed to get Convex auth token", {}, error as Error)
      return null
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.setItem("convex-auth-token", token)
        return
      }
      await SecureStore.setItemAsync("convex-auth-token", token, secureStoreOptions)
    } catch (error) {
      logger.error("Failed to set Convex auth token", {}, error as Error)
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.removeItem("convex-auth-token")
        return
      }
      await SecureStore.deleteItemAsync("convex-auth-token", secureStoreOptions)
    } catch (error) {
      logger.error("Failed to remove Convex auth token", {}, error as Error)
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return webSecureStorage.getItem("convex-refresh-token")
      }
      return await SecureStore.getItemAsync("convex-refresh-token", secureStoreOptions)
    } catch (error) {
      logger.error("Failed to get Convex refresh token", {}, error as Error)
      return null
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.setItem("convex-refresh-token", token)
        return
      }
      await SecureStore.setItemAsync("convex-refresh-token", token, secureStoreOptions)
    } catch (error) {
      logger.error("Failed to set Convex refresh token", {}, error as Error)
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.removeItem("convex-refresh-token")
        return
      }
      await SecureStore.deleteItemAsync("convex-refresh-token", secureStoreOptions)
    } catch (error) {
      logger.error("Failed to remove Convex refresh token", {}, error as Error)
    }
  },

  async clear(): Promise<void> {
    await this.removeToken()
    await this.removeRefreshToken()
  },
}

// ============================================================================
// Client Creation
// ============================================================================

let clientInstance: ConvexReactClient | null = null

/**
 * Get or create the Convex client instance
 *
 * @throws Error if EXPO_PUBLIC_CONVEX_URL is not configured
 */
export function getConvexClient(): ConvexReactClient {
  if (clientInstance) {
    return clientInstance
  }

  if (!convexUrl) {
    const errorMessage = [
      "EXPO_PUBLIC_CONVEX_URL is not configured.",
      "",
      "To use Convex backend:",
      "1. Run: npx convex dev",
      "2. Add to apps/app/.env: EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210",
      "",
      "Or switch to Supabase: EXPO_PUBLIC_BACKEND_PROVIDER=supabase",
    ].join("\n")

    logger.error(errorMessage)
    throw new Error(errorMessage)
  }

  clientInstance = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false, // Disable for React Native
  })

  return clientInstance
}

/**
 * Clean up Convex client resources
 */
export function destroyConvexClient(): void {
  if (clientInstance) {
    clientInstance.close()
    clientInstance = null
  }
}

// For backward compatibility - lazy initialization
export const convex = new Proxy({} as ConvexReactClient, {
  get(_, prop) {
    const client = getConvexClient()
    const value = client[prop as keyof ConvexReactClient]
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})
