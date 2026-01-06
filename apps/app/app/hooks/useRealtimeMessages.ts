import { useState, useEffect, useCallback, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"

import { supabase, isUsingMockSupabase } from "../services/supabase"
import type {
  RealtimeMessage,
  RealtimeMessageWithUser,
  RealtimePayload,
  TypingState,
} from "../types/realtime"
import { logger } from "../utils/Logger"

export interface UseRealtimeMessagesOptions {
  /** Channel ID to subscribe to */
  channelId: string
  /** Whether to include user info with messages */
  includeUser?: boolean
  /** Initial messages to display (e.g., from cache or server) */
  initialMessages?: RealtimeMessage[]
  /** Maximum number of messages to keep in state */
  maxMessages?: number
  /** Called when a new message is received */
  onNewMessage?: (message: RealtimeMessage) => void
  /** Called when a message is updated */
  onMessageUpdated?: (message: RealtimeMessage) => void
  /** Called when a message is deleted */
  onMessageDeleted?: (messageId: string) => void
  /** Called when typing state changes */
  onTypingChange?: (typingUsers: string[]) => void
}

export interface UseRealtimeMessagesReturn {
  /** Current messages in the channel */
  messages: RealtimeMessage[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Whether the subscription is connected */
  isConnected: boolean
  /** Users currently typing */
  typingUsers: string[]
  /** Send a new message */
  sendMessage: (
    content: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>
  /** Update an existing message */
  updateMessage: (messageId: string, content: string) => Promise<{ error: Error | null }>
  /** Delete a message */
  deleteMessage: (messageId: string) => Promise<{ error: Error | null }>
  /** Broadcast typing state */
  setTyping: (isTyping: boolean) => void
  /** Manually refresh messages from server */
  refresh: () => Promise<void>
}

/**
 * Hook for real-time chat messages with typing indicators
 *
 * @example
 * ```tsx
 * function ChatRoom({ channelId }: { channelId: string }) {
 *   const {
 *     messages,
 *     sendMessage,
 *     typingUsers,
 *     setTyping,
 *     isConnected,
 *   } = useRealtimeMessages({
 *     channelId,
 *     onNewMessage: (msg) => playNotificationSound(),
 *   })
 *
 *   const handleSend = async (text: string) => {
 *     const { error } = await sendMessage(text)
 *     if (error) alert(error.message)
 *   }
 *
 *   return (
 *     <View>
 *       {!isConnected && <Text>Connecting...</Text>}
 *       <FlatList data={messages} renderItem={({ item }) => <Message {...item} />} />
 *       {typingUsers.length > 0 && <Text>{typingUsers.join(', ')} typing...</Text>}
 *       <ChatInput onSend={handleSend} onTyping={setTyping} />
 *     </View>
 *   )
 * }
 * ```
 */
export function useRealtimeMessages(
  options: UseRealtimeMessagesOptions,
): UseRealtimeMessagesReturn {
  const {
    channelId,
    includeUser = false,
    initialMessages = [],
    maxMessages = 100,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onTypingChange,
  } = options

  const [messages, setMessages] = useState<RealtimeMessage[]>(initialMessages)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (isUsingMockSupabase) {
      setLoading(false)
      setIsConnected(true)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const query = supabase
        .from("messages")
        .select(includeUser ? "*, user:profiles(id, full_name, avatar_url)" : "*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(maxMessages)

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setMessages((data as RealtimeMessage[]) ?? [])
    } catch (err) {
      const resolvedError = err instanceof Error ? err : new Error(String(err))
      logger.error("[useRealtimeMessages] Failed to fetch messages", { channelId }, resolvedError)
      setError(resolvedError)
    } finally {
      setLoading(false)
    }
  }, [channelId, includeUser, maxMessages])

  // Handle new message from realtime
  const handleInsert = useCallback(
    (payload: RealtimePayload<RealtimeMessage>) => {
      if (!payload.new) return

      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === payload.new!.id)) {
          return prev
        }

        const newMessages = [...prev, payload.new!]
        // Trim to max messages
        if (newMessages.length > maxMessages) {
          return newMessages.slice(-maxMessages)
        }
        return newMessages
      })

      onNewMessage?.(payload.new)
    },
    [maxMessages, onNewMessage],
  )

  // Handle message update from realtime
  const handleUpdate = useCallback(
    (payload: RealtimePayload<RealtimeMessage>) => {
      if (!payload.new) return

      setMessages((prev) => prev.map((m) => (m.id === payload.new!.id ? payload.new! : m)))

      onMessageUpdated?.(payload.new)
    },
    [onMessageUpdated],
  )

  // Handle message deletion from realtime
  const handleDelete = useCallback(
    (payload: RealtimePayload<RealtimeMessage>) => {
      if (!payload.old?.id) return

      setMessages((prev) => prev.filter((m) => m.id !== payload.old!.id))

      onMessageDeleted?.(payload.old.id)
    },
    [onMessageDeleted],
  )

  // Handle typing broadcast
  const handleTyping = useCallback(
    (payload: { payload: TypingState }) => {
      const { user_id, is_typing } = payload.payload

      // Clear existing timeout for this user
      const existingTimeout = typingTimeoutsRef.current.get(user_id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        typingTimeoutsRef.current.delete(user_id)
      }

      setTypingUsers((prev) => {
        if (is_typing) {
          // Add user if not already typing
          if (!prev.includes(user_id)) {
            const newTyping = [...prev, user_id]
            onTypingChange?.(newTyping)
            return newTyping
          }
        } else {
          // Remove user from typing
          const newTyping = prev.filter((id) => id !== user_id)
          onTypingChange?.(newTyping)
          return newTyping
        }
        return prev
      })

      // Auto-clear typing after 5 seconds
      if (is_typing) {
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const newTyping = prev.filter((id) => id !== user_id)
            onTypingChange?.(newTyping)
            return newTyping
          })
          typingTimeoutsRef.current.delete(user_id)
        }, 5000)
        typingTimeoutsRef.current.set(user_id, timeout)
      }
    },
    [onTypingChange],
  )

  // Set up realtime subscription
  useEffect(() => {
    if (isUsingMockSupabase) {
      setIsConnected(true)
      setLoading(false)
      return
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        handleInsert as (payload: unknown) => void,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        handleUpdate as (payload: unknown) => void,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        handleDelete as (payload: unknown) => void,
      )
      .on("broadcast", { event: "typing" }, handleTyping)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          logger.debug("[useRealtimeMessages] Subscribed to channel", { channelId })
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false)
          setError(new Error("Failed to connect to realtime channel"))
          logger.error("[useRealtimeMessages] Channel error", { channelId })
        }
      })

    channelRef.current = channel

    return () => {
      // Clear typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      typingTimeoutsRef.current.clear()

      // Unsubscribe
      channel.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
    }
  }, [channelId, fetchMessages, handleInsert, handleUpdate, handleDelete, handleTyping])

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, metadata?: Record<string, unknown>) => {
      if (isUsingMockSupabase) {
        // Mock: add message locally
        const mockMessage: RealtimeMessage = {
          id: `mock-${Date.now()}`,
          channel_id: channelId,
          user_id: "mock-user",
          content,
          created_at: new Date().toISOString(),
          metadata,
        }
        setMessages((prev) => [...prev, mockMessage])
        onNewMessage?.(mockMessage)
        return { error: null }
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          return { error: new Error("Not authenticated") }
        }

        // Note: Add 'messages' table to your Supabase types if using TypeScript strict mode
        // See vibe/SUPABASE.md for the messages table schema
        const { error: insertError } = await (
          supabase.from("messages") as ReturnType<typeof supabase.from>
        ).insert({
          channel_id: channelId,
          user_id: user.id,
          content,
          metadata,
        } as Record<string, unknown>)

        if (insertError) {
          return { error: insertError }
        }

        return { error: null }
      } catch (err) {
        const resolvedError = err instanceof Error ? err : new Error(String(err))
        logger.error("[useRealtimeMessages] Failed to send message", { channelId }, resolvedError)
        return { error: resolvedError }
      }
    },
    [channelId, onNewMessage],
  )

  // Update an existing message
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    if (isUsingMockSupabase) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content, updated_at: new Date().toISOString() } : m,
        ),
      )
      return { error: null }
    }

    try {
      const { error: updateError } = await (
        supabase.from("messages") as ReturnType<typeof supabase.from>
      )
        .update({ content, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq("id", messageId)

      if (updateError) {
        return { error: updateError }
      }

      return { error: null }
    } catch (err) {
      const resolvedError = err instanceof Error ? err : new Error(String(err))
      logger.error("[useRealtimeMessages] Failed to update message", { messageId }, resolvedError)
      return { error: resolvedError }
    }
  }, [])

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (isUsingMockSupabase) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        onMessageDeleted?.(messageId)
        return { error: null }
      }

      try {
        const { error: deleteError } = await supabase.from("messages").delete().eq("id", messageId)

        if (deleteError) {
          return { error: deleteError }
        }

        return { error: null }
      } catch (err) {
        const resolvedError = err instanceof Error ? err : new Error(String(err))
        logger.error("[useRealtimeMessages] Failed to delete message", { messageId }, resolvedError)
        return { error: resolvedError }
      }
    },
    [onMessageDeleted],
  )

  // Broadcast typing state
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (isUsingMockSupabase || !channelRef.current) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: {
            user_id: user.id,
            channel_id: channelId,
            is_typing: isTyping,
          } satisfies TypingState,
        })
      } catch (err) {
        logger.error("[useRealtimeMessages] Failed to broadcast typing", {}, err as Error)
      }
    },
    [channelId],
  )

  // Refresh messages
  const refresh = useCallback(async () => {
    await fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    isConnected,
    typingUsers,
    sendMessage,
    updateMessage,
    deleteMessage,
    setTyping,
    refresh,
  }
}
