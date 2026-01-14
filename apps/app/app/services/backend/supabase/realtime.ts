/**
 * Supabase Realtime Service
 *
 * Implements the RealtimeService interface for Supabase.
 */

import type { RealtimeChannel as SupabaseRealtimeChannel } from "@supabase/supabase-js"

import type {
  RealtimeService,
  RealtimeChannel,
  RealtimePayload,
  RealtimeEventType,
  PresenceChannel,
  BroadcastChannel,
} from "../types"
import { getSupabaseClient } from "./client"

// ============================================================================
// Channel Wrappers
// ============================================================================

function wrapChannel(channel: SupabaseRealtimeChannel): RealtimeChannel {
  return {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      channel.subscribe((status, err) => {
        if (callback) {
          const mappedStatus =
            status === "SUBSCRIBED" ? "SUBSCRIBED" : status === "CLOSED" ? "CLOSED" : "ERROR"
          callback(mappedStatus, err ? new Error(String(err)) : undefined)
        }
      })
      return this
    },
    async unsubscribe() {
      await channel.unsubscribe()
    },
  }
}

function wrapPresenceChannel(channel: SupabaseRealtimeChannel): PresenceChannel {
  const wrapped: PresenceChannel = {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      channel.subscribe((status, err) => {
        if (callback) {
          const mappedStatus =
            status === "SUBSCRIBED" ? "SUBSCRIBED" : status === "CLOSED" ? "CLOSED" : "ERROR"
          callback(mappedStatus, err ? new Error(String(err)) : undefined)
        }
      })
      return wrapped
    },
    async unsubscribe() {
      await channel.unsubscribe()
    },
    async track(state: Record<string, unknown>) {
      await channel.track(state)
    },
    async untrack() {
      await channel.untrack()
    },
    presenceState() {
      return channel.presenceState() as Record<string, unknown[]>
    },
    onSync(callback: () => void) {
      channel.on("presence", { event: "sync" }, callback)
      return wrapped
    },
    onJoin(callback: (key: string, currentPresences: unknown[], newPresences: unknown[]) => void) {
      channel.on("presence", { event: "join" }, ({ key, currentPresences, newPresences }) => {
        callback(key, currentPresences, newPresences)
      })
      return wrapped
    },
    onLeave(
      callback: (key: string, currentPresences: unknown[], leftPresences: unknown[]) => void,
    ) {
      channel.on("presence", { event: "leave" }, ({ key, currentPresences, leftPresences }) => {
        callback(key, currentPresences, leftPresences)
      })
      return wrapped
    },
  }
  return wrapped
}

function wrapBroadcastChannel(channel: SupabaseRealtimeChannel): BroadcastChannel {
  const wrapped: BroadcastChannel = {
    subscribe(callback?: (status: "SUBSCRIBED" | "CLOSED" | "ERROR", error?: Error) => void) {
      channel.subscribe((status, err) => {
        if (callback) {
          const mappedStatus =
            status === "SUBSCRIBED" ? "SUBSCRIBED" : status === "CLOSED" ? "CLOSED" : "ERROR"
          callback(mappedStatus, err ? new Error(String(err)) : undefined)
        }
      })
      return wrapped
    },
    async unsubscribe() {
      await channel.unsubscribe()
    },
    async send(event: string, payload: Record<string, unknown>) {
      await channel.send({
        type: "broadcast",
        event,
        payload,
      })
    },
    onBroadcast(event: string, callback: (payload: Record<string, unknown>) => void) {
      channel.on("broadcast", { event }, ({ payload }) => {
        callback(payload as Record<string, unknown>)
      })
      return wrapped
    },
  }
  return wrapped
}

// ============================================================================
// Supabase Realtime Service Implementation
// ============================================================================

export function createSupabaseRealtimeService(): RealtimeService {
  const getClient = () => getSupabaseClient()

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
      const channelName = `${options?.schema ?? "public"}:${table}`
      const channel = getClient().channel(channelName)

      // Map event type
      const event = options?.event === "*" ? "*" : (options?.event ?? "*")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(channel as any).on(
        "postgres_changes",
        {
          event: event as "INSERT" | "UPDATE" | "DELETE" | "*",
          schema: options?.schema ?? "public",
          table,
          filter: options?.filter,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          callback({
            eventType: payload.eventType as RealtimeEventType,
            new: payload.new as T | null,
            old: payload.old as T | null,
            table: payload.table,
          })
        },
      )

      return wrapChannel(channel)
    },

    createPresenceChannel(channelName: string): PresenceChannel {
      const channel = getClient().channel(channelName)
      return wrapPresenceChannel(channel)
    },

    createBroadcastChannel(channelName: string): BroadcastChannel {
      const channel = getClient().channel(channelName)
      return wrapBroadcastChannel(channel)
    },
  }
}
