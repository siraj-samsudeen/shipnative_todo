/**
 * useTodos Hook
 *
 * React Query hooks for managing todo items with Supabase backend.
 * Provides CRUD operations with optimistic updates for responsive UI.
 *
 * @example
 * ```tsx
 * import { useTodos, useTodoMutations } from "@/hooks"
 *
 * function TodoScreen() {
 *   const { data: todos, isLoading, error } = useTodos()
 *   const { addTodo, toggleTodo, updateTodo, deleteTodo } = useTodoMutations()
 *
 *   // Add a new todo
 *   await addTodo.mutateAsync("Buy groceries")
 *
 *   // Toggle completion
 *   await toggleTodo.mutateAsync(todoId)
 *
 *   // Update title
 *   await updateTodo.mutateAsync({ id: todoId, title: "New title" })
 *
 *   // Delete
 *   await deleteTodo.mutateAsync(todoId)
 * }
 * ```
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "../services/supabase"
import type { TodoRow } from "../types/todo"
import { useAuth } from "./useAppAuth"

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key factory for todo-related queries
 */
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (userId: string) => [...todoKeys.lists(), userId] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

// ============================================================================
// useTodos Query Hook
// ============================================================================

/**
 * Fetch user's todos ordered by created_at (newest first)
 *
 * @returns React Query result with todos array
 *
 * @example
 * ```tsx
 * const { data: todos, isLoading, error } = useTodos()
 * ```
 */
export function useTodos() {
  const { userId, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: todoKeys.list(userId ?? ""),
    queryFn: async (): Promise<TodoRow[]> => {
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return (data as TodoRow[]) ?? []
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 1000 * 60, // 1 minute
  })
}

// ============================================================================
// useTodoMutations Hook
// ============================================================================

/**
 * Validation helper - checks if input is valid (non-empty after trimming)
 */
function isValidTodoInput(input: string): boolean {
  return input.trim().length > 0
}

/**
 * CRUD mutations for todos with optimistic updates
 *
 * @returns Object containing addTodo, toggleTodo, updateTodo, deleteTodo mutations
 *
 * @example
 * ```tsx
 * const { addTodo, toggleTodo, updateTodo, deleteTodo } = useTodoMutations()
 *
 * // Add todo
 * addTodo.mutate("New task")
 *
 * // Toggle completion
 * toggleTodo.mutate(todoId)
 *
 * // Update title
 * updateTodo.mutate({ id: todoId, title: "Updated title" })
 *
 * // Delete todo
 * deleteTodo.mutate(todoId)
 * ```
 */
export function useTodoMutations() {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  const queryKey = todoKeys.list(userId ?? "")

  /**
   * Add a new todo
   *
   * Validates: Requirements 1.1, 1.2
   * - If input is valid (non-empty after trim), creates todo with trimmed title
   * - If input is whitespace-only, throws error and prevents creation
   */
  const addTodo = useMutation({
    mutationFn: async (title: string): Promise<TodoRow> => {
      // Client-side validation - reject whitespace-only input
      if (!isValidTodoInput(title)) {
        throw new Error("Todo title cannot be empty or whitespace only")
      }

      if (!userId) {
        throw new Error("User must be authenticated to add todos")
      }

      const trimmedTitle = title.trim()

      const { data, error } = await supabase
        .from("todos")
        .insert({
          user_id: userId,
          title: trimmedTitle,
          completed: false,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as TodoRow
    },
    onMutate: async (title: string) => {
      // Don't do optimistic update for invalid input
      if (!isValidTodoInput(title) || !userId) {
        return { previousTodos: undefined }
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<TodoRow[]>(queryKey)

      // Optimistically add the new todo
      const optimisticTodo: TodoRow = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        title: title.trim(),
        completed: false,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData<TodoRow[]>(queryKey, (old) => {
        return old ? [optimisticTodo, ...old] : [optimisticTodo]
      })

      return { previousTodos }
    },
    onError: (_err, _title, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })

  /**
   * Toggle todo completion status
   *
   * Validates: Requirement 3.1
   * - Toggles completion status to opposite value
   * - Double toggle returns to original state
   */
  const toggleTodo = useMutation({
    mutationFn: async (id: string): Promise<TodoRow> => {
      // First get the current todo to know its completion status
      const { data: currentTodo, error: fetchError } = await supabase
        .from("todos")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const newCompleted = !(currentTodo as TodoRow).completed

      const { data, error } = await supabase
        .from("todos")
        .update({ completed: newCompleted })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as TodoRow
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<TodoRow[]>(queryKey)

      // Optimistically toggle the todo
      queryClient.setQueryData<TodoRow[]>(queryKey, (old) => {
        return old?.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        )
      })

      return { previousTodos }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })

  /**
   * Update todo title
   *
   * Validates: Requirements 4.2, 4.3
   * - If new title is valid (non-empty after trim), updates with trimmed title
   * - If new title is whitespace-only, throws error and prevents update
   */
  const updateTodo = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }): Promise<TodoRow> => {
      // Client-side validation - reject whitespace-only input
      if (!isValidTodoInput(title)) {
        throw new Error("Todo title cannot be empty or whitespace only")
      }

      const trimmedTitle = title.trim()

      const { data, error } = await supabase
        .from("todos")
        .update({ title: trimmedTitle })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as TodoRow
    },
    onMutate: async ({ id, title }) => {
      // Don't do optimistic update for invalid input
      if (!isValidTodoInput(title)) {
        return { previousTodos: undefined }
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<TodoRow[]>(queryKey)

      // Optimistically update the todo
      queryClient.setQueryData<TodoRow[]>(queryKey, (old) => {
        return old?.map((todo) => (todo.id === id ? { ...todo, title: title.trim() } : todo))
      })

      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })

  /**
   * Delete a todo
   *
   * Validates: Requirement 5.1
   * - Removes todo from list
   * - Count decreases by exactly 1
   */
  const deleteTodo = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<TodoRow[]>(queryKey)

      // Optimistically remove the todo
      queryClient.setQueryData<TodoRow[]>(queryKey, (old) => {
        return old?.filter((todo) => todo.id !== id)
      })

      return { previousTodos }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  }
}
