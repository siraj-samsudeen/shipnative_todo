/**
 * Todo Flow Integration Tests
 *
 * Tests for complete todo management flows including:
 * - Adding new todos
 * - Marking todos as complete
 * - Editing todo titles
 * - Deleting todos
 * - Empty state display
 * - Loading state display
 *
 * **Validates: Requirements 1.1, 2.1, 2.2, 3.1, 4.2, 5.1**
 */

import { render, fireEvent, waitFor, act } from "@testing-library/react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import type { TodoRow } from "../../types/todo"

// ============================================================================
// Mocks - Must be defined before imports
// ============================================================================

// Mock Supabase service
const mockSupabaseFrom = jest.fn()
jest.mock("../../services/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  },
}))

// Mock useAuth hook
const mockUserId = "test-user-123"
jest.mock("../../hooks/useAppAuth", () => ({
  useAuth: () => ({
    userId: mockUserId,
    isAuthenticated: true,
    user: { id: mockUserId, email: "test@example.com" },
  }),
}))

// Mock the entire hooks module to avoid Convex import issues
jest.mock("../../hooks", () => {
  const actualUseTodos = jest.requireActual("../../hooks/useTodos")
  return {
    ...actualUseTodos,
    useAuth: () => ({
      userId: "test-user-123",
      isAuthenticated: true,
      user: { id: "test-user-123", email: "test@example.com" },
    }),
  }
})

// Mock the entire components index to avoid import chain issues
jest.mock("../../components", () => {
  const React = require("react")
  const { View, Text, TouchableOpacity, TextInput, FlatList } = require("react-native")

  // Store for tracking state across component instances
  const componentState = {
    inputValue: "",
    editingId: null as string | null,
    editValue: "",
  }

  return {
    Screen: ({ children }: { children: React.ReactNode }) => (
      <View testID="screen">{children}</View>
    ),
    Text: ({ children, tx, style, preset, ...props }: any) => (
      <Text style={style} {...props}>
        {tx ? `translated:${tx}` : children}
      </Text>
    ),
    Button: ({ tx, onPress, disabled, loading, ...props }: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} {...props}>
        <Text>{tx ? `translated:${tx}` : "Button"}</Text>
      </TouchableOpacity>
    ),
    TextField: React.forwardRef(
      (
        {
          value,
          onChangeText,
          placeholderTx,
          onSubmitEditing,
          editable = true,
          testID,
          containerStyle,
          size,
          ...props
        }: any,
        ref: any,
      ) => (
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholderTx ? `translated:${placeholderTx}` : ""}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          testID={testID}
          {...props}
        />
      ),
    ),
    EmptyState: ({ headingTx, contentTx, style, icon }: any) => (
      <View style={style} testID="empty-state">
        <Text testID="empty-heading">{headingTx ? `translated:${headingTx}` : ""}</Text>
        <Text testID="empty-content">{contentTx ? `translated:${contentTx}` : ""}</Text>
      </View>
    ),
    Spinner: ({ size }: any) => <View testID="spinner" />,
    TodoInput: ({ onAdd, isLoading, style }: any) => {
      const [value, setValue] = React.useState("")

      const handleSubmit = React.useCallback(async () => {
        const trimmed = value.trim()
        if (trimmed.length > 0 && !isLoading) {
          try {
            await onAdd(trimmed)
            setValue("")
          } catch (e) {
            // Keep value on error
          }
        }
      }, [value, isLoading, onAdd])

      return (
        <View style={style} testID="todo-input">
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="translated:todoScreen:inputPlaceholder"
            onSubmitEditing={handleSubmit}
            testID="todo-input-field"
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !value.trim()}
            testID="todo-add-button"
          >
            <Text>translated:todoScreen:addButton</Text>
          </TouchableOpacity>
        </View>
      )
    },
    TodoItem: ({ todo, onToggle, onUpdate, onDelete, disabled, testID }: any) => {
      const [isEditing, setIsEditing] = React.useState(false)
      const [editValue, setEditValue] = React.useState(todo.title)

      // Update editValue when todo.title changes
      React.useEffect(() => {
        if (!isEditing) {
          setEditValue(todo.title)
        }
      }, [todo.title, isEditing])

      const handleSave = React.useCallback(() => {
        const trimmed = editValue.trim()
        if (trimmed.length > 0) {
          onUpdate(trimmed)
          setIsEditing(false)
        }
      }, [editValue, onUpdate])

      const handleCancel = React.useCallback(() => {
        setEditValue(todo.title)
        setIsEditing(false)
      }, [todo.title])

      const handleToggle = React.useCallback(() => {
        if (!disabled && !isEditing) {
          onToggle()
        }
      }, [disabled, isEditing, onToggle])

      const handleStartEdit = React.useCallback(() => {
        if (!disabled) {
          setEditValue(todo.title)
          setIsEditing(true)
        }
      }, [disabled, todo.title])

      const handleDelete = React.useCallback(() => {
        if (!disabled) {
          onDelete()
        }
      }, [disabled, onDelete])

      return (
        <View testID={testID}>
          <TouchableOpacity
            testID={`${testID}-checkbox`}
            onPress={handleToggle}
            accessibilityState={{ checked: todo.completed, disabled: disabled || isEditing }}
          >
            <Text>{todo.completed ? "☑" : "☐"}</Text>
          </TouchableOpacity>

          {isEditing ? (
            <View testID={`${testID}-edit-mode`}>
              <TextInput
                testID={`${testID}-input`}
                value={editValue}
                onChangeText={setEditValue}
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                testID={`${testID}-save`}
                onPress={handleSave}
                disabled={!editValue.trim()}
              >
                <Text>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity testID={`${testID}-cancel`} onPress={handleCancel}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View testID={`${testID}-display-mode`}>
              <Text
                testID={`${testID}-title`}
                style={todo.completed ? { textDecorationLine: "line-through" } : {}}
              >
                {todo.title}
              </Text>
              <TouchableOpacity
                testID={`${testID}-edit`}
                onPress={handleStartEdit}
                disabled={disabled}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID={`${testID}-delete`}
                onPress={handleDelete}
                disabled={disabled}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )
    },
    TodoList: ({
      todos,
      isLoading,
      onToggle,
      onUpdate,
      onDelete,
      style,
      testID,
    }: any) => {
      // Get TodoItem from the same mock
      const components = require("../../components")
      const { TodoItem, Spinner } = components

      if (isLoading && todos.length === 0) {
        return (
          <View testID={`${testID}-loading`}>
            <Spinner size="lg" />
          </View>
        )
      }

      if (todos.length === 0) {
        return (
          <View testID="empty-state">
            <Text testID="empty-heading">translated:todoScreen:emptyHeading</Text>
            <Text testID="empty-content">translated:todoScreen:emptyContent</Text>
          </View>
        )
      }

      return (
        <View testID={testID} style={style}>
          {todos.map((item: any) => (
            <TodoItem
              key={item.id}
              todo={item}
              onToggle={() => onToggle(item.id)}
              onUpdate={(title: string) => onUpdate(item.id, title)}
              onDelete={() => onDelete(item.id)}
              testID={`${testID}-item-${item.id}`}
            />
          ))}
        </View>
      )
    },
  }
})

