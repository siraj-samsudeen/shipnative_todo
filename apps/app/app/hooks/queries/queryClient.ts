/**
 * React Query Client Configuration
 *
 * Configured React Query client with sensible defaults for the app
 */

import { QueryClient } from "@tanstack/react-query"

import { networkMonitor } from "../../services/NetworkMonitor"
import { errorHandler } from "../../utils/ErrorHandler"

/**
 * Default retry logic based on error type
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Don't retry more than 3 times
  if (failureCount >= 3) {
    return false
  }

  // Check if error is retryable
  if (error instanceof Error) {
    const appError = errorHandler.handle(error)
    return appError.retryable
  }

  // Default: retry network errors
  return true
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}

/**
 * Create and configure React Query client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Cache time - how long unused data stays in cache
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry configuration
        retry: shouldRetry,
        retryDelay: getRetryDelay,

        // Refetch configuration
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,

        // Network mode - fail when offline
        networkMode: "online",

        // Error handling
        throwOnError: false,

        // Logging
        meta: {
          errorHandler: (error: unknown) => {
            if (error instanceof Error) {
              errorHandler.handle(error, {
                context: "react_query",
              })
            }
          },
        },
      },
      mutations: {
        // Retry mutations only once
        retry: 1,
        retryDelay: getRetryDelay,

        // Network mode
        networkMode: "online",

        // Error handling
        throwOnError: false,

        // Logging
        meta: {
          errorHandler: (error: unknown) => {
            if (error instanceof Error) {
              errorHandler.handle(error, {
                context: "react_query_mutation",
              })
            }
          },
        },
      },
    },
  })
}

/**
 * Query client instance
 */
export const queryClient = createQueryClient()

/**
 * Pause queries when offline
 */
networkMonitor.addListener((state) => {
  if (!state.isConnected) {
    queryClient.cancelQueries()
  }
})
