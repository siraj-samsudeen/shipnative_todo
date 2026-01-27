/**
 * TodoInput Component
 *
 * Text input for adding new todo items with validation.
 * Validates input (rejects whitespace-only), clears on successful add,
 * and supports Enter key submission.
 *
 * @example
 * ```tsx
 * import { TodoInput } from "@/components"
 *
 * function TodoScreen() {
 *   const { addTodo } = useTodoMutations()
 *
 *   const handleAdd = async (title: string) => {
 *     await addTodo.mutateAsync(title)
 *   }
 *
 *   return <TodoInput onAdd={handleAdd} />
 * }
 * ```
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import type { TextInput as RNTextInput, ViewStyle } from "react-native"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "./Button"
import { TextField } from "./TextField"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoInputProps {
  /**
   * Callback when a valid todo is submitted
   * Called with the trimmed title string
   */
  onAdd: (title: string) => void | Promise<void>
  /**
   * Whether the input is disabled (e.g., during submission)
   */
  disabled?: boolean
  /**
   * Whether the add operation is in progress
   */
  isLoading?: boolean
  /**
   * Container style override
   */
  style?: ViewStyle
}

export interface TodoInputRef {
  /**
   * Focus the input field
   */
  focus: () => void
  /**
   * Clear the input field
   */
  clear: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TodoInput - Text input for adding new todos
 *
 * Features:
 * - Validates input (rejects whitespace-only) - Requirement 1.2
 * - Clears input and maintains focus after successful add - Requirement 1.3
 * - Supports Enter key submission - Requirement 1.1
 * - Uses translation keys for placeholder
 */
export const TodoInput = forwardRef<TodoInputRef, TodoInputProps>(function TodoInput(
  { onAdd, disabled = false, isLoading = false, style },
  ref,
) {
  const [value, setValue] = useState("")
  const inputRef = useRef<RNTextInput>(null)

  /**
   * Validates that input is not empty or whitespace-only
   * Requirement 1.2: Prevent addition when input is whitespace-only
   */
  const isValidInput = useCallback((input: string): boolean => {
    return input.trim().length > 0
  }, [])

  /**
   * Handle submission of the todo
   * Requirement 1.1: Create new Todo_Item when user types and presses Enter/add button
   * Requirement 1.3: Clear input field and focus it after new Todo_Item is added
   */
  const handleSubmit = useCallback(async () => {
    if (!isValidInput(value) || disabled || isLoading) {
      return
    }

    try {
      await onAdd(value.trim())
      // Clear input after successful add - Requirement 1.3
      setValue("")
      // Maintain focus for next entry - Requirement 1.3
      inputRef.current?.focus()
    } catch {
      // Keep the value if submission fails so user can retry
      // Focus is maintained for correction
      inputRef.current?.focus()
    }
  }, [value, onAdd, disabled, isLoading, isValidInput])

  /**
   * Handle Enter key press for submission
   * Requirement 1.1: Support Enter key submission
   */
  const handleSubmitEditing = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => setValue(""),
    }),
    [],
  )

  const canSubmit = isValidInput(value) && !disabled && !isLoading

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <TextField
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          placeholderTx="todoScreen:inputPlaceholder"
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="done"
          blurOnSubmit={false}
          editable={!disabled && !isLoading}
          autoCapitalize="sentences"
          autoCorrect
          containerStyle={styles.textFieldContainer}
        />
      </View>
      <Button
        tx="todoScreen:addButton"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isLoading}
        size="md"
        style={styles.addButton}
      />
    </View>
  )
})

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  textFieldContainer: {
    flex: 1,
  },
  addButton: {
    marginTop: theme.spacing.xxs,
  },
}))
