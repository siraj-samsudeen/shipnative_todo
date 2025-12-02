import { ActivityIndicator, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type Sizes = "sm" | "md" | "lg"
type Colors = "primary" | "secondary" | "white"

export interface SpinnerProps {
  /**
   * Spinner size
   */
  size?: Sizes
  /**
   * Spinner color
   */
  color?: Colors
  /**
   * Optional loading text
   */
  text?: string
  /**
   * Full screen overlay mode
   */
  fullScreen?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Loading spinner component with optional text.
 *
 * @example
 * // Basic spinner
 * <Spinner />
 *
 * // Large spinner with text
 * <Spinner size="lg" text="Loading..." />
 *
 * // Full screen overlay
 * <Spinner fullScreen text="Please wait..." />
 *
 * // White spinner (for dark backgrounds)
 * <Spinner color="white" />
 */
export function Spinner(props: SpinnerProps) {
  const { size = "md", color = "primary", text, fullScreen = false } = props

  const { theme } = useUnistyles()

  const spinnerColor = {
    primary: theme.colors.foreground,
    secondary: theme.colors.foregroundSecondary,
    white: theme.colors.palette.white,
  }[color]

  const spinnerSize = {
    sm: "small" as const,
    md: "small" as const,
    lg: "large" as const,
  }[size]

  // Apply variants
  styles.useVariants({ size, fullScreen: fullScreen ? "true" : "false" })

  const content = (
    <View style={styles.container}>
      <ActivityIndicator size={spinnerSize} color={spinnerColor} />
      {text && (
        <Text size="sm" color="secondary" style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  )

  if (fullScreen) {
    return <View style={styles.overlay}>{content}</View>
  }

  return content
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...theme.shadows.none,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        sm: {
          padding: theme.spacing.xs,
        },
        md: {
          padding: theme.spacing.md,
        },
        lg: {
          padding: theme.spacing.lg,
        },
      },
      fullScreen: {
        true: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.xl,
          ...theme.shadows.xl,
        },
        false: {},
      },
    },
  },
  text: {
    marginTop: theme.spacing.sm,
    variants: {
      size: {
        sm: {},
        md: {},
        lg: {},
      },
      fullScreen: {
        true: {},
        false: {},
      },
    },
  },
}))
