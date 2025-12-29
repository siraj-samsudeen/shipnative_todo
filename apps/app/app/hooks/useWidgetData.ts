/**
 * useWidgetData Hook
 *
 * React hook for fetching widget data from Supabase.
 * Provides convenient access to widget data with caching and error handling.
 */

import { useCallback, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { widgetKeys } from "./queries"
import { fetchWidgetData, clearWidgetCache, getWidgetConfig } from "../services/widgets"
import { logger } from "../utils/Logger"

export interface UseWidgetDataOptions {
  table: string
  select?: string
  filters?: Record<string, unknown>
  limit?: number
  orderBy?: { column: string; ascending?: boolean }
  requireAuth?: boolean
  cacheKey?: string
  refreshInterval?: number // in milliseconds
  enabled?: boolean
}

export interface UseWidgetDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
  config: {
    supabaseUrl: string
    supabaseKey: string
    isMock: boolean
  }
}

/**
 * Hook for fetching widget data
 *
 * @example
 * ```tsx
 * function WidgetSettingsScreen() {
 *   const { data, loading, error, refetch } = useWidgetData({
 *     table: 'profiles',
 *     select: 'id, first_name, avatar_url',
 *     limit: 1,
 *     requireAuth: true,
 *   })
 *
 *   if (loading) return <Spinner />
 *   if (error) return <Text>Error: {error.message}</Text>
 *
 *   return (
 *     <View>
 *       <Text>Welcome {data?.first_name}</Text>
 *       <Button onPress={refetch} title="Refresh" />
 *     </View>
 *   )
 * }
 * ```
 */
export function useWidgetData<T = any>(options: UseWidgetDataOptions): UseWidgetDataReturn<T> {
  const {
    table,
    select,
    filters,
    limit,
    orderBy,
    requireAuth,
    cacheKey,
    refreshInterval,
    enabled = true,
  } = options

  const queryClient = useQueryClient()
  const queryKey = useMemo(() => {
    if (cacheKey) {
      return widgetKeys.cache(cacheKey)
    }

    return widgetKeys.list({
      table,
      select,
      filters,
      limit,
      orderBy,
      requireAuth,
    })
  }, [cacheKey, table, select, filters, limit, orderBy, requireAuth])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await fetchWidgetData<T>({
          table,
          select,
          filters,
          limit,
          orderBy,
          requireAuth,
          cacheKey,
        })

        if (result.error) {
          throw result.error
        }

        return result.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        logger.error("Widget data fetch error", { error, table })
        throw error
      }
    },
    enabled,
    refetchInterval: enabled && refreshInterval ? refreshInterval : false,
  })

  const handleClearCache = useCallback(() => {
    if (cacheKey) {
      clearWidgetCache(cacheKey)
      queryClient.removeQueries({ queryKey, exact: true })
    } else {
      clearWidgetCache()
      queryClient.removeQueries({ queryKey: widgetKeys.all })
    }
    // Refetch after clearing cache
    if (enabled) {
      void query.refetch()
    }
  }, [cacheKey, enabled, query, queryClient, queryKey])

  return {
    data: query.data ?? null,
    loading: query.isFetching,
    error: query.error instanceof Error ? query.error : null,
    refetch: async () => {
      await query.refetch()
    },
    clearCache: handleClearCache,
    config: getWidgetConfig(),
  }
}
