import { Gesture } from "react-native-gesture-handler"
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated"

import { haptics } from "@/utils/haptics"
import { SPRING_CONFIG } from "@/utils/animations"

// =============================================================================
// TYPES
// =============================================================================

export type HapticType = "buttonPress" | "buttonPressLight" | "cardPress" | "listItemPress" | "longPress"

export interface UsePressableGestureOptions {
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
   * Haptic feedback type for press (default: "buttonPress")
   */
  hapticType?: HapticType
  /**
   * Haptic feedback type for long press (default: "longPress")
   */
  hapticTypeLongPress?: HapticType
  /**
   * Scale value when pressed (default: 0.96)
   */
  pressScale?: number
  /**
   * Scale value when long pressed (default: 0.94)
   */
  longPressScale?: number
  /**
   * Enable opacity animation (default: false)
   */
  animateOpacity?: boolean
  /**
   * Custom spring config (default: SPRING_CONFIG)
   */
  springConfig?: {
    damping: number
    stiffness: number
    mass: number
  }
}

export interface UsePressableGestureReturn {
  /**
   * Gesture detector gesture (composed tap + long press)
   */
  gesture: ReturnType<typeof Gesture.Race>
  /**
   * Animated style for the pressable component
   */
  animatedStyle: ReturnType<typeof useAnimatedStyle>
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Reusable hook for pressable component gestures with haptic feedback.
 * Handles tap, long press, animations, and haptics consistently.
 *
 * @example
 * // Basic usage
 * const { gesture, animatedStyle } = usePressableGesture({
 *   onPress: () => console.log('pressed'),
 *   disabled: false,
 * })
 *
 * // With custom haptics
 * const { gesture, animatedStyle } = usePressableGesture({
 *   onPress: handlePress,
 *   hapticType: 'cardPress',
 * })
 *
 * // In component
 * <GestureDetector gesture={gesture}>
 *   <Animated.View style={[styles.container, animatedStyle]}>
 *     {children}
 *   </Animated.View>
 * </GestureDetector>
 */
export function usePressableGesture(options: UsePressableGestureOptions = {}): UsePressableGestureReturn {
  const {
    onPress,
    onLongPress,
    disabled = false,
    haptic = true,
    hapticType = "buttonPress",
    hapticTypeLongPress = "longPress",
    pressScale = 0.96,
    longPressScale = 0.94,
    animateOpacity = false,
    springConfig = SPRING_CONFIG,
  } = options

  // Animation values
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      scale.value = withSpring(pressScale, springConfig)
      if (animateOpacity) {
        opacity.value = withTiming(0.9, { duration: 50 })
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, springConfig)
      if (animateOpacity) {
        opacity.value = withTiming(1, { duration: 100 })
      }
    })
    .onEnd(() => {
      if (haptic && !disabled) {
        runOnJS(haptics[hapticType])()
      }
      if (onPress) {
        runOnJS(onPress)()
      }
    })

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(500)
    .onStart(() => {
      scale.value = withSpring(longPressScale, springConfig)
      if (haptic && !disabled) {
        runOnJS(haptics[hapticTypeLongPress])()
      }
      if (onLongPress) {
        runOnJS(onLongPress)()
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, springConfig)
    })

  const composedGesture = Gesture.Race(tapGesture, longPressGesture)

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      transform: [{ scale: scale.value }],
    }

    if (animateOpacity) {
      return {
        ...baseStyle,
        opacity: interpolate(opacity.value, [0.9, 1], [0.85, 1]),
      }
    }

    return baseStyle
  })

  return {
    gesture: composedGesture,
    animatedStyle,
  }
}


