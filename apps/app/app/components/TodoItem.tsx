/**
 * TodoItem Component
 * 
 * Displays a single todo item with description and completion toggle.
 * Supports visual feedback for completed state and accessibility.
 */

import { FC } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import type { Todo } from "@/types/todo"

import { Checkbox } from "./Toggle"
import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoItemProps {
  /**
   * Todo item data
   */
  todo: Todo
  /**
   * Callback when todo completion status is toggled
   */
  onToggle: (id: string, completed: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Todo item component with completion toggle and visual feedback.
 * 
 * @example
 * <TodoItem todo={todoData} onToggle={handleToggle} />
 */
export const TodoItem: FC<TodoItemProps> = function TodoItem({ todo, onToggle }) {
  const handleToggle = () => {
    onToggle(todo.id, todo.completed)
  }

  return (
    <Pressable
      style={styles.container}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={`${todo.description}. ${todo.completed ? "Completed" : "Not completed"}`}
      accessibilityHint="Double tap to toggle completion status"
    >
      <View style={styles.content}>
        {/* Checkbox */}
        <Checkbox
          value={todo.completed}
          onValueChange={() => handleToggle()}
          inputOuterStyle={styles.checkboxOuter}
          inputInnerStyle={styles.checkboxInner}
          inputDetailStyle={styles.checkboxDetail}
        />

        {/* Description */}
        <Text
          style={[
            styles.description,
            todo.completed && styles.descriptionCompleted,
          ]}
        >
          {todo.description}
        </Text>
      </View>
    </Pressable>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
  },
  checkboxInner: {
    borderRadius: theme.radius.xs,
  },
  checkboxDetail: {
    width: 16,
    height: 16,
  },
  description: {
    flex: 1,
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.base,
    lineHeight: theme.typography.lineHeights.base,
  },
  descriptionCompleted: {
    color: theme.colors.foregroundSecondary,
    textDecorationLine: "line-through",
  },
}))
