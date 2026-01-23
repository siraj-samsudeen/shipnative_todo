/**
 * Todo Hooks
 * 
 * React Query hooks for managing todo items with Supabase backend.
 * Provides CRUD operations with automatic cache invalidation and error handling.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { supabase } from "../services/supabase"
import type { Todo } from "../types/todo"
import { logger } from "../utils/Logger"
import { useAuth } from "./useAppAuth"

/**
 * Query key factory for todo-related queries
 */
// TODO: This should be under the queryKeys.ts file.
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (userId: string) => [...todoKeys.lists(), userId] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

/**
 * Fetch all todos for the current user
 * 
 * Todos are ordered by:
 * 1. Completion status (incomplete first)
 * 2. Creation date (newest first)
 * 
 * @returns Query result with todos array
 */
export function useTodos() {
  const { user } = useAuth()

  return useQuery({
    queryKey: todoKeys.list(user?.id ?? ""),
    queryFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated to fetch todos")
      }

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) {
        logger.error("Failed to fetch todos", { userId: user.id }, error)
        throw error
      }

      return data as Todo[]
    },
    enabled: !!user,
  })
}

/**
 * Add a new todo item
 * 
 * Validates description (trims whitespace, checks non-empty) before inserting.
 * Automatically invalidates the todos query on success.
 * 
 * @returns Mutation hook with mutate/mutateAsync functions
 */
export function useAddTodo() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (description: string) => {
      if (!user) {
        throw new Error("User must be authenticated to add todos")
      }

      const trimmed = description.trim()
      if (!trimmed) {
        throw new Error("Description cannot be empty")
      }

      const { data, error } = await supabase
        .from("todos")
        .insert({ user_id: user.id, description: trimmed })
        .select()
        .single()

      if (error) {
        logger.error("Failed to add todo", { userId: user.id, description: trimmed }, error)
        throw error
      }

      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

/**
 * Toggle todo completion status
 * 
 * Flips the completed boolean and automatically invalidates queries.
 * 
 * @returns Mutation hook with mutate/mutateAsync functions
 */
export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        logger.error("Failed to toggle todo", { id, completed }, error)
        throw error
      }

      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

/**
 * Update todo description
 * 
 * Validates new description (trims whitespace, checks non-empty) before updating.
 * Automatically invalidates queries on success.
 * 
 * @returns Mutation hook with mutate/mutateAsync functions
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      const trimmed = description.trim()
      if (!trimmed) {
        throw new Error("Description cannot be empty")
      }

      const { data, error } = await supabase
        .from("todos")
        .update({ description: trimmed })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        logger.error("Failed to update todo", { id, description: trimmed }, error)
        throw error
      }

      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

/**
 * Delete a todo item
 * 
 * Removes the todo from the database and invalidates queries.
 * 
 * @returns Mutation hook with mutate/mutateAsync functions
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        logger.error("Failed to delete todo", { id }, error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

/**
 * Subscribe to realtime todo updates
 * 
 * Listens for INSERT, UPDATE, and DELETE events on the todos table
 * and automatically invalidates queries to refetch data.
 * 
 * Only subscribes to changes for the current user's todos (filtered by RLS).
 */
export function useTodosRealtime() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // TODO: Use the useRealtimeSubscription hook instead of the supabase channel.
  useEffect(() => {
    if (!user) return
    // TODO: The delete event is not being triggered. Need to investigate why.
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}
