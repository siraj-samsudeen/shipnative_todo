/**
 * Supabase Error Types
 *
 * Proper type definitions for Supabase errors to avoid `as any` assertions
 */

/**
 * Supabase error interface
 */
export interface SupabaseError {
  message: string
  status?: number
  code?: string
  name?: string
  details?: string
  hint?: string
}

/**
 * Type guard to check if an error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  )
}

/**
 * Extract error details from an unknown error
 */
export function extractSupabaseError(error: unknown): SupabaseError | null {
  if (isSupabaseError(error)) {
    return error
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    }
  }

  return null
}

/**
 * Network error patterns to detect connection issues
 */
const NETWORK_ERROR_PATTERNS = [
  "network request failed",
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "net::err_",
  "econnrefused",
  "enotfound",
  "etimedout",
  "econnreset",
  "socket hang up",
  "could not resolve host",
  "no internet",
  "offline",
  "dns lookup failed",
] as const

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const lowerMessage = message.toLowerCase()

  return NETWORK_ERROR_PATTERNS.some((pattern) => lowerMessage.includes(pattern))
}

/**
 * Get a user-friendly error message for network errors
 * Returns null if not a network error
 */
export function getNetworkErrorMessage(error: unknown, context?: string): string | null {
  if (!isNetworkError(error)) {
    return null
  }

  const message = error instanceof Error ? error.message : String(error)
  const lowerMessage = message.toLowerCase()

  // DNS resolution failure - likely invalid URL or paused project
  if (
    lowerMessage.includes("could not resolve host") ||
    lowerMessage.includes("enotfound") ||
    lowerMessage.includes("dns lookup failed")
  ) {
    return `Cannot reach the server. The backend service may be paused or the URL is incorrect.${context ? ` (${context})` : ""}`
  }

  // Connection refused - server not running
  if (lowerMessage.includes("econnrefused")) {
    return `Server connection refused. The backend service may not be running.${context ? ` (${context})` : ""}`
  }

  // Timeout
  if (lowerMessage.includes("etimedout") || lowerMessage.includes("timeout")) {
    return `Connection timed out. Please check your internet connection and try again.${context ? ` (${context})` : ""}`
  }

  // Generic network error
  return `Network error. Please check your internet connection.${context ? ` (${context})` : ""}`
}

/**
 * Wrap an error with better network error messaging
 * Returns original error if not a network error
 */
export function enhanceNetworkError(error: unknown, context?: string): Error {
  const friendlyMessage = getNetworkErrorMessage(error, context)

  if (friendlyMessage) {
    const enhancedError = new Error(friendlyMessage)
    enhancedError.cause = error
    return enhancedError
  }

  return error instanceof Error ? error : new Error(String(error))
}
