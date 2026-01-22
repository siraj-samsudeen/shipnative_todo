/**
 * TodoItem Component
 * 
 * Displays a single todo item with description.
 * This is a minimal implementation for the initial vertical slice.
 */

import { FC } from "react"
import { View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import type { Todo } from "@/types/todo"

import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoItemProps {
  /**
   * Todo item data
   */
  todo: Todo
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Minimal todo item component that displays the task description.
 * 
 * @example
 * <TodoItem todo={todoData} />
 */
export const TodoItem: FC<TodoItemProps> = function TodoItem({ todo }) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{todo.description}</Text>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  description: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base,
  },
}))
