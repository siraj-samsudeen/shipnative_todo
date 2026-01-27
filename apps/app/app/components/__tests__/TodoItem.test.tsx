/**
 * TodoItem Component Tests
 *
 * Tests for the TodoItem component covering toggle completion,
 * strikethrough styling, edit mode, and cancel edit behavior.
 *
 * **Validates: Requirements 3.1, 3.2, 4.1, 4.4**
 */

import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { View, Text, TouchableOpacity, TextInput } from "react-native"

import type { TodoRow } from "../../types/todo"

// Mock the Checkbox component to avoid native module issues
jest.mock("../Toggle", () => ({
  Checkbox: ({
    value,
    onValueChange,
    editable = true,
    testID,
  }: {
    value: boolean
    onValueChange: (value: boolean) => void
    editable?: boolean
    testID?: string
  }) => {
    const { TouchableOpacity, View, Text } = require("react-native")
    return (
      <TouchableOpacity
        testID={testID}
        onPress={() => editable && onValueChange(!value)}
        accessibilityState={{ checked: value, disabled: !editable }}
      >
        <View>
          <Text>{value ? "☑" : "☐"}</Text>
        </View>
      </TouchableOpacity>
    )
  },
}))

// Mock the IconButton component
jest.mock("../IconButton", () => ({
  IconButton: ({
    icon,
    onPress,
    disabled,
    testID,
  }: {
    icon: string
    onPress: () => void
    disabled?: boolean
    testID?: string
  }) => {
    const { TouchableOpacity, Text } = require("react-native")
    return (
      <TouchableOpacity testID={testID} onPress={() => !disabled && onPress()} disabled={disabled}>
        <Text>{icon}</Text>
      </TouchableOpacity>
    )
  },
}))

import { TodoItem } from "../TodoItem"

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Creates a mock todo item for testing
 */
