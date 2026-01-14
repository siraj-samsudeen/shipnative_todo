/**
 * Convex Realtime Service
 *
 * Implements the RealtimeService interface for Convex.
 *
 * Note: Convex is reactive by default! All queries automatically update
 * when underlying data changes. This service provides a compatibility layer
 * for the unified interface, but for best DX, use Convex's native useQuery hook.
 */

import { logger } from "../../../utils/Logger"
import type {
  RealtimeService,
  RealtimeChannel,
  RealtimePayload,
  RealtimeEventType,
  PresenceChannel,
  BroadcastChannel,
} from "../types"
import { isUsingMockConvex } from "./client"

// ============================================================================
// Mock Realtime State
// ============================================================================

type MockListener<T> = (payload: RealtimePayload<T>) => void
type MockPresenceCallback = (key: string, current: unknown[], change: unknown[]) => void

const mockChannels: Map<
  string,
  {
    listeners: Set<MockListener<unknown>>
    presenceListeners: {
      sync: Set<() => void>
      join: Set<MockPresenceCallback>
      leave: Set<MockPresenceCallback>
    }
    broadcastListeners: Map<string, Set<(payload: Record<string, unknown>) => void>>
    presenceState: Map<string, unknown[]>
  }
> = new Map()

function getMockChannel(name: string) {
  if (!mockChannels.has(name)) {
    mockChannels.set(name, {
      listeners: new Set(),
      presenceListeners: {
        sync: new Set(),
        join: new Set(),
        leave: new Set(),
      },
      broadcastListeners: new Map(),
      presenceState: new Map(),
    })
  }
  return mockChannels.get(name)!
}

// ============================================================================
// Channel Implementations
// ============================================================================

function createMockRealtimeChannel(channelName: string): RealtimeChannel {
  const channel = getMockChannel(channelName)

  return {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      if (callback) {
        // Simulate async subscription
        setTimeout(() => callback("SUBSCRIBED"), 0)
      }
      return this
    },
    async unsubscribe() {
      channel.listeners.clear()
    },
  }
}

function createMockPresenceChannel(channelName: string): PresenceChannel {
  const channel = getMockChannel(channelName)

  const wrapped: PresenceChannel = {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      if (callback) {
        setTimeout(() => callback("SUBSCRIBED"), 0)
      }
      return wrapped
    },
    async unsubscribe() {
      channel.listeners.clear()
    },
    async track(state: Record<string, unknown>) {
      const key = `user-${Date.now()}`
      const existing = channel.presenceState.get(key) ?? []
      const newPresences = [state]
      channel.presenceState.set(key, [...existing, state])

      // Notify join listeners
      channel.presenceListeners.join.forEach((cb) => cb(key, existing, newPresences))
      // Notify sync listeners
      channel.presenceListeners.sync.forEach((cb) => cb())
    },
    async untrack() {
      // In a real implementation, we'd track the current user's key
      channel.presenceState.clear()
    },
    presenceState() {
      const state: Record<string, unknown[]> = {}
      channel.presenceState.forEach((value, key) => {
        state[key] = value
      })
      return state
    },
    onSync(callback: () => void) {
      channel.presenceListeners.sync.add(callback)
      return wrapped
    },
    onJoin(callback: MockPresenceCallback) {
      channel.presenceListeners.join.add(callback)
      return wrapped
    },
    onLeave(callback: MockPresenceCallback) {
      channel.presenceListeners.leave.add(callback)
      return wrapped
    },
  }
  return wrapped
}

function createMockBroadcastChannel(channelName: string): BroadcastChannel {
  const channel = getMockChannel(channelName)

  const wrapped: BroadcastChannel = {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      if (callback) {
        setTimeout(() => callback("SUBSCRIBED"), 0)
      }
      return wrapped
    },
    async unsubscribe() {
      channel.listeners.clear()
    },
    async send(event: string, payload: Record<string, unknown>) {
      const listeners = channel.broadcastListeners.get(event)
      if (listeners) {
        listeners.forEach((cb) => cb(payload))
      }
    },
    onBroadcast(event: string, callback: (payload: Record<string, unknown>) => void) {
      if (!channel.broadcastListeners.has(event)) {
        channel.broadcastListeners.set(event, new Set())
      }
      channel.broadcastListeners.get(event)!.add(callback)
      return wrapped
    },
  }
  return wrapped
}

// ============================================================================
// Convex Realtime Service Implementation
// ============================================================================

/**
 * Create a Convex Realtime service instance.
 *
 * IMPORTANT: Convex queries are reactive by default!
 *
 * Instead of subscribing to changes, just use useQuery:
 * ```typescript
 * const messages = useQuery(api.messages.list, { channelId })
 * // `messages` automatically updates when data changes
 * ```
 *
 * This service provides compatibility for:
 * - Table subscriptions (via Convex's reactive queries)
 * - Presence (requires custom implementation)
 * - Broadcast (requires custom implementation)
 *
 * For presence and broadcast, you'd typically use a third-party service
 * like Ably, Pusher, or implement it via Convex actions.
 */
