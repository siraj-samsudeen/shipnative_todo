import { useEffect } from "react"
import { ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

// =============================================================================
// TYPES
// =============================================================================

type Variants = "text" | "circular" | "rectangular" | "rounded"

export interface SkeletonProps {
  /**
   * Skeleton variant
   */
  variant?: Variants
  /**
   * Width (number for pixels, string for percentage)
   */
  width?: number | string
  /**
   * Height (number for pixels, string for percentage)
   */
  height?: number | string
  /**
   * Border radius (only for rectangular variant)
   */
  borderRadius?: number
  /**
   * Additional style
   */
  style?: ViewStyle
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Skeleton loading placeholder component.
 *
 * @example
 * // Text skeleton
 * <Skeleton variant="text" width="80%" />
 *
 * // Circular skeleton (avatar)
 * <Skeleton variant="circular" width={48} height={48} />
 *
 * // Rectangular skeleton (card)
 * <Skeleton variant="rectangular" width="100%" height={200} />
 *
 * // Rounded skeleton
 * <Skeleton variant="rounded" width="100%" height={100} />
 */
export function Skeleton(props: SkeletonProps) {
  const { variant = "rectangular", width = "100%", height, borderRadius, style } = props

  const { theme } = useUnistyles()

  // Animation value for shimmer effect
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    )
  }, [shimmer])

  // Get dimensions based on variant
  const getDimensions = (): { width: number | string; height: number | string } => {
    switch (variant) {
      case "text":
        return { width: width, height: height ?? 16 }
      case "circular":
        const size = typeof width === "number" ? width : 40
        return { width: size, height: height ?? size }
      case "rounded":
        return { width: width, height: height ?? 40 }
      default:
        return { width: width, height: height ?? 100 }
    }
  }

  // Get border radius based on variant
  const getBorderRadius = (): number => {
    if (borderRadius !== undefined) return borderRadius
    switch (variant) {
      case "circular":
        return 9999
      case "rounded":
        return theme.radius.md
      case "text":
        return theme.radius.xs
      default:
        return theme.radius.sm
    }
  }

  const dimensions = getDimensions()

  // Animated shimmer style
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.7, 0.4]),
  }))

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: getBorderRadius(),
        },
        shimmerStyle,
        style,
      ]}
    />
  )
}

// =============================================================================
// SKELETON GROUP
// =============================================================================

export interface SkeletonGroupProps {
  /**
   * Number of skeleton items
   */
  count?: number
  /**
   * Gap between items
   */
  gap?: number
  /**
   * Children skeletons
   */
  children?: React.ReactNode
  /**
   * Additional style
   */
  style?: ViewStyle
}

/**
 * Group multiple skeletons together.
 *
 * @example
 * // Multiple text lines
 * <SkeletonGroup count={3} gap={8}>
 *   <Skeleton variant="text" width="100%" />
 *   <Skeleton variant="text" width="80%" />
 *   <Skeleton variant="text" width="60%" />
 * </SkeletonGroup>
 */
export function SkeletonGroup(props: SkeletonGroupProps) {
  const { count = 1, gap = 8, children, style } = props

  if (children) {
    return <Animated.View style={[styles.group, { gap }, style]}>{children}</Animated.View>
  }

  return (
    <Animated.View style={[styles.group, { gap }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="text" width={`${100 - index * 10}%`} />
      ))}
    </Animated.View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  group: {
    flexDirection: "column",
  },
}))
