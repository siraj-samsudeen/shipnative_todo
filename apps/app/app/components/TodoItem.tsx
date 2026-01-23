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
  /**
   * Whether the todo item is disabled (read-only mode)
   */
  disabled?: boolean
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
  onDelete,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.description)

  const handleToggle = () => {
    if (disabled) return
    onToggle(todo.id, todo.completed)
  }

  const handleEditPress = () => {
    if (disabled) return
    setIsEditing(true)
    setEditText(todo.description)
  }

  const handleSave = () => {
    if (disabled) return
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
    if (disabled) return
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
          style={[styles.checkboxContainer, disabled && styles.disabledContainer]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: todo.completed, disabled }}
          accessibilityLabel="Toggle completion status"
          disabled={disabled}
        >
          <Checkbox
            value={todo.completed}
            onValueChange={() => handleToggle()}
            inputOuterStyle={styles.checkboxOuter}
            inputInnerStyle={styles.checkboxInner}
            inputDetailStyle={styles.checkboxDetail}
            disabled={disabled}
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
              editable={!disabled}
            />
          ) : (
            <Pressable
              onPress={handleEditPress}
              style={styles.descriptionPressable}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.description,
                  todo.completed && styles.descriptionCompleted,
                  disabled && styles.disabledText,
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
                disabled={disabled}
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
                disabled={disabled}
              />
              <IconButton
                icon="trash"
                variant="ghost"
                size="sm"
                onPress={handleDelete}
                iconColor={disabled ? styles.disabledIcon.color : styles.deleteIcon.color}
                disabled={disabled}
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
  disabledContainer: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  disabledIcon: {
    color: theme.colors.foregroundSecondary,
  },
}))
