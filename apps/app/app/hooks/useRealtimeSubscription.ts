import { useState, useEffect, useCallback, useRef } from "react"

import { getBackend, isUsingMockBackend } from "../services/backend"
import type { RealtimeChannel, RealtimePayload as BackendRealtimePayload } from "../services/backend/types"
import type { RealtimeEventType, RealtimeSubscriptionConfig } from "../types/realtime"
import { logger } from "../utils/Logger"

/** Internal payload type that matches what handlers need */
interface InternalPayload<T> {
  eventType: RealtimeEventType
  new: T | null
  old: T | null
}

export interface UseRealtimeSubscriptionOptions<T> extends RealtimeSubscriptionConfig {
  /** Called when data changes (INSERT, UPDATE, DELETE) */
  onInsert?: (record: T) => void
  onUpdate?: (record: T, oldRecord: T | null) => void
  onDelete?: (oldRecord: T) => void
  /** Called for any change event */
  onChange?: (payload: InternalPayload<T>) => void
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
 * Generic hook for subscribing to backend realtime changes
 *
 * Uses the backend abstraction layer for provider-agnostic realtime subscriptions.
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

  const channelsRef = useRef<RealtimeChannel[]>([])

  // Handle realtime events
  const handleChange = useCallback(
    (payload: InternalPayload<T>) => {
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
    if (isUsingMockBackend()) {
      setIsConnected(true)
      logger.debug("[useRealtimeSubscription] Mock mode - simulating connection", { table })
      return
    }

    // Disconnect existing channels
    channelsRef.current.forEach((ch) => ch.unsubscribe())
    channelsRef.current = []

    const backend = getBackend()

    // Build filter string
    const filterStr = filter ? `${filter.column}=eq.${filter.value}` : undefined

    // Subscribe to events
    const events: RealtimeEventType[] = event === "*" ? ["INSERT", "UPDATE", "DELETE"] : [event]
    const channels: RealtimeChannel[] = []
    let subscribedCount = 0

    const checkAllSubscribed = () => {
      subscribedCount++
      if (subscribedCount >= events.length) {
        setIsConnected(true)
        setError(null)
        logger.debug("[useRealtimeSubscription] Subscribed", { table, filter })
      }
    }

    events.forEach((evt) => {
      const channel = backend.realtime.subscribeToTable<T>(
        table,
        (payload: BackendRealtimePayload<T>) => {
          handleChange({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        },
        {
          event: evt,
          schema,
          filter: filterStr,
        },
      )

      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          checkAllSubscribed()
        } else if (status === "ERROR") {
          setIsConnected(false)
          setError(err ?? new Error(`Failed to subscribe to ${table}`))
          logger.error("[useRealtimeSubscription] Channel error", { table })
        } else if (status === "CLOSED") {
          setIsConnected(false)
        }
      })

      channels.push(channel)
    })

    channelsRef.current = channels
  }, [schema, table, event, filter, handleChange])

  // Disconnect from realtime
  const disconnect = useCallback(() => {
    channelsRef.current.forEach((ch) => ch.unsubscribe())
    channelsRef.current = []
    setIsConnected(false)
    logger.debug("[useRealtimeSubscription] Disconnected", { table })
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
