/**
 * Widget Service - Convex Version
 *
 * Service for fetching and managing data for native widgets using Convex.
 * Handles data fetching with caching and error handling.
 *
 * KEY DIFFERENCE FROM SUPABASE:
 * - Uses Convex HTTP endpoints for native widget access
 * - Uses Convex queries for in-app widget data
 * - Auth token is the Convex auth token
 */

import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

import { convexUrl } from "./backend/convex/client"
import { logger } from "../utils/Logger"
import { webSecureStorage } from "../utils/webStorageEncryption"

/**
 * Widget data cache interface
 */
interface WidgetCache<T> {
  data: T | null
  timestamp: number
  expiresAt: number
}

/**
 * Widget service configuration
 */
const WIDGET_CONFIG = {
  // Cache duration in milliseconds (15 minutes)
  cacheDuration: 15 * 60 * 1000,
  // Maximum cache size (10 items)
  maxCacheSize: 10,
  // Rate limit: minimum time between updates (5 minutes)
  rateLimitMs: 5 * 60 * 1000,
}

/**
 * In-memory cache for widget data
 */
const widgetCache = new Map<string, WidgetCache<unknown>>()

/**
 * Last update timestamps for rate limiting
 */
const lastUpdateTimestamps = new Map<string, number>()

// Check if we're in mock mode (no Convex URL configured)
const isUsingMockConvex = !convexUrl

/**
 * Get Convex auth token for widget authentication
 */
async function getWidgetAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return webSecureStorage.getItem("convex-auth-token")
    }
    return await SecureStore.getItemAsync("convex-auth-token")
  } catch (error) {
    logger.error("Failed to get widget auth token", { error })
    return null
  }
}

/**
 * Check if enough time has passed since last update (rate limiting)
 */
function canUpdate(key: string): boolean {
  const lastUpdate = lastUpdateTimestamps.get(key)
  if (!lastUpdate) return true

  const timeSinceLastUpdate = Date.now() - lastUpdate
  return timeSinceLastUpdate >= WIDGET_CONFIG.rateLimitMs
}

/**
 * Get cached data if valid
 */
function getCachedData<T>(key: string): T | null {
  const cached = widgetCache.get(key)
  if (!cached) return null

  if (Date.now() > cached.expiresAt) {
    widgetCache.delete(key)
    return null
  }

  return cached.data as T
}

/**
 * Set cached data
 */
function setCachedData<T>(key: string, data: T): void {
  // Enforce max cache size
  if (widgetCache.size >= WIDGET_CONFIG.maxCacheSize) {
    // Remove oldest entry
    const oldestKey = Array.from(widgetCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    )[0]?.[0]
    if (oldestKey) {
      widgetCache.delete(oldestKey)
    }
  }

  widgetCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + WIDGET_CONFIG.cacheDuration,
  })
}

/**
 * Fetch data from Convex for widgets
 * Uses HTTP endpoint for compatibility with native widgets
 */
export async function fetchWidgetData<T = unknown>(options: {
  table: string
  select?: string
  filters?: Record<string, unknown>
  limit?: number
  orderBy?: { column: string; ascending?: boolean }
  requireAuth?: boolean
  cacheKey?: string
}): Promise<{ data: T | null; error: Error | null }> {
  const {
    table,
    limit = 10,
    cacheKey,
  } = options

  // Generate cache key if not provided
  const key = cacheKey || `widget_${table}_${JSON.stringify(options.filters ?? {})}_${limit}`

  // Check cache first
  const cached = getCachedData<T>(key)
  if (cached !== null) {
    return { data: cached, error: null }
  }

  // Rate limiting
  if (!canUpdate(key)) {
    logger.warn("Widget data update rate limited", { key })
    return { data: cached, error: null }
  }

  try {
    // In mock mode, return mock data
    if (isUsingMockConvex) {
      const mockData = generateMockData<T>(table, limit)
      setCachedData(key, mockData)
      lastUpdateTimestamps.set(key, Date.now())
      return { data: mockData, error: null }
    }

    // Get auth token
    const token = await getWidgetAuthToken()
    if (!token) {
      return { data: null, error: new Error("Not authenticated") }
    }

    // Fetch from Convex HTTP endpoint
    const url = new URL(`${convexUrl}/api/widgets/data`)
    url.searchParams.set("table", table)
    url.searchParams.set("limit", limit.toString())

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: new Error(errorData.error || `HTTP ${response.status}`),
      }
    }

    const result = await response.json()

    if (result.error) {
      return { data: null, error: new Error(result.error) }
    }

    // Cache the result
    if (result.data) {
      setCachedData(key, result.data)
      lastUpdateTimestamps.set(key, Date.now())
    }

    return { data: result.data as T, error: null }
  } catch (error) {
    logger.error("Widget data fetch exception", { error, table })
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    }
  }
}

/**
 * Generate mock data for development
 */
function generateMockData<T>(table: string, limit: number): T {
  const mockItems = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    id: `mock_${i + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  return (limit === 1 ? mockItems[0] : mockItems) as T
}

/**
 * Clear widget cache
 */
export function clearWidgetCache(key?: string): void {
  if (key) {
    widgetCache.delete(key)
    lastUpdateTimestamps.delete(key)
  } else {
    widgetCache.clear()
    lastUpdateTimestamps.clear()
  }
}

/**
 * Get widget configuration for native widgets
 * Provides Convex URL and token storage location for widget authentication
 *
 * IMPORTANT: Native widgets should:
 * 1. Read the auth token from the shared storage location
 * 2. Make HTTP requests to the Convex widget endpoints
 */
export function getWidgetConfig(): {
  convexUrl: string
  backendType: "convex"
  isMock: boolean
  // Legacy fields for compatibility
  supabaseUrl: string
  supabaseKey: string
} {
  return {
    convexUrl: convexUrl || "",
    backendType: "convex",
    isMock: isUsingMockConvex,
    // Legacy fields - empty for Convex
    supabaseUrl: "",
    supabaseKey: "",
  }
}

/**
 * Validate widget data before displaying
 */
export function validateWidgetData<T>(data: T | null, validator?: (data: T) => boolean): boolean {
  if (data === null || data === undefined) return false
  if (validator) {
    return validator(data)
  }
  return true
}
