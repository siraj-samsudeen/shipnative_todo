/**
 * TodoItem Component
 * 
 * Displays a single todo item with description, completion toggle, and edit functionality.
 * Supports inline editing, visual feedback for completed state, and accessibility.
 */

import { FC, useState } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import type { Todo } from "@/types/todo"

import { Checkbox } from "./Toggle"
import { Text } from "./Text"
import { TextField } from "./TextField"
import { IconButton } from "./IconButton"

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
  /**
   * Callback when todo description is updated
   */
  onUpdate: (id: string, description: string) => void
  /**
   * Callback when todo is deleted
   */
  onDelete: (id: string) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Todo item component with completion toggle, inline editing, and delete functionality.
 * 
 * @example
 * <TodoItem 
 *   todo={todoData} 
 *   onToggle={handleToggle}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 * />
 */
export const TodoItem: FC<TodoItemProps> = function TodoItem({ 
  todo, 
  onToggle, 
  onUpdate, 
  onDelete 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.description)

  const handleToggle = () => {
    onToggle(todo.id, todo.completed)
  }

  const handleEditPress = () => {
    setIsEditing(true)
    setEditText(todo.description)
  }

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== todo.description) {
      onUpdate(todo.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(todo.description)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(todo.id)
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${todo.description}. ${todo.completed ? "Completed" : "Not completed"}`}
    >
      <View style={styles.content}>
        {/* Checkbox */}
        <Pressable
          onPress={handleToggle}
          style={styles.checkboxContainer}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: todo.completed }}
          accessibilityLabel="Toggle completion status"
        >
          <Checkbox
            value={todo.completed}
            onValueChange={() => handleToggle()}
            inputOuterStyle={styles.checkboxOuter}
            inputInnerStyle={styles.checkboxInner}
            inputDetailStyle={styles.checkboxDetail}
          />
        </Pressable>

        {/* Description or Edit Field */}
        <View style={styles.descriptionContainer}>
          {isEditing ? (
            <TextField
              value={editText}
              onChangeText={setEditText}
              placeholderTx="todoScreen:inputPlaceholder"
              size="sm"
              style={styles.editInput}
              autoFocus
              onSubmitEditing={handleSave}
              returnKeyType="done"
              blurOnSubmit
            />
          ) : (
            <Pressable onPress={handleEditPress} style={styles.descriptionPressable}>
              <Text
                style={[
                  styles.description,
                  todo.completed && styles.descriptionCompleted,
                ]}
              >
                {todo.description}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <IconButton
                icon="checkmark"
                variant="ghost"
                size="sm"
                onPress={handleSave}
              />
              <IconButton
                icon="close"
                variant="ghost"
                size="sm"
                onPress={handleCancel}
              />
            </>
          ) : (
            <>
              <IconButton
                icon="pencil"
                variant="ghost"
                size="sm"
                onPress={handleEditPress}
              />
              <IconButton
                icon="trash"
                variant="ghost"
                size="sm"
                onPress={handleDelete}
                iconColor={styles.deleteIcon.color}
              />
            </>
          )}
        </View>
      </View>
    </View>
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
  checkboxContainer: {
    padding: theme.spacing.xs,
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
  descriptionContainer: {
    flex: 1,
  },
  descriptionPressable: {
    paddingVertical: theme.spacing.xs,
  },
  description: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.base,
    lineHeight: theme.typography.lineHeights.base,
  },
  descriptionCompleted: {
    color: theme.colors.foregroundSecondary,
    textDecorationLine: "line-through",
  },
  editInput: {
    marginVertical: -theme.spacing.xs,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  deleteIcon: {
    color: theme.colors.error,
  },
}))
