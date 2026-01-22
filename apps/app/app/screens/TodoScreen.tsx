import { FC, useState } from "react"
import { FlatList, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button, EmptyState, Screen, Spinner, Text, TextField, TodoItem } from "@/components"
import { useAddTodo, useTodos } from "@/hooks"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { Todo } from "@/types/todo"

// =============================================================================
// TYPES
// =============================================================================

interface TodoScreenProps extends AppStackScreenProps<"Main"> {}

// =============================================================================
// COMPONENT
// =============================================================================

export const TodoScreen: FC<TodoScreenProps> = function TodoScreen(_props) {
  const { theme } = useUnistyles()
  const [inputText, setInputText] = useState("")
  
  // Fetch todos
  const { data: todos = [], isLoading, error } = useTodos()
  
  // Add todo mutation
  const addTodo = useAddTodo()

  const handleAddTodo = async () => {
    if (!inputText.trim()) return
    
    try {
      await addTodo.mutateAsync(inputText)
      setInputText("") // Clear input after successful add
    } catch (err) {
      // Error is already logged by the hook
      console.error("Failed to add todo:", err)
    }
  }

  const hasTodos = todos.length > 0

  const renderTodoItem = ({ item }: { item: Todo }) => <TodoItem todo={item} />

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <Spinner size="lg" />
          <Text tx="todoScreen:loading" style={styles.loadingText} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text tx="todoScreen:errorNetwork" color="error" style={styles.errorText} />
        </View>
      )
    }

    return (
      <View style={styles.centerContent}>
        <EmptyState
          headingTx="todoScreen:emptyHeading"
          contentTx="todoScreen:emptyContent"
          icon="components"
        />
      </View>
    )
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={styles.container}
      safeAreaEdges={["top"]}
      backgroundColor={theme.colors.background}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text preset="heading" tx="todoScreen:title" style={styles.title} />
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextField
          value={inputText}
          onChangeText={setInputText}
          placeholderTx="todoScreen:inputPlaceholder"
          containerStyle={styles.inputContainer}
          clearable
          onClear={() => setInputText("")}
          onSubmitEditing={handleAddTodo}
          returnKeyType="done"
          editable={!addTodo.isPending}
        />
        <Button
          tx="todoScreen:addButton"
          onPress={handleAddTodo}
          disabled={!inputText.trim() || addTodo.isPending}
          loading={addTodo.isPending}
          style={styles.addButton}
        />
      </View>

      {/* Todo List */}
      {hasTodos ? (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </Screen>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    letterSpacing: -0.5,
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flex: 1,
  },
  addButton: {
    marginTop: 0,
    minWidth: 80,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["2xl"],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.foregroundSecondary,
  },
  errorText: {
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
}))
