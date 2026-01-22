import { FC } from "react"
import { View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { EmptyState, Screen, Text } from "@/components"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

// =============================================================================
// TYPES
// =============================================================================

interface TodoScreenProps extends AppStackScreenProps<"Main"> {}

// =============================================================================
// COMPONENT
// =============================================================================

export const TodoScreen: FC<TodoScreenProps> = function TodoScreen(_props) {
  const { theme } = useUnistyles()

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={styles.container}
      safeAreaEdges={["top"]}
      backgroundColor={theme.colors.background}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text preset="heading" tx="todoScreen:title" style={styles.title} />
      </View>

      {/* Empty State */}
      <View style={styles.content}>
        <EmptyState
          headingTx="todoScreen:emptyHeading"
          contentTx="todoScreen:emptyContent"
          icon="components"
        />
      </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}))