// Import after mocks are set up
import { TodoScreen } from "../../screens/TodoScreen"

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Creates a mock todo item for testing
 */
function createMockTodo(overrides: Partial<TodoRow> = {}): TodoRow {
  return {
    id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user_id: mockUserId,
    title: "Test Todo",
    completed: false,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Creates a QueryClient for testing with disabled retries
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Wrapper component that provides QueryClient context
 */
function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

/**
 * Helper to set up Supabase mock for fetching todos
 */
function mockSupabaseFetch(todos: TodoRow[]) {
  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === "todos") {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: todos,
              error: null,
            }),
            single: jest.fn().mockResolvedValue({
              data: todos[0] || null,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }
    }
    return {}
  })
}

/**
 * Helper to set up Supabase mock for insert operation
 * Note: This sets up the mock to return the new todo after insert,
 * but the initial fetch should be set up separately with mockSupabaseFetch([])
 */
function mockSupabaseInsert(newTodo: TodoRow, existingTodos: TodoRow[] = []) {
  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === "todos") {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: existingTodos,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: newTodo,
              error: null,
            }),
          }),
        }),
      }
    }
    return {}
  })
}

/**
 * Helper to set up Supabase mock for update operation (including toggle)
 */
function mockSupabaseUpdate(originalTodo: TodoRow, updatedTodo: TodoRow) {
  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === "todos") {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [updatedTodo],
              error: null,
            }),
            single: jest.fn().mockResolvedValue({
              data: originalTodo,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedTodo,
                error: null,
              }),
            }),
          }),
        }),
      }
    }
    return {}
  })
}

/**
 * Helper to set up Supabase mock for delete operation
 */
function mockSupabaseDelete() {
  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === "todos") {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }
    }
    return {}
  })
}

// ============================================================================
// Tests
// ============================================================================