export function createConvexRealtimeService(): RealtimeService {
  return {
    subscribeToTable<T = unknown>(
      table: string,
      callback: (payload: RealtimePayload<T>) => void,
      options?: {
        event?: RealtimeEventType
        filter?: string
        schema?: string
      },
    ): RealtimeChannel {
      if (isUsingMockConvex) {
        const channelName = `table:${table}`
        const channel = getMockChannel(channelName)
        channel.listeners.add(callback as MockListener<unknown>)

        return {
          subscribe(statusCallback) {
            if (statusCallback) {
              setTimeout(() => statusCallback("SUBSCRIBED"), 0)
            }
            return this
          },
          async unsubscribe() {
            channel.listeners.delete(callback as MockListener<unknown>)
          },
        }
      }

      // For real Convex, table subscriptions are handled via useQuery
      logger.warn(
        `[Convex] Table subscriptions work differently. ` +
          `Use useQuery(api.${table}.list) - it's automatically reactive!`,
      )

      // Return a no-op channel
      return {
        subscribe(statusCallback) {
          if (statusCallback) {
            statusCallback(
              "ERROR",
              new Error(`Use useQuery(api.${table}.list) instead of subscribeToTable()`),
            )
          }
          return this
        },
        async unsubscribe() {},
      }
    },

    createPresenceChannel(channelName: string): PresenceChannel {
      if (isUsingMockConvex) {
        return createMockPresenceChannel(channelName)
      }

      logger.warn(
        `[Convex] Presence requires custom implementation. ` +
          `Consider using Ably, Pusher, or a custom Convex solution.`,
      )

      // Return a minimal implementation that logs warnings
      return {
        subscribe(callback) {
          if (callback) {
            callback("ERROR", new Error("Presence requires custom implementation"))
          }
          return this
        },
        async unsubscribe() {},
        async track() {
          logger.warn("[Convex] Presence tracking requires custom implementation")
        },
        async untrack() {},
        presenceState() {
          return {}
        },
        onSync(callback) {
          return this
        },
        onJoin(callback) {
          return this
        },
        onLeave(callback) {
          return this
        },
      }
    },

    createBroadcastChannel(channelName: string): BroadcastChannel {
      if (isUsingMockConvex) {
        return createMockBroadcastChannel(channelName)
      }

      logger.warn(
        `[Convex] Broadcast requires custom implementation. ` +
          `Consider using Convex actions with a pub/sub service.`,
      )

      return {
        subscribe(callback) {
          if (callback) {
            callback("ERROR", new Error("Broadcast requires custom implementation"))
          }
          return this
        },
        async unsubscribe() {},
        async send() {
          logger.warn("[Convex] Broadcast requires custom implementation")
        },
        onBroadcast() {
          return this
        },
      }
    },
  }
}

// ============================================================================
// Mock Realtime Utilities (for testing)
// ============================================================================

export const convexMockRealtime = {
  /**
   * Clear all mock channels
   */
  clear(): void {
    mockChannels.clear()
  },

  /**
   * Trigger a realtime event for a table
   */
  triggerTableEvent<T>(
    table: string,
    eventType: RealtimeEventType,
    newData: T | null,
    oldData: T | null = null,
  ): void {
    const channelName = `table:${table}`
    const channel = getMockChannel(channelName)

    const payload: RealtimePayload<T> = {
      eventType,
      new: newData,
      old: oldData,
      table,
    }

    channel.listeners.forEach((listener) => {
      ;(listener as MockListener<T>)(payload)
    })
  },

  /**
   * Trigger a broadcast event
   */
  triggerBroadcast(channelName: string, event: string, payload: Record<string, unknown>): void {
    const channel = getMockChannel(channelName)
    const listeners = channel.broadcastListeners.get(event)
    if (listeners) {
      listeners.forEach((cb) => cb(payload))
    }
  },

  /**
   * Simulate a user joining presence
   */
  triggerPresenceJoin(channelName: string, userId: string, state: Record<string, unknown>): void {
    const channel = getMockChannel(channelName)
    const existing = channel.presenceState.get(userId) ?? []
    const newPresences = [state]
    channel.presenceState.set(userId, [...existing, state])

    channel.presenceListeners.join.forEach((cb) => cb(userId, existing, newPresences))
    channel.presenceListeners.sync.forEach((cb) => cb())
  },

  /**
   * Simulate a user leaving presence
   */
  triggerPresenceLeave(channelName: string, userId: string): void {
    const channel = getMockChannel(channelName)
    const leftPresences = channel.presenceState.get(userId) ?? []
    channel.presenceState.delete(userId)

    channel.presenceListeners.leave.forEach((cb) => cb(userId, [], leftPresences))
    channel.presenceListeners.sync.forEach((cb) => cb())
  },
}
