/**
 * TodoItem Component
 *
 * Individual todo item display with edit/delete capabilities.
 * Supports toggling completion, inline editing, and deletion.
 *
 * @example
 * ```tsx
 * import { TodoItem } from "@/components"
 *
 * function TodoList() {
 *   const { toggleTodo, updateTodo, deleteTodo } = useTodoMutations()
 *
 *   return (
 *     <TodoItem
 *       todo={todo}
 *       onToggle={() => toggleTodo.mutate(todo.id)}
 *       onUpdate={(title) => updateTodo.mutate({ id: todo.id, title })}
 *       onDelete={() => deleteTodo.mutate(todo.id)}
 *     />
 *   )
 * }
 * ```
 *
 * Validates: Requirements 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2
 */

import { useCallback, useRef, useState } from "react"
import type { TextInput as RNTextInput, ViewStyle } from "react-native"
import { View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import type { TodoRow } from "@/types/todo"

import { IconButton } from "./IconButton"
import { Text } from "./Text"
import { TextField } from "./TextField"
import { Checkbox } from "./Toggle"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoItemProps {
  /**
   * The todo item to display
   */
  todo: TodoRow
  /**
   * Callback when completion status is toggled
   * Requirement 3.1: Toggle completion status when user taps Todo_Item
   */
  onToggle: () => void
  /**
   * Callback when todo title is updated with valid text
   * Requirement 4.2: Update Todo_Item with new description when saved with valid text
   */
  onUpdate: (title: string) => void
  /**
   * Callback when todo is deleted
   * Requirement 5.1: Remove Todo_Item when delete action performed
   */
  onDelete: () => void
  /**
   * Whether the item is disabled (e.g., during mutation)
   */
  disabled?: boolean
  /**
   * Container style override
   */
  style?: ViewStyle
  /**
   * Test ID for testing
   */
  testID?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TodoItem - Individual todo item display with edit/delete capabilities
 *
 * Features:
 * - Tap checkbox to toggle completion - Requirement 3.1
 * - Visual strikethrough for completed items - Requirement 3.2
 * - Long press or edit button to enter edit mode - Requirement 4.1
 * - Validates edits (rejects whitespace-only) - Requirement 4.3
 * - Cancel edit restores original description - Requirement 4.4
 * - Delete button to remove todo - Requirement 5.1
 */
export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
  style,
  testID,
}: TodoItemProps) {
  const { theme } = useUnistyles()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const inputRef = useRef<RNTextInput>(null)

  /**
   * Validates that input is not empty or whitespace-only
   * Requirement 4.3: Prevent update when edited text is whitespace-only
   */
  const isValidInput = useCallback((input: string): boolean => {
    return input.trim().length > 0
  }, [])

  /**
   * Enter edit mode
   * Requirement 4.1: Allow user to modify task description in edit mode
   */
  const handleStartEdit = useCallback(() => {
    if (disabled) return
    setEditValue(todo.title)
    setIsEditing(true)
    // Focus the input after state update
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [todo.title, disabled])

  /**
   * Save edited todo
   * Requirement 4.2: Update Todo_Item with new description when saved with valid text
   * Requirement 4.3: Prevent update when edited text is whitespace-only
   */
  const handleSaveEdit = useCallback(() => {
    const trimmedValue = editValue.trim()
    if (isValidInput(editValue)) {
      onUpdate(trimmedValue)
      setIsEditing(false)
    }
    // If invalid, stay in edit mode (requirement 4.3)
  }, [editValue, isValidInput, onUpdate])

  /**
   * Cancel edit and restore original description
   * Requirement 4.4: Discard changes and restore original description on cancel
   */
  const handleCancelEdit = useCallback(() => {
    setEditValue(todo.title)
    setIsEditing(false)
  }, [todo.title])

  /**
   * Handle toggle completion
   * Requirement 3.1: Toggle completion status when user taps Todo_Item
   */
  const handleToggle = useCallback(() => {
    if (disabled || isEditing) return
    onToggle()
  }, [disabled, isEditing, onToggle])

  /**
   * Handle delete
   * Requirement 5.1: Remove Todo_Item when delete action performed
   */
  const handleDelete = useCallback(() => {
    if (disabled) return
    onDelete()
  }, [disabled, onDelete])

  /**
   * Handle submit editing (Enter key)
   */
  const handleSubmitEditing = useCallback(() => {
    handleSaveEdit()
  }, [handleSaveEdit])

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Checkbox for completion status - Requirement 3.1 */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={todo.completed}
          onValueChange={handleToggle}
          editable={!disabled && !isEditing}
          testID={testID ? `${testID}-checkbox` : undefined}
        />
      </View>

      {/* Content area - either display or edit mode */}
      <View style={styles.contentContainer}>
        {isEditing ? (
          // Edit mode - Requirement 4.1
          <View style={styles.editContainer}>
            <TextField
              ref={inputRef}
              value={editValue}
              onChangeText={setEditValue}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="done"
              autoCapitalize="sentences"
              autoCorrect
              editable={!disabled}
              containerStyle={styles.editTextField}
              size="sm"
              testID={testID ? `${testID}-input` : undefined}
            />
            <View style={styles.editActions}>
              <IconButton
                icon="checkmark"
                variant="ghost"
                size="sm"
                onPress={handleSaveEdit}
                disabled={!isValidInput(editValue)}
                iconColor={theme.colors.success}
                testID={testID ? `${testID}-save` : undefined}
              />
              <IconButton
                icon="close"
                variant="ghost"
                size="sm"
                onPress={handleCancelEdit}
                iconColor={theme.colors.foregroundSecondary}
                testID={testID ? `${testID}-cancel` : undefined}
              />
            </View>
          </View>
        ) : (
          // Display mode - Requirement 2.3
          <View style={styles.displayContainer}>
            <Text
              style={[
                styles.title,
                // Strikethrough for completed items - Requirement 3.2
                todo.completed && styles.titleCompleted,
              ]}
              numberOfLines={2}
              onLongPress={handleStartEdit}
              testID={testID ? `${testID}-title` : undefined}
            >
              {todo.title}
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {!isEditing && (
        <View style={styles.actionsContainer}>
          {/* Edit button - Requirement 4.1 */}
          <IconButton
            icon="pencil"
            variant="ghost"
            size="sm"
            onPress={handleStartEdit}
            disabled={disabled}
            iconColor={theme.colors.foregroundSecondary}
            testID={testID ? `${testID}-edit` : undefined}
          />
          {/* Delete button - Requirement 5.1 */}
          <IconButton
            icon="trash-outline"
            variant="ghost"
            size="sm"
            onPress={handleDelete}
            disabled={disabled}
            iconColor={theme.colors.error}
            testID={testID ? `${testID}-delete` : undefined}
          />
        </View>
      )}
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
    minHeight: 56,
  },
  checkboxContainer: {
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  displayContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.foreground,
    lineHeight: theme.typography.sizes.base * 1.4,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: theme.colors.foregroundTertiary,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  editTextField: {
    flex: 1,
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.spacing.sm,
  },
}))
