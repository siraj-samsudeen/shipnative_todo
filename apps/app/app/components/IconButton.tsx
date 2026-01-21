import type { ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { GestureDetector } from "react-native-gesture-handler"
import Animated from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { usePressableGesture } from "@/hooks/usePressableGesture"

// =============================================================================
// TYPES
// =============================================================================

type Variants = "filled" | "outlined" | "ghost"
type Sizes = "sm" | "md" | "lg"

export interface IconButtonProps {
  /**
   * Icon name from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap
  /**
   * Button variant
   */
  variant?: Variants
  /**
   * Button size
   */
  size?: Sizes
  /**
   * Icon color (overrides variant default)
   */
  iconColor?: string
  /**
   * Press handler
   */
  onPress?: () => void
  /**
   * Long press handler
   */
  onLongPress?: () => void
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Enable haptic feedback (default: true)
   */
  haptic?: boolean
  /**
   * Additional style
   */
  style?: ViewStyle
  /**
   * Test ID
   */
  testID?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Icon-only button component for actions and navigation.
 * Includes haptic feedback and smooth microanimations.
 *
 * @example
 * // Basic icon button
 * <IconButton icon="close" onPress={() => {}} />
 *
 * // Different variants
 * <IconButton icon="settings" variant="filled" />
 * <IconButton icon="heart" variant="outlined" />
 * <IconButton icon="share" variant="ghost" />
 *
 * // Different sizes
 * <IconButton icon="add" size="sm" />
 * <IconButton icon="add" size="lg" />
 */
export function IconButton(props: IconButtonProps) {
  const {
    icon,
    variant = "ghost",
    size = "md",
    iconColor,
    disabled,
    onPress,
    onLongPress,
    haptic = true,
    style,
    testID,
  } = props

  const { theme } = useUnistyles()

  // Apply variants
  styles.useVariants({ variant, size })

  const defaultIconColor = {
    filled: theme.colors.primaryForeground,
    outlined: theme.colors.foreground,
    ghost: theme.colors.foreground,
  }[variant]

  const iconSize = {
    sm: theme.sizes.icon.sm,
    md: theme.sizes.icon.md,
    lg: theme.sizes.icon.lg,
  }[size]

  // Use shared pressable gesture hook
  const { gesture, animatedStyle } = usePressableGesture({
    onPress,
    onLongPress,
    disabled,
    haptic,
    hapticType: "buttonPressLight",
    pressScale: 0.9,
    longPressScale: 0.85,
    animateOpacity: true,
  })

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, disabled && styles.disabled, animatedStyle, style]}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled ?? undefined }}
      >
        <Ionicons name={icon} size={iconSize} color={iconColor || defaultIconColor} />
      </Animated.View>
    </GestureDetector>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      variant: {
        filled: {
          backgroundColor: theme.colors.primary,
        },
        outlined: {
          backgroundColor: theme.colors.transparent,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        },
        ghost: {
          backgroundColor: theme.colors.transparent,
        },
      },
      size: {
        sm: {
          width: 32,
          height: 32,
          borderRadius: theme.radius.sm,
        },
        md: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
        },
        lg: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.lg,
        },
      },
    },
  },
  disabled: {
    opacity: 0.4,
  },
}))
