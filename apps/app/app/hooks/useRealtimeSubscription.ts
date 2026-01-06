import { useState, useEffect, useCallback, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"

import { supabase, isUsingMockSupabase } from "../services/supabase"
import type {
  RealtimeEventType,
  RealtimePayload,
  RealtimeSubscriptionConfig,
} from "../types/realtime"
import { logger } from "../utils/Logger"

export interface UseRealtimeSubscriptionOptions<T> extends RealtimeSubscriptionConfig {
  /** Called when data changes (INSERT, UPDATE, DELETE) */
  onInsert?: (record: T) => void
  onUpdate?: (record: T, oldRecord: T | null) => void
  onDelete?: (oldRecord: T) => void
  /** Called for any change event */
  onChange?: (payload: RealtimePayload<T>) => void
  /** Whether to auto-connect on mount */
  enabled?: boolean
}

export interface UseRealtimeSubscriptionReturn {
  /** Whether the subscription is connected */
  isConnected: boolean
  /** Error state */
  error: Error | null
  /** Manually reconnect */
  reconnect: () => void
  /** Manually disconnect */
  disconnect: () => void
}

/**
 * Generic hook for subscribing to Supabase Realtime postgres_changes
 *
 * Use this for custom tables or when you need more control than the
 * specialized hooks (useRealtimeMessages, useRealtimePresence).
 *
 * @example
 * ```tsx
 * // Subscribe to all changes on 'orders' table
 * function OrdersWatcher() {
 *   const { isConnected } = useRealtimeSubscription<Order>({
 *     table: 'orders',
 *     event: '*',
 *     onInsert: (order) => {
 *       toast.success(`New order #${order.id}!`)
 *       queryClient.invalidateQueries(['orders'])
 *     },
 *     onUpdate: (order) => {
 *       toast.info(`Order #${order.id} updated`)
 *       queryClient.invalidateQueries(['orders', order.id])
 *     },
 *   })
 *
 *   return <StatusBadge connected={isConnected} />
 * }
 *
 * // Subscribe to specific user's notifications
 * function NotificationListener({ userId }: { userId: string }) {
 *   const [notifications, setNotifications] = useState<Notification[]>([])
 *
 *   useRealtimeSubscription<Notification>({
 *     table: 'notifications',
 *     filter: { column: 'user_id', value: userId },
 *     onInsert: (notification) => {
 *       setNotifications((prev) => [notification, ...prev])
 *       playNotificationSound()
 *     },
 *   })
 *
 *   return <NotificationList items={notifications} />
 * }
 * ```
 */
export function useRealtimeSubscription<T = Record<string, unknown>>(
  options: UseRealtimeSubscriptionOptions<T>,
): UseRealtimeSubscriptionReturn {
  const {
    schema = "public",
    table,
    event = "*",
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    enabled = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  // Handle realtime events
  const handleChange = useCallback(
    (payload: RealtimePayload<T>) => {
      onChange?.(payload)

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            onInsert?.(payload.new)
          }
          break
        case "UPDATE":
          if (payload.new) {
            onUpdate?.(payload.new, payload.old)
          }
          break
        case "DELETE":
          if (payload.old) {
            onDelete?.(payload.old)
          }
          break
      }
    },
    [onChange, onInsert, onUpdate, onDelete],
  )

  // Connect to realtime
  const connect = useCallback(() => {
    if (isUsingMockSupabase) {
      setIsConnected(true)
      logger.debug("[useRealtimeSubscription] Mock mode - simulating connection", { table })
      return
    }

    // Disconnect existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    const channelName = filter ? `${table}:${filter.column}:${filter.value}` : `${table}:all`

    const channel = supabase.channel(channelName)

    // Build filter string for Supabase
    const filterStr = filter ? `${filter.column}=eq.${filter.value}` : undefined

    // Subscribe to events
    const events: RealtimeEventType[] = event === "*" ? ["INSERT", "UPDATE", "DELETE"] : [event]

    events.forEach((evt) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(channel as any).on(
        "postgres_changes",
        {
          event: evt,
          schema,
          table,
          ...(filterStr ? { filter: filterStr } : {}),
        },
        (payload: unknown) => handleChange(payload as RealtimePayload<T>),
      )
    })

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        setError(null)
        logger.debug("[useRealtimeSubscription] Subscribed", { table, filter })
      } else if (status === "CHANNEL_ERROR") {
        setIsConnected(false)
        setError(new Error(`Failed to subscribe to ${table}`))
        logger.error("[useRealtimeSubscription] Channel error", { table })
      } else if (status === "CLOSED") {
        setIsConnected(false)
      }
    })

    channelRef.current = channel
  }, [schema, table, event, filter, handleChange])

  // Disconnect from realtime
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
      logger.debug("[useRealtimeSubscription] Disconnected", { table })
    }
  }, [table])

  // Reconnect
  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [disconnect, connect])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    error,
    reconnect,
    disconnect,
  }
}

/**
 * Hook for subscribing to activity feed updates
 *
 * @example
 * ```tsx
 * function ActivityFeed({ userId }: { userId: string }) {
 *   const [activities, setActivities] = useState<Activity[]>([])
 *
 *   useActivityFeed({
 *     userId,
 *     onNewActivity: (activity) => {
 *       setActivities((prev) => [activity, ...prev].slice(0, 50))
 *     },
 *   })
 *
 *   return <ActivityList items={activities} />
 * }
 * ```
 */
export function useActivityFeed(options: {
  userId: string
  onNewActivity?: (activity: Record<string, unknown>) => void
  enabled?: boolean
}) {
  const { userId, onNewActivity, enabled = true } = options

  return useRealtimeSubscription({
    table: "activities",
    event: "INSERT",
    filter: { column: "user_id", value: userId },
    onInsert: onNewActivity,
    enabled,
  })
}
