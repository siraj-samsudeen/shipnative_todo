import { ReactNode } from "react"
import { ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  Layout,
} from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"

import { haptics } from "@/utils/haptics"

// =============================================================================
// TYPES
// =============================================================================

type EnteringAnimations =
  | "fadeIn"
  | "fadeInDown"
  | "fadeInUp"
  | "slideInLeft"
  | "slideInRight"
  | "zoomIn"

export interface AnimatedCardProps {
  /**
   * Card content
   */
  children: ReactNode
  /**
   * Entering animation type
   */
  entering?: EnteringAnimations
  /**
   * Animation delay (ms)
   */
  delay?: number
  /**
   * Press handler
   */
  onPress?: () => void
  /**
   * Enable 3D tilt effect on hover/press
   */
  tiltEffect?: boolean
  /**
   * Enable bounce effect on press
   */
  bounceEffect?: boolean
  /**
   * Enable haptic feedback
   */
  haptic?: boolean
  /**
   * Additional style
   */
  style?: ViewStyle
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
}

const getEnteringAnimation = (type: EnteringAnimations, delay: number) => {
  const baseDelay = delay
  switch (type) {
    case "fadeIn":
      return FadeIn.delay(baseDelay).duration(400)
    case "fadeInDown":
      return FadeInDown.delay(baseDelay).duration(400).springify()
    case "fadeInUp":
      return FadeInUp.delay(baseDelay).duration(400).springify()
    case "slideInLeft":
      return SlideInLeft.delay(baseDelay).duration(400).springify()
    case "slideInRight":
      return SlideInRight.delay(baseDelay).duration(400).springify()
    case "zoomIn":
      return ZoomIn.delay(baseDelay).duration(400).springify()
    default:
      return FadeIn.delay(baseDelay).duration(400)
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Animated card component with various entrance and interaction animations.
 *
 * @example
 * // Basic animated card
 * <AnimatedCard entering="fadeInUp">
 *   <Text>Content</Text>
 * </AnimatedCard>
 *
 * // With staggered delay
 * <AnimatedCard entering="fadeInUp" delay={100}>
 *   <Text>First Card</Text>
 * </AnimatedCard>
 * <AnimatedCard entering="fadeInUp" delay={200}>
 *   <Text>Second Card</Text>
 * </AnimatedCard>
 *
 * // Interactive with tilt effect
 * <AnimatedCard tiltEffect onPress={() => console.log("Pressed!")}>
 *   <Text>Tilt me!</Text>
 * </AnimatedCard>
 */
export function AnimatedCard(props: AnimatedCardProps) {
  const {
    children,
    entering = "fadeIn",
    delay = 0,
    onPress,
    tiltEffect = false,
    bounceEffect = true,
    haptic = true,
    style,
  } = props

  // Animation values
  const scale = useSharedValue(1)
  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!!onPress)
    .onBegin(() => {
      if (bounceEffect) {
        scale.value = withSpring(0.97, SPRING_CONFIG)
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG)
      rotateX.value = withSpring(0, SPRING_CONFIG)
      rotateY.value = withSpring(0, SPRING_CONFIG)
    })
    .onEnd(() => {
      if (haptic) {
        runOnJS(haptics.cardPress)()
      }
      if (onPress) {
        runOnJS(onPress)()
      }
    })

  const panGesture = Gesture.Pan()
    .enabled(tiltEffect)
    .onUpdate((event) => {
      // Tilt based on touch position
      rotateY.value = interpolate(event.translationX, [-100, 100], [-8, 8])
      rotateX.value = interpolate(event.translationY, [-100, 100], [8, -8])
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, SPRING_CONFIG)
      rotateY.value = withSpring(0, SPRING_CONFIG)
    })

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture)

  // Animated styles for transform (separate from layout animations)
  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { scale: scale.value },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }))

  return (
    <Animated.View
      entering={getEnteringAnimation(entering, delay)}
      layout={Layout.springify()}
      style={[styles.card, style]}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.inner, transformStyle]}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    ...theme.shadows.md,
  },
  inner: {
    padding: theme.spacing.lg,
  },
}))
