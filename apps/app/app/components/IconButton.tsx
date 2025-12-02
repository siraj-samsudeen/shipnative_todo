import { ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { haptics } from "@/utils/haptics"

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

// Spring config for snappy animations
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.5,
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

  // Animation values
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

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

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(0.9, SPRING_CONFIG)
      opacity.value = withTiming(0.8, { duration: 50 })
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG)
      opacity.value = withTiming(1, { duration: 100 })
    })
    .onEnd(() => {
      if (haptic) {
        runOnJS(haptics.buttonPressLight)()
      }
      if (onPress) {
        runOnJS(onPress)()
      }
    })

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      scale.value = withSpring(0.85, SPRING_CONFIG)
      if (haptic) {
        runOnJS(haptics.longPress)()
      }
      if (onLongPress) {
        runOnJS(onLongPress)()
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG)
    })

  const composedGesture = Gesture.Race(tapGesture, longPressGesture)

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <GestureDetector gesture={composedGesture}>
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
