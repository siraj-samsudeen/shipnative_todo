/**
 * useTodos Hook Tests
 *
 * Unit tests for the todo management hooks (useTodos and useTodoMutations).
 * Tests cover CRUD operations and validation logic.
 *
 * **Validates: Requirements 1.1, 1.2, 3.1, 4.2, 4.3, 5.1**
 */

import { renderHook, act, waitFor } from "@testing-library/react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { useTodos, useTodoMutations, todoKeys } from "../useTodos"
import type { TodoRow } from "../../types/todo"

// ============================================================================
// Mocks
// ============================================================================

// Mock user ID for authenticated user
const mockUserId = "test-user-123"

// Mock useAuth hook
jest.mock("../useAppAuth", () => ({
  useAuth: jest.fn(() => ({
    userId: mockUserId,
    isAuthenticated: true,
  })),
}))

// Track mock calls
const mockCalls = {
  from: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  order: jest.fn(),
  single: jest.fn(),
}

// Mock response data
let mockQueryResponse: { data: TodoRow[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
}
let mockSingleResponse: { data: TodoRow | null; error: { message: string } | null } = {
  data: null,
  error: null,
}
let mockInsertResponse: { data: TodoRow | null; error: { message: string } | null } = {
  data: null,
  error: null,
}
let mockUpdateResponse: { data: TodoRow | null; error: { message: string } | null } = {
  data: null,
  error: null,
}
let mockDeleteResponse: { data: null; error: { message: string } | null } = {
  data: null,
  error: null,
}

// Mock Supabase client with proper chaining
jest.mock("../../services/supabase", () => ({
  supabase: {
    from: (table: string) => {
      mockCalls.from(table)
      return {
        select: (columns?: string) => {
          mockCalls.select(columns)
          return {
            eq: (column: string, value: string) => {
              mockCalls.eq(column, value)
              return {
                order: (col: string, options?: { ascending: boolean }) => {
                  mockCalls.order(col, options)
                  return Promise.resolve(mockQueryResponse)
                },
                single: () => {
                  mockCalls.single()
                  return Promise.resolve(mockSingleResponse)
                },
              }
            },
          }
        },
        insert: (data: unknown) => {
          mockCalls.insert(data)
          return {
            select: () => ({
              single: () => {
                mockCalls.single()
                return Promise.resolve(mockInsertResponse)
              },
            }),
          }
        },
        update: (data: unknown) => {
          mockCalls.update(data)
          return {
            eq: (column: string, value: string) => {
              mockCalls.eq(column, value)
              return {
                select: () => ({
                  single: () => {
                    mockCalls.single()
                    return Promise.resolve(mockUpdateResponse)
                  },
                }),
              }
            },
          }
        },
        delete: () => {
          mockCalls.delete()
          return {
            eq: (column: string, value: string) => {
              mockCalls.eq(column, value)
              return Promise.resolve(mockDeleteResponse)
            },
          }
        },
      }
    },
  },
}))

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Creates a test wrapper with QueryClientProvider
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

/**
 * Creates a mock todo item
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
 * Resets all mock responses to defaults
 */
function resetMockResponses() {
  mockQueryResponse = { data: [], error: null }
  mockSingleResponse = { data: null, error: null }
  mockInsertResponse = { data: null, error: null }
  mockUpdateResponse = { data: null, error: null }
  mockDeleteResponse = { data: null, error: null }
}

// ============================================================================
// Tests
// ============================================================================

describe("useTodos", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetMockResponses()
  })

  describe("useTodos query hook", () => {
    /**
     * Test: useTodos returns todos for authenticated user
     * **Validates: Requirement 2.1**
     */
    it("should return todos for authenticated user", async () => {
      const mockTodos = [
        createMockTodo({ id: "1", title: "First Todo" }),
        createMockTodo({ id: "2", title: "Second Todo" }),
      ]
      mockQueryResponse = { data: mockTodos, error: null }

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockTodos)
      expect(mockCalls.from).toHaveBeenCalledWith("todos")
    })

    it("should return empty array when no todos exist", async () => {
      mockQueryResponse = { data: [], error: null }

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
    })

    it("should handle query errors", async () => {
      mockQueryResponse = { data: null, error: { message: "Database error" } }

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe("Database error")
    })
  })

  describe("addTodo mutation", () => {
    /**
     * Test: addTodo with valid input creates todo
     * **Validates: Requirement 1.1**
     */
    it("should create todo with valid input", async () => {
      const newTodo = createMockTodo({ title: "New Todo" })
      mockInsertResponse = { data: newTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.addTodo.mutateAsync("New Todo")
      })

      expect(mockCalls.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        title: "New Todo",
        completed: false,
      })
    })

    /**
     * Test: addTodo trims whitespace from input
     * **Validates: Requirement 1.1**
     */
    it("should trim whitespace from valid input", async () => {
      const newTodo = createMockTodo({ title: "Trimmed Todo" })
      mockInsertResponse = { data: newTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.addTodo.mutateAsync("  Trimmed Todo  ")
      })

      expect(mockCalls.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        title: "Trimmed Todo",
        completed: false,
      })
    })

    /**
     * Test: addTodo with whitespace-only is rejected
     * **Validates: Requirement 1.2**
     */
    it("should reject whitespace-only input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.addTodo.mutateAsync("   ")
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.insert).not.toHaveBeenCalled()
    })

    /**
     * Test: addTodo with empty string is rejected
     * **Validates: Requirement 1.2**
     */
    it("should reject empty string input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.addTodo.mutateAsync("")
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.insert).not.toHaveBeenCalled()
    })

    /**
     * Test: addTodo with tabs and newlines only is rejected
     * **Validates: Requirement 1.2**
     */
    it("should reject tabs and newlines only input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.addTodo.mutateAsync("\t\n\r")
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.insert).not.toHaveBeenCalled()
    })
  })

  describe("toggleTodo mutation", () => {
    /**
     * Test: toggleTodo flips completion status from false to true
     * **Validates: Requirement 3.1**
     */
    it("should toggle completion status from false to true", async () => {
      const existingTodo = createMockTodo({ id: "toggle-1", completed: false })
      const toggledTodo = { ...existingTodo, completed: true }

      // Mock the fetch to get current todo
      mockSingleResponse = { data: existingTodo, error: null }
      // Mock the update response
      mockUpdateResponse = { data: toggledTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const updatedTodo = await result.current.toggleTodo.mutateAsync("toggle-1")
        expect(updatedTodo.completed).toBe(true)
      })

      expect(mockCalls.update).toHaveBeenCalledWith({ completed: true })
    })

    /**
     * Test: toggleTodo flips completion status from true to false
     * **Validates: Requirement 3.1**
     */
    it("should toggle completion status from true to false", async () => {
      const existingTodo = createMockTodo({ id: "toggle-2", completed: true })
      const toggledTodo = { ...existingTodo, completed: false }

      mockSingleResponse = { data: existingTodo, error: null }
      mockUpdateResponse = { data: toggledTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const updatedTodo = await result.current.toggleTodo.mutateAsync("toggle-2")
        expect(updatedTodo.completed).toBe(false)
      })

      expect(mockCalls.update).toHaveBeenCalledWith({ completed: false })
    })

    /**
     * Test: Double toggle returns to original state (idempotence)
     * **Validates: Property 2 - Toggle Idempotence**
     */
    it("should return to original state after double toggle", async () => {
      const originalTodo = createMockTodo({ id: "toggle-3", completed: false })
      let currentCompleted = originalTodo.completed

      // Create a wrapper that creates a fresh QueryClient for this test
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
          mutations: { retry: false },
        },
      })

      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: TestWrapper,
      })

      // First toggle: false -> true
      mockSingleResponse = { data: { ...originalTodo, completed: currentCompleted }, error: null }
      mockUpdateResponse = { data: { ...originalTodo, completed: true }, error: null }

      await act(async () => {
        const firstToggle = await result.current.toggleTodo.mutateAsync("toggle-3")
        expect(firstToggle.completed).toBe(true)
        currentCompleted = true
      })

      // Second toggle: true -> false (back to original)
      mockSingleResponse = { data: { ...originalTodo, completed: currentCompleted }, error: null }
      mockUpdateResponse = { data: { ...originalTodo, completed: false }, error: null }

      await act(async () => {
        const secondToggle = await result.current.toggleTodo.mutateAsync("toggle-3")
        expect(secondToggle.completed).toBe(false)
      })
    })
  })

  describe("updateTodo mutation", () => {
    /**
     * Test: updateTodo with valid input updates title
     * **Validates: Requirement 4.2**
     */
    it("should update todo title with valid input", async () => {
      const existingTodo = createMockTodo({ id: "update-1", title: "Original Title" })
      const updatedTodo = { ...existingTodo, title: "Updated Title" }
      mockUpdateResponse = { data: updatedTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const todo = await result.current.updateTodo.mutateAsync({
          id: "update-1",
          title: "Updated Title",
        })
        expect(todo.title).toBe("Updated Title")
      })

      expect(mockCalls.update).toHaveBeenCalledWith({ title: "Updated Title" })
    })

    /**
     * Test: updateTodo trims whitespace from input
     * **Validates: Requirement 4.2**
     */
    it("should trim whitespace from valid update input", async () => {
      const existingTodo = createMockTodo({ id: "update-2", title: "Original" })
      const updatedTodo = { ...existingTodo, title: "Trimmed Update" }
      mockUpdateResponse = { data: updatedTodo, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.updateTodo.mutateAsync({
          id: "update-2",
          title: "  Trimmed Update  ",
        })
      })

      expect(mockCalls.update).toHaveBeenCalledWith({ title: "Trimmed Update" })
    })

    /**
     * Test: updateTodo with whitespace-only is rejected
     * **Validates: Requirement 4.3**
     */
    it("should reject whitespace-only update input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.updateTodo.mutateAsync({
            id: "update-3",
            title: "   ",
          })
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.update).not.toHaveBeenCalled()
    })

    /**
     * Test: updateTodo with empty string is rejected
     * **Validates: Requirement 4.3**
     */
    it("should reject empty string update input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.updateTodo.mutateAsync({
            id: "update-4",
            title: "",
          })
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.update).not.toHaveBeenCalled()
    })

    /**
     * Test: updateTodo with tabs and newlines only is rejected
     * **Validates: Requirement 4.3**
     */
    it("should reject tabs and newlines only update input", async () => {
      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.updateTodo.mutateAsync({
            id: "update-5",
            title: "\t\n\r",
          })
        }),
      ).rejects.toThrow("Todo title cannot be empty or whitespace only")

      expect(mockCalls.update).not.toHaveBeenCalled()
    })
  })

  describe("deleteTodo mutation", () => {
    /**
     * Test: deleteTodo removes todo from list
     * **Validates: Requirement 5.1**
     */
    it("should delete todo successfully", async () => {
      mockDeleteResponse = { data: null, error: null }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.deleteTodo.mutateAsync("delete-1")
      })

      expect(mockCalls.from).toHaveBeenCalledWith("todos")
      expect(mockCalls.delete).toHaveBeenCalled()
      expect(mockCalls.eq).toHaveBeenCalledWith("id", "delete-1")
    })

    /**
     * Test: deleteTodo handles errors gracefully
     * **Validates: Requirement 5.1**
     */
    it("should handle delete errors", async () => {
      mockDeleteResponse = { data: null, error: { message: "Delete failed" } }

      const { result } = renderHook(() => useTodoMutations(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.deleteTodo.mutateAsync("delete-2")
        }),
      ).rejects.toThrow("Delete failed")
    })
  })

  describe("todoKeys factory", () => {
    it("should generate correct query keys", () => {
      expect(todoKeys.all).toEqual(["todos"])
      expect(todoKeys.lists()).toEqual(["todos", "list"])
      expect(todoKeys.list("user-123")).toEqual(["todos", "list", "user-123"])
      expect(todoKeys.details()).toEqual(["todos", "detail"])
      expect(todoKeys.detail("todo-456")).toEqual(["todos", "detail", "todo-456"])
    })
  })
})
