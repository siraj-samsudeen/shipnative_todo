/**
 * TodoScreen
 *
 * Main screen component for the todo application.
 * Composes TodoInput and TodoList to provide a complete todo management interface.
 *
 * Features:
 * - Add new todos via TodoInput
 * - View, toggle, edit, and delete todos via TodoList
 * - Loading and empty states handled by child components
 * - Requires authenticated user
 *
 * @example
 * ```tsx
 * // In navigator
 * <Stack.Screen name="Todo" component={TodoScreen} />
 * ```
 *
 * Validates: Requirement 2.1 - Display all Todo_Items when application starts
 */

import { FC, useCallback } from "react"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Screen, Text, TodoInput, TodoList } from "@/components"
import { useTodos, useTodoMutations } from "@/hooks"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoScreenProps {}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TodoScreen - Main todo management screen
 *
 * Composes:
 * - Screen component with scroll preset for consistent layout
 * - TodoInput for adding new todos
 * - TodoList for displaying and managing todos
 *
 * Requirement 2.1: Display all Todo_Items when application starts
 */
export const TodoScreen: FC<TodoScreenProps> = function TodoScreen() {
  // Fetch todos for the authenticated user
  const { data: todos, isLoading } = useTodos()

  // Get mutation functions for CRUD operations
  const { addTodo, toggleTodo, updateTodo, deleteTodo } = useTodoMutations()

  /**
   * Handle adding a new todo
   * Requirement 1.1: Create new Todo_Item when user submits
   */
  const handleAddTodo = useCallback(
    async (title: string) => {
      await addTodo.mutateAsync(title)
    },
    [addTodo],
  )

  /**
   * Handle toggling todo completion status
   * Requirement 3.1: Toggle Completion_Status when user taps
   */
  const handleToggleTodo = useCallback(
    (id: string) => {
      toggleTodo.mutate(id)
    },
    [toggleTodo],
  )

  /**
   * Handle updating todo title
   * Requirement 4.2: Update Todo_Item with new description
   */
  const handleUpdateTodo = useCallback(
    (id: string, title: string) => {
      updateTodo.mutate({ id, title })
    },
    [updateTodo],
  )

  /**
   * Handle deleting a todo
   * Requirement 5.1: Remove Todo_Item from Task_List
   */
  const handleDeleteTodo = useCallback(
    (id: string) => {
      deleteTodo.mutate(id)
    },
    [deleteTodo],
  )

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text preset="heading" tx="todoScreen:title" />
        </View>

        {/* Input for adding new todos */}
        <TodoInput
          onAdd={handleAddTodo}
          isLoading={addTodo.isPending}
          style={styles.input}
        />

        {/* List of todos */}
        <TodoList
          todos={todos ?? []}
          isLoading={isLoading}
          onToggle={handleToggleTodo}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
          style={styles.list}
          testID="todo-list"
        />
      </View>
    </Screen>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  list: {
    flex: 1,
  },
}))