describe("Todo Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Test: Empty state displays when no todos
   * **Validates: Requirement 2.2**
   */
  describe("Empty State Display", () => {
    it("should display empty state when no todos exist", async () => {
      mockSupabaseFetch([])

      const { getByText } = render(<TodoScreen />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(getByText(/translated:todoScreen:emptyHeading/i)).toBeTruthy()
        expect(getByText(/translated:todoScreen:emptyContent/i)).toBeTruthy()
      })
    })
  })

  /**
   * Test: Loading state while fetching
   * **Validates: Requirement 2.1**
   */
  describe("Loading State Display", () => {
    it("should display loading state while fetching todos", async () => {
      // Create a promise that we can control
      let resolvePromise: (value: unknown) => void
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue(fetchPromise),
          }),
        }),
      })

      const { getByTestId } = render(<TodoScreen />, { wrapper: createWrapper() })

      // Loading state should be visible
      await waitFor(() => {
        expect(getByTestId("todo-list-loading")).toBeTruthy()
      })

      // Resolve the fetch
      await act(async () => {
        resolvePromise!({ data: [], error: null })
      })
    })
  })

  /**
   * Test: Display all todos when application starts
   * **Validates: Requirement 2.1**
   */
  describe("Display Todos", () => {
    it("should display all todos when loaded", async () => {
      const mockTodos = [
        createMockTodo({ id: "todo-1", title: "First Todo" }),
        createMockTodo({ id: "todo-2", title: "Second Todo" }),
        createMockTodo({ id: "todo-3", title: "Third Todo" }),
      ]

      mockSupabaseFetch(mockTodos)

      const { getByText } = render(<TodoScreen />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(getByText("First Todo")).toBeTruthy()
        expect(getByText("Second Todo")).toBeTruthy()
        expect(getByText("Third Todo")).toBeTruthy()
      })
    })
  })

  /**
   * Test: Add todo flow
   * **Validates: Requirement 1.1**
   */
  describe("Add Todo Flow", () => {
    it("should add a new todo when user types and submits", async () => {
      const newTodo = createMockTodo({ id: "new-todo-1", title: "Buy groceries" })

      // Start with empty list
      mockSupabaseFetch([])

      const { getByPlaceholderText, getByText, queryByText, rerender } = render(<TodoScreen />, {
        wrapper: createWrapper(),
      })

      // Wait for initial load (empty state)
      await waitFor(() => {
        expect(getByText(/translated:todoScreen:emptyHeading/i)).toBeTruthy()
      })

      // Set up mock for insert - this will be used when the mutation is called
      // After insert, the refetch should return the new todo
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === "todos") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [newTodo],
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: newTodo,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      // Type in the input
      const input = getByPlaceholderText(/translated:todoScreen:inputPlaceholder/i)
      fireEvent.changeText(input, "Buy groceries")

      // Submit the todo
      fireEvent(input, "submitEditing")

      // The todo should appear after the mutation completes and refetch happens
      await waitFor(
        () => {
          expect(queryByText("Buy groceries")).toBeTruthy()
        },
        { timeout: 3000 },
      )
    })

    it("should clear input after successful add", async () => {
      const newTodo = createMockTodo({ id: "new-todo-1", title: "Buy groceries" })

      // Start with empty list
      mockSupabaseFetch([])

      const { getByPlaceholderText, getByText } = render(<TodoScreen />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(getByText(/translated:todoScreen:emptyHeading/i)).toBeTruthy()
      })

      // Set up mock for insert
      mockSupabaseInsert(newTodo, [])

      const input = getByPlaceholderText(/translated:todoScreen:inputPlaceholder/i)
      fireEvent.changeText(input, "Buy groceries")
      fireEvent(input, "submitEditing")

      // Input should be cleared after submission
      await waitFor(() => {
        expect(input.props.value).toBe("")
      })
    })
  })

  /**
   * Test: Mark todo complete flow
   * **Validates: Requirement 3.1**
   */
  describe("Mark Complete Flow", () => {
    it("should toggle completion status when checkbox is pressed", async () => {
      const todo = createMockTodo({ id: "todo-1", title: "Test Todo", completed: false })
      const toggledTodo = { ...todo, completed: true }

      mockSupabaseFetch([todo])

      const { getByTestId } = render(<TodoScreen />, { wrapper: createWrapper() })

      // Wait for todo to appear
      await waitFor(() => {
        expect(getByTestId("todo-list-item-todo-1-checkbox")).toBeTruthy()
      })

      // Set up mock for toggle (update) - pass original todo for the initial fetch
      mockSupabaseUpdate(todo, toggledTodo)

      // Click the checkbox
      const checkbox = getByTestId("todo-list-item-todo-1-checkbox")
      fireEvent.press(checkbox)

      // Checkbox should reflect the toggled state (via optimistic update)
      await waitFor(() => {
        expect(checkbox.props.accessibilityState?.checked).toBe(true)
      })
    })
  })

  /**
   * Test: Edit todo flow
   * **Validates: Requirement 4.2**
   */
  describe("Edit Todo Flow", () => {
    it("should update todo title when edited and saved", async () => {
      const todo = createMockTodo({ id: "todo-1", title: "Original Title" })
      const updatedTodo = { ...todo, title: "Updated Title" }

      mockSupabaseFetch([todo])

      const { getByTestId, getByText } = render(<TodoScreen />, { wrapper: createWrapper() })

      // Wait for todo to appear
      await waitFor(() => {
        expect(getByText("Original Title")).toBeTruthy()
      })

      // Enter edit mode
      const editButton = getByTestId("todo-list-item-todo-1-edit")
      fireEvent.press(editButton)

      // Wait for input to appear
      await waitFor(() => {
        expect(getByTestId("todo-list-item-todo-1-input")).toBeTruthy()
      })

      // Set up mock for update
      mockSupabaseUpdate(todo, updatedTodo)

      // Change the text
      const input = getByTestId("todo-list-item-todo-1-input")
      fireEvent.changeText(input, "Updated Title")

      // Save the edit
      const saveButton = getByTestId("todo-list-item-todo-1-save")
      fireEvent.press(saveButton)

      // Title should be updated (via optimistic update)
      await waitFor(() => {
        expect(getByText("Updated Title")).toBeTruthy()
      })
    })
  })

  /**
   * Test: Delete todo flow
   * **Validates: Requirement 5.1**
   */
  describe("Delete Todo Flow", () => {
    it("should remove todo when delete button is pressed", async () => {
      const todo = createMockTodo({ id: "todo-1", title: "Todo to Delete" })

      mockSupabaseFetch([todo])

      const { getByTestId, getByText, queryByText } = render(<TodoScreen />, {
        wrapper: createWrapper(),
      })

      // Wait for todo to appear
      await waitFor(() => {
        expect(getByText("Todo to Delete")).toBeTruthy()
      })

      // Set up mock for delete
      mockSupabaseDelete()

      // Click delete button
      const deleteButton = getByTestId("todo-list-item-todo-1-delete")
      fireEvent.press(deleteButton)

      // Todo should be removed (via optimistic update)
      await waitFor(() => {
        expect(queryByText("Todo to Delete")).toBeNull()
      })
    })
  })

  /**
   * Test: Full flow - add, complete, edit, delete
   * **Validates: Requirements 1.1, 3.1, 4.2, 5.1**
   */
  describe("Full Todo Flow", () => {
    it("should complete full flow: add, mark complete, edit, delete", async () => {
      // Create a todo for the flow
      const newTodo = createMockTodo({ id: "flow-todo-1", title: "New Task" })

      // Start with empty list
      mockSupabaseFetch([])

      const queryClient = createTestQueryClient()
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(
        <TodoScreen />,
        { wrapper },
      )

      // Step 1: Verify empty state
      await waitFor(() => {
        expect(getByText(/translated:todoScreen:emptyHeading/i)).toBeTruthy()
      })

      // Step 2: Add a new todo - set up mock for insert
      // After insert, the refetch should return the new todo
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === "todos") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [newTodo],
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: newTodo,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const input = getByPlaceholderText(/translated:todoScreen:inputPlaceholder/i)
      fireEvent.changeText(input, "New Task")
      fireEvent(input, "submitEditing")

      // Wait for todo to appear
      await waitFor(
        () => {
          expect(queryByText("New Task")).toBeTruthy()
        },
        { timeout: 3000 },
      )

      // Step 3: Mark as complete
      const toggledTodo = { ...newTodo, completed: true }
      mockSupabaseUpdate(newTodo, toggledTodo)

      const checkbox = getByTestId("todo-list-item-flow-todo-1-checkbox")
      fireEvent.press(checkbox)

      await waitFor(() => {
        expect(checkbox.props.accessibilityState?.checked).toBe(true)
      })

      // Step 4: Edit the todo
      const editButton = getByTestId("todo-list-item-flow-todo-1-edit")
      fireEvent.press(editButton)

      await waitFor(() => {
        expect(getByTestId("todo-list-item-flow-todo-1-input")).toBeTruthy()
      })

      const editedTodo = { ...toggledTodo, title: "Edited Task" }
      mockSupabaseUpdate(toggledTodo, editedTodo)

      const editInput = getByTestId("todo-list-item-flow-todo-1-input")
      fireEvent.changeText(editInput, "Edited Task")

      const saveButton = getByTestId("todo-list-item-flow-todo-1-save")
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(queryByText("Edited Task")).toBeTruthy()
      })

      // Step 5: Delete the todo - set up mock to return empty list after delete
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === "todos") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
        }
        return {}
      })

      const deleteButton = getByTestId("todo-list-item-flow-todo-1-delete")
      fireEvent.press(deleteButton)

      // After delete, the todo should be removed and empty state should show
      await waitFor(
        () => {
          expect(queryByText("Edited Task")).toBeNull()
        },
        { timeout: 3000 },
      )

      // Should show empty state again
      await waitFor(() => {
        expect(getByText(/translated:todoScreen:emptyHeading/i)).toBeTruthy()
      })
    })
  })
})