function createMockTodo(overrides: Partial<TodoRow> = {}): TodoRow {
  return {
    id: "test-todo-1",
    user_id: "test-user-1",
    title: "Test Todo Item",
    completed: false,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe("TodoItem", () => {
  const defaultProps = {
    onToggle: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Test: Checkbox toggles completion
   * **Validates: Requirement 3.1**
   */
  describe("checkbox toggle completion", () => {
    it("should call onToggle when checkbox is pressed", () => {
      const onToggle = jest.fn()
      const todo = createMockTodo({ completed: false })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onToggle={onToggle} testID="todo-item" />,
      )

      const checkbox = getByTestId("todo-item-checkbox")
      fireEvent(checkbox, "valueChange", true)

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it("should call onToggle for completed todo when checkbox is pressed", () => {
      const onToggle = jest.fn()
      const todo = createMockTodo({ completed: true })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onToggle={onToggle} testID="todo-item" />,
      )

      const checkbox = getByTestId("todo-item-checkbox")
      fireEvent(checkbox, "valueChange", false)

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it("should not call onToggle when disabled", () => {
      const onToggle = jest.fn()
      const todo = createMockTodo()

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onToggle={onToggle} disabled testID="todo-item" />,
      )

      const checkbox = getByTestId("todo-item-checkbox")
      fireEvent(checkbox, "valueChange", true)

      expect(onToggle).not.toHaveBeenCalled()
    })
  })

  /**
   * Test: Completed items show strikethrough styling
   * **Validates: Requirement 3.2**
   */
  describe("completed items strikethrough styling", () => {
    it("should apply strikethrough style to completed todo title", () => {
      const todo = createMockTodo({ completed: true, title: "Completed Task" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      const title = getByTestId("todo-item-title")

      // Check that the title has strikethrough style applied
      // The style is applied as an array with conditional styles
      const styles = title.props.style

      // Helper to recursively find textDecorationLine in nested styles
      const findTextDecoration = (styleObj: unknown): string | undefined => {
        if (!styleObj) return undefined
        if (Array.isArray(styleObj)) {
          for (const s of styleObj) {
            const result = findTextDecoration(s)
            if (result) return result
          }
          return undefined
        }
        if (typeof styleObj === "object" && styleObj !== null) {
          const obj = styleObj as Record<string, unknown>
          if (obj.textDecorationLine) return obj.textDecorationLine as string
        }
        return undefined
      }

      const textDecoration = findTextDecoration(styles)
      expect(textDecoration).toBe("line-through")
    })

    it("should not apply strikethrough style to incomplete todo title", () => {
      const todo = createMockTodo({ completed: false, title: "Incomplete Task" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      const title = getByTestId("todo-item-title")

      // Check that the title does NOT have strikethrough style
      const styles = title.props.style

      // Helper to recursively find textDecorationLine in nested styles
      const findTextDecoration = (styleObj: unknown): string | undefined => {
        if (!styleObj) return undefined
        if (Array.isArray(styleObj)) {
          for (const s of styleObj) {
            const result = findTextDecoration(s)
            if (result) return result
          }
          return undefined
        }
        if (typeof styleObj === "object" && styleObj !== null) {
          const obj = styleObj as Record<string, unknown>
          if (obj.textDecorationLine) return obj.textDecorationLine as string
        }
        return undefined
      }

      const textDecoration = findTextDecoration(styles)
      expect(textDecoration).toBeUndefined()
    })
  })

  /**
   * Test: Edit mode allows text modification
   * **Validates: Requirement 4.1**
   */
  describe("edit mode text modification", () => {
    it("should enter edit mode when edit button is pressed", () => {
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId, queryByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      // Initially, input should not be visible
      expect(queryByTestId("todo-item-input")).toBeNull()

      // Press edit button
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Input should now be visible
      expect(getByTestId("todo-item-input")).toBeTruthy()
    })

    it("should allow text modification in edit mode", async () => {
      const onUpdate = jest.fn()
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onUpdate={onUpdate} testID="todo-item" />,
      )

      // Enter edit mode
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Modify the text
      const input = getByTestId("todo-item-input")
      fireEvent.changeText(input, "Modified Title")

      // Save the edit
      const saveButton = getByTestId("todo-item-save")
      fireEvent.press(saveButton)

      // onUpdate should be called with the new title
      expect(onUpdate).toHaveBeenCalledWith("Modified Title")
    })

    it("should save edit when Enter key is pressed", async () => {
      const onUpdate = jest.fn()
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onUpdate={onUpdate} testID="todo-item" />,
      )

      // Enter edit mode
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Modify the text
      const input = getByTestId("todo-item-input")
      fireEvent.changeText(input, "Modified Title")

      // Press Enter to save
      fireEvent(input, "submitEditing")

      // onUpdate should be called with the new title
      expect(onUpdate).toHaveBeenCalledWith("Modified Title")
    })

    it("should not save edit with whitespace-only input", async () => {
      const onUpdate = jest.fn()
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onUpdate={onUpdate} testID="todo-item" />,
      )

      // Enter edit mode
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Change to whitespace only
      const input = getByTestId("todo-item-input")
      fireEvent.changeText(input, "   ")

      // Try to save
      fireEvent(input, "submitEditing")

      // onUpdate should NOT be called
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  /**
   * Test: Cancel edit restores original text
   * **Validates: Requirement 4.4**
   */
  describe("cancel edit restores original text", () => {
    it("should restore original text when cancel is pressed", async () => {
      const onUpdate = jest.fn()
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId, queryByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onUpdate={onUpdate} testID="todo-item" />,
      )

      // Enter edit mode
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Modify the text
      const input = getByTestId("todo-item-input")
      fireEvent.changeText(input, "Modified Title")

      // Press cancel
      const cancelButton = getByTestId("todo-item-cancel")
      fireEvent.press(cancelButton)

      // Should exit edit mode
      await waitFor(() => {
        expect(queryByTestId("todo-item-input")).toBeNull()
      })

      // onUpdate should NOT be called
      expect(onUpdate).not.toHaveBeenCalled()

      // Title should show original text
      const title = getByTestId("todo-item-title")
      expect(title.props.children).toBe("Original Title")
    })

    it("should discard changes when cancel is pressed after modification", async () => {
      const onUpdate = jest.fn()
      const todo = createMockTodo({ title: "Original Title" })

      const { getByTestId, queryByTestId, rerender } = render(
        <TodoItem {...defaultProps} todo={todo} onUpdate={onUpdate} testID="todo-item" />,
      )

      // Enter edit mode
      const editButton = getByTestId("todo-item-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Modify the text significantly
      const input = getByTestId("todo-item-input")
      fireEvent.changeText(input, "Completely Different Title")

      // Press cancel
      const cancelButton = getByTestId("todo-item-cancel")
      fireEvent.press(cancelButton)

      // Should exit edit mode
      await waitFor(() => {
        expect(queryByTestId("todo-item-input")).toBeNull()
      })

      // onUpdate should NOT be called
      expect(onUpdate).not.toHaveBeenCalled()

      // Re-enter edit mode to verify the value was reset
      const editButton2 = getByTestId("todo-item-edit")
      fireEvent.press(editButton2)

      await waitFor(() => {
        expect(getByTestId("todo-item-input")).toBeTruthy()
      })

      // Input should have original value, not the modified one
      const input2 = getByTestId("todo-item-input")
      expect(input2.props.value).toBe("Original Title")
    })
  })

  /**
   * Test: Delete functionality
   */
  describe("delete functionality", () => {
    it("should call onDelete when delete button is pressed", () => {
      const onDelete = jest.fn()
      const todo = createMockTodo()

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onDelete={onDelete} testID="todo-item" />,
      )

      const deleteButton = getByTestId("todo-item-delete")
      fireEvent.press(deleteButton)

      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it("should not call onDelete when disabled", () => {
      const onDelete = jest.fn()
      const todo = createMockTodo()

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} onDelete={onDelete} disabled testID="todo-item" />,
      )

      const deleteButton = getByTestId("todo-item-delete")
      fireEvent.press(deleteButton)

      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  /**
   * Test: Display mode
   */
  describe("display mode", () => {
    it("should display todo title correctly", () => {
      const todo = createMockTodo({ title: "My Todo Task" })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      const title = getByTestId("todo-item-title")
      expect(title.props.children).toBe("My Todo Task")
    })

    it("should show checkbox as checked for completed todo", () => {
      const todo = createMockTodo({ completed: true })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      const checkbox = getByTestId("todo-item-checkbox")
      // Check accessibility state since we're using a mock
      expect(checkbox.props.accessibilityState?.checked).toBe(true)
    })

    it("should show checkbox as unchecked for incomplete todo", () => {
      const todo = createMockTodo({ completed: false })

      const { getByTestId } = render(
        <TodoItem {...defaultProps} todo={todo} testID="todo-item" />,
      )

      const checkbox = getByTestId("todo-item-checkbox")
      // Check accessibility state since we're using a mock
      expect(checkbox.props.accessibilityState?.checked).toBe(false)
    })
  })
})
