import { useEffect } from "react"
import { View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

// =============================================================================
// TYPES
// =============================================================================

type Variants = "default" | "success" | "warning" | "error" | "gradient"
type Sizes = "sm" | "md" | "lg"

export interface ProgressProps {
  /**
   * Progress value (0-100). Optional when indeterminate is true.
   */
  value?: number
  /**
   * Progress variant/color
   */
  variant?: Variants
  /**
   * Progress size
   */
  size?: Sizes
  /**
   * Show animated stripes
   */
  animated?: boolean
  /**
   * Show indeterminate loading animation
   */
  indeterminate?: boolean
  /**
   * Additional container style
   */
  style?: ViewStyle
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Progress bar component with multiple variants and animations.
 *
 * @example
 * // Basic progress
 * <Progress value={75} />
 *
 * // Variants
 * <Progress value={100} variant="success" />
 * <Progress value={50} variant="warning" />
 *
 * // Sizes
 * <Progress value={60} size="sm" />
 * <Progress value={60} size="lg" />
 *
 * // Indeterminate (loading)
 * <Progress indeterminate />
 */
export function Progress(props: ProgressProps) {
  const {
    value,
    variant = "default",
    size = "md",
    animated = false,
    indeterminate = false,
    style,
  } = props

  const { theme } = useUnistyles()

  // Animation values
  const progressWidth = useSharedValue(0)
  const indeterminatePosition = useSharedValue(0)

  // Apply variants
  styles.useVariants({ size })

  useEffect(() => {
    if (!indeterminate && value !== undefined) {
      progressWidth.value = withSpring(Math.min(Math.max(value, 0), 100), {
        damping: 20,
        stiffness: 90,
      })
    }
  }, [value, indeterminate, progressWidth])

  // Indeterminate animation
  useEffect(() => {
    if (indeterminate) {
      const animate = () => {
        indeterminatePosition.value = 0
        indeterminatePosition.value = withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      }
      animate()
      const interval = setInterval(animate, 1500)
      return () => clearInterval(interval)
    }
    return undefined
  }, [indeterminate, indeterminatePosition])

  // Get variant color
  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return theme.colors.success
      case "warning":
        return theme.colors.warning
      case "error":
        return theme.colors.error
      case "gradient":
        return theme.colors.palette.primary500
      default:
        return theme.colors.primary
    }
  }

  // Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as unknown as number,
  }))

  const indeterminateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(indeterminatePosition.value, [0, 1], [-100, 300]),
      },
    ],
  }))

  return (
    <View style={[styles.container, style]}>
      {indeterminate ? (
        <Animated.View
          style={[
            styles.progress,
            styles.indeterminate,
            { backgroundColor: getProgressColor() },
            indeterminateStyle,
          ]}
        />
      ) : (
        <Animated.View
          style={[styles.progress, { backgroundColor: getProgressColor() }, progressStyle]}
        >
          {animated && <View style={styles.stripes} />}
        </Animated.View>
      )}
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.full,
    overflow: "hidden",
    variants: {
      size: {
        sm: {
          height: 4,
        },
        md: {
          height: 8,
        },
        lg: {
          height: 12,
        },
      },
    },
  },
  progress: {
    height: "100%",
    borderRadius: theme.radius.full,
  },
  indeterminate: {
    width: "30%",
    position: "absolute",
  },
  stripes: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
}))
