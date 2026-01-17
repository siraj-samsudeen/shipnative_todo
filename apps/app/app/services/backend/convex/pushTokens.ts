/**
 * Convex Push Token Service
 *
 * Service for syncing push tokens with Convex backend.
 * Uses the Convex client directly for fire-and-forget operations.
 */

import { Platform } from "react-native"
import * as Device from "expo-device"
import { api } from "@convex/_generated/api"

import { getConvexClient, convexUrl } from "./client"
import { logger } from "../../../utils/Logger"

/**
 * Get a unique device identifier
 */
function getDeviceId(): string {
  const parts = [Platform.OS, Device.modelName ?? "unknown", Device.osVersion ?? "unknown"]
  return parts.join("-").toLowerCase().replace(/\s+/g, "-")
}

/**
 * Get the platform type
 */
function getPlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios"
  if (Platform.OS === "android") return "android"
  return "web"
}

/**
 * Register a push token with Convex
 *
 * @param token - The Expo push token
 */
export async function syncPushToken(token: string): Promise<void> {
  if (!token) {
    logger.debug("[Convex] No push token to sync")
    return
  }

  if (!convexUrl) {
    logger.debug("[Convex] Convex URL not configured, skipping push token sync")
    return
  }

  try {
    const client = getConvexClient()
    await client.mutation(api.pushTokens.register, {
      token,
      platform: getPlatform(),
      deviceId: getDeviceId(),
    })
    logger.debug("[Convex] Push token synced", { platform: getPlatform() })
  } catch (error) {
    logger.debug("[Convex] Failed to sync push token", { error })
  }
}

/**
 * Deactivate a specific push token
 *
 * @param token - The Expo push token to deactivate
 */
export async function deactivatePushToken(token: string): Promise<void> {
  if (!token) {
    return
  }

  if (!convexUrl) {
    return
  }

  try {
    const client = getConvexClient()
    await client.mutation(api.pushTokens.deactivate, { token })
    logger.debug("[Convex] Push token deactivated")
  } catch (error) {
    logger.debug("[Convex] Failed to deactivate push token", { error })
  }
}

/**
 * Deactivate all push tokens for the current user
 */
export async function deactivateAllPushTokens(): Promise<void> {
  if (!convexUrl) {
    return
  }

  try {
    const client = getConvexClient()
    await client.mutation(api.pushTokens.deactivateAll, {})
    logger.debug("[Convex] All push tokens deactivated")
  } catch (error) {
    logger.debug("[Convex] Failed to deactivate all push tokens", { error })
  }
}
