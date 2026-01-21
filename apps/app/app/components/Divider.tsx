import type { ViewStyle } from "react-native"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "./Text"

// =============================================================================
// TYPES
// =============================================================================

type Orientations = "horizontal" | "vertical"
type Sizes = "thin" | "default" | "thick"

export interface DividerProps {
  /**
   * Orientation of the divider
   */
  orientation?: Orientations
  /**
   * Divider thickness
   */
  size?: Sizes
  /**
   * Optional label text in the middle
   */
  label?: string
  /**
   * Additional container style
   */
  style?: ViewStyle
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Divider component for separating content sections.
 *
 * @example
 * // Basic horizontal divider
 * <Divider />
 *
 * // Vertical divider
 * <Divider orientation="vertical" />
 *
 * // Divider with label
 * <Divider label="OR" />
 *
 * // Different thicknesses
 * <Divider size="thin" />
 * <Divider size="thick" />
 */
export function Divider(props: DividerProps) {
  const { orientation = "horizontal", size = "default", label, style } = props

  // Apply variants - map "default" to undefined for Unistyles
  const sizeForStyles = size === "default" ? undefined : size
  styles.useVariants({ orientation, size: sizeForStyles })

  if (label && orientation === "horizontal") {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={styles.line} />
        <Text size="sm" color="tertiary" style={styles.label}>
          {label}
        </Text>
        <View style={styles.line} />
      </View>
    )
  }

  return <View style={[styles.divider, style]} />
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  divider: {
    backgroundColor: theme.colors.separator,
    variants: {
      orientation: {
        horizontal: {
          width: "100%",
          alignSelf: "stretch",
        },
        vertical: {
          alignSelf: "stretch",
        },
      },
      size: {
        thin: {
          height: 0.5,
          width: 0.5,
        },
        default: {
          height: 1,
          width: 1,
        },
        thick: {
          height: 2,
          width: 2,
        },
      },
    },
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    variants: {
      orientation: {
        horizontal: {},
        vertical: {},
      },
      size: {
        thin: {},
        default: {},
        thick: {},
      },
    },
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.separator,
  },
  label: {
    paddingHorizontal: theme.spacing.lg,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: 11,
  },
}))
