import { View } from "react-native"
import type { TOptions } from "i18next"
import { StyleSheet } from "react-native-unistyles"

import { TxKeyPath } from "@/i18n"

import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type Variants = "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info"
type Sizes = "sm" | "md" | "lg"

export interface BadgeProps {
  /**
   * Badge text
   */
  text?: string
  /**
   * i18n translation key for badge text
   */
  tx?: TxKeyPath
  /**
   * i18n translation options
   */
  txOptions?: TOptions
  /**
   * Badge variant/color
   */
  variant?: Variants
  /**
   * Badge size
   */
  size?: Sizes
  /**
   * Show as dot (no text)
   */
  dot?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Badge component for status indicators, counts, or labels.
 *
 * @example
 * // Basic badge
 * <Badge text="New" />
 *
 * // Status badges
 * <Badge text="Active" variant="success" />
 * <Badge text="Pending" variant="warning" />
 * <Badge text="Error" variant="error" />
 *
 * // Dot indicator
 * <Badge dot variant="error" />
 *
 * // Different sizes
 * <Badge text="Small" size="sm" />
 * <Badge text="Large" size="lg" />
 */
export function Badge(props: BadgeProps) {
  const { text, tx, txOptions, variant = "default", size = "md", dot = false } = props

  // Apply variants - map "default" to undefined for Unistyles
  const variantForStyles = variant === "default" ? undefined : variant
  styles.useVariants({ variant: variantForStyles, size, dot: dot ? "true" : "false" })

  if (dot) {
    return <View style={styles.dot} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text} text={text} tx={tx} txOptions={txOptions} />
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.backgroundTertiary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        success: {
          backgroundColor: theme.colors.successBackground,
          borderWidth: 1,
          borderColor: "rgba(34, 197, 94, 0.2)",
        },
        error: {
          backgroundColor: theme.colors.errorBackground,
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.2)",
        },
        warning: {
          backgroundColor: theme.colors.warningBackground,
          borderWidth: 1,
          borderColor: "rgba(245, 158, 11, 0.2)",
        },
        info: {
          backgroundColor: theme.colors.infoBackground,
          borderWidth: 1,
          borderColor: "rgba(59, 130, 246, 0.2)",
        },
      },
      size: {
        sm: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 3,
          borderRadius: theme.radius.full,
        },
        md: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
        },
        lg: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
        },
      },
      dot: {
        true: {},
        false: {},
      },
    },
  },
  text: {
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: 0.3,
    variants: {
      variant: {
        default: {
          color: theme.colors.foreground,
        },
        primary: {
          color: theme.colors.primaryForeground,
        },
        secondary: {
          color: theme.colors.foregroundSecondary,
        },
        success: {
          color: theme.colors.successForeground,
        },
        error: {
          color: theme.colors.errorForeground,
        },
        warning: {
          color: theme.colors.warningForeground,
        },
        info: {
          color: theme.colors.infoForeground,
        },
      },
      size: {
        sm: {
          fontSize: 10,
          lineHeight: 14,
        },
        md: {
          fontSize: 11,
          lineHeight: 15,
        },
        lg: {
          fontSize: 13,
          lineHeight: 18,
        },
      },
      dot: {
        true: {},
        false: {},
      },
    },
  },
  dot: {
    variants: {
      variant: {
        default: {
          backgroundColor: theme.colors.foregroundTertiary,
        },
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.foregroundSecondary,
        },
        success: {
          backgroundColor: theme.colors.success,
        },
        error: {
          backgroundColor: theme.colors.error,
        },
        warning: {
          backgroundColor: theme.colors.warning,
        },
        info: {
          backgroundColor: theme.colors.info,
        },
      },
      size: {
        sm: {
          width: 6,
          height: 6,
          borderRadius: 3,
        },
        md: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        lg: {
          width: 10,
          height: 10,
          borderRadius: 5,
        },
      },
      dot: {
        true: {},
        false: {},
      },
    },
  },
}))
