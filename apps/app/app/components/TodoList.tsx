/**
 * TodoList Component
 *
 * FlatList wrapper for rendering todo items with loading and empty states.
 * Efficiently renders TodoItem components using FlatList virtualization.
 *
 * @example
 * ```tsx
 * import { TodoList } from "@/components"
 * import { useTodos, useTodoMutations } from "@/hooks"
 *
 * function TodoScreen() {
 *   const { data: todos, isLoading } = useTodos()
 *   const { toggleTodo, updateTodo, deleteTodo } = useTodoMutations()
 *
 *   return (
 *     <TodoList
 *       todos={todos ?? []}
 *       isLoading={isLoading}
 *       onToggle={(id) => toggleTodo.mutate(id)}
 *       onUpdate={(id, title) => updateTodo.mutate({ id, title })}
 *       onDelete={(id) => deleteTodo.mutate(id)}
 *     />
 *   )
 * }
 * ```
 *
 * Validates: Requirements 2.1, 2.2
 */

import { useCallback } from "react"
import type { ListRenderItemInfo, ViewStyle } from "react-native"
import { FlatList, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import type { TodoRow } from "@/types/todo"

import { EmptyState } from "./EmptyState"
import { Spinner } from "./Spinner"
import { TodoItem } from "./TodoItem"

// =============================================================================
// TYPES
// =============================================================================

export interface TodoListProps {
  /**
   * Array of todo items to display
   * Requirement 2.1: Display all Todo_Items when application starts
   */
  todos: TodoRow[]
  /**
   * Whether the list is currently loading
   */
  isLoading?: boolean
  /**
   * Callback when a todo's completion status is toggled
   */
  onToggle: (id: string) => void
  /**
   * Callback when a todo's title is updated
   */
  onUpdate: (id: string, title: string) => void
  /**
   * Callback when a todo is deleted
   */
  onDelete: (id: string) => void
  /**
   * Container style override
   */
  style?: ViewStyle
  /**
   * Content container style override
   */
  contentContainerStyle?: ViewStyle
  /**
   * Test ID for testing
   */
  testID?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TodoList - FlatList wrapper for rendering todos
 *
 * Features:
 * - Shows EmptyState when list is empty - Requirement 2.2
 * - Shows loading state while fetching
 * - Renders TodoItem for each todo - Requirement 2.1
 * - Efficient virtualized list rendering
 */
export function TodoList({
  todos,
  isLoading = false,
  onToggle,
  onUpdate,
  onDelete,
  style,
  contentContainerStyle,
  testID,
}: TodoListProps) {
  /**
   * Extract unique key for each todo item
   */
  const keyExtractor = useCallback((item: TodoRow) => item.id, [])

  /**
   * Render individual todo item
   * Requirement 2.1: Display all Todo_Items
   */
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TodoRow>) => (
      <TodoItem
        todo={item}
        onToggle={() => onToggle(item.id)}
        onUpdate={(title) => onUpdate(item.id, title)}
        onDelete={() => onDelete(item.id)}
        testID={testID ? `${testID}-item-${item.id}` : undefined}
      />
    ),
    [onToggle, onUpdate, onDelete, testID],
  )

  /**
   * Render empty state when no todos exist
   * Requirement 2.2: Display empty state message when Task_List is empty
   */
  const renderEmptyComponent = useCallback(() => {
    // Don't show empty state while loading
    if (isLoading) {
      return null
    }

    return (
      <EmptyState
        icon="check"
        headingTx="todoScreen:emptyHeading"
        contentTx="todoScreen:emptyContent"
        style={styles.emptyState}
      />
    )
  }, [isLoading])

  // Show loading spinner while fetching initial data
  if (isLoading && todos.length === 0) {
    return (
      <View
        style={[styles.loadingContainer, style]}
        testID={testID ? `${testID}-loading` : undefined}
      >
        <Spinner size="lg" />
      </View>
    )
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      style={[styles.list, style]}
      contentContainerStyle={[
        styles.contentContainer,
        todos.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      testID={testID}
    />
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["2xl"],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
  },
}))
