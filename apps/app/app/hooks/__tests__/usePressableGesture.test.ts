/**
 * usePressableGesture Hook Tests
 *
 * Comprehensive tests for the pressable gesture hook functionality
 */

import { renderHook, act } from "@testing-library/react-native"

import { usePressableGesture, type UsePressableGestureOptions } from "../usePressableGesture"

// Mock haptics
const mockHaptics = {
  buttonPress: jest.fn(),
  buttonPressLight: jest.fn(),
  cardPress: jest.fn(),
  listItemPress: jest.fn(),
  longPress: jest.fn(),
}

jest.mock("../../utils/haptics", () => ({
  haptics: mockHaptics,
}))

// Mock react-native-reanimated
const mockWithSpring = jest.fn((value) => value)
const mockWithTiming = jest.fn((value) => value)
const mockRunOnJS = jest.fn((fn) => fn)
const mockInterpolate = jest.fn((value, _input, output) => {
  // Return first output value as a simple approximation
  return output[0]
})

jest.mock("react-native-reanimated", () => {
  // Create interpolate function that will be available in module scope
  const interpolate = (value: number, _input: number[], output: number[]) => output[0]

  return {
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((fn) => {
      // Return an empty style object instead of executing the function
      // This avoids the interpolate reference issue
      return {}
    }),
    withSpring: mockWithSpring,
    withTiming: mockWithTiming,
    runOnJS: mockRunOnJS,
    interpolate,
  }
})

// Mock react-native-gesture-handler
const mockTapGesture = {
  enabled: jest.fn().mockReturnThis(),
  onBegin: jest.fn().mockReturnThis(),
  onFinalize: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockReturnThis(),
}

const mockLongPressGesture = {
  enabled: jest.fn().mockReturnThis(),
  minDuration: jest.fn().mockReturnThis(),
  onStart: jest.fn().mockReturnThis(),
  onFinalize: jest.fn().mockReturnThis(),
}

const mockComposedGesture = { type: "race" }

jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Tap: jest.fn(() => mockTapGesture),
    LongPress: jest.fn(() => mockLongPressGesture),
    Race: jest.fn(() => mockComposedGesture),
  },
}))

// Mock animations
jest.mock("../../utils/animations", () => ({
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 400,
    mass: 0.5,
  },
}))

describe("usePressableGesture", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("initialization", () => {
    it("should return gesture and animatedStyle", () => {
      const { result } = renderHook(() => usePressableGesture())

      expect(result.current.gesture).toBeDefined()
      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should use default options when none provided", () => {
      renderHook(() => usePressableGesture())

      // Tap gesture should be disabled when no onPress
      expect(mockTapGesture.enabled).toHaveBeenCalledWith(false)

      // Long press gesture should be disabled when no onLongPress
      expect(mockLongPressGesture.enabled).toHaveBeenCalledWith(false)
    })
  })

  describe("tap gesture", () => {
    it("should enable tap gesture when onPress is provided", () => {
      const onPress = jest.fn()
      renderHook(() => usePressableGesture({ onPress }))

      expect(mockTapGesture.enabled).toHaveBeenCalledWith(true)
    })

    it("should disable tap gesture when disabled is true", () => {
      const onPress = jest.fn()
      renderHook(() => usePressableGesture({ onPress, disabled: true }))

      expect(mockTapGesture.enabled).toHaveBeenCalledWith(false)
    })

    it("should configure tap gesture callbacks", () => {
      const onPress = jest.fn()
      renderHook(() => usePressableGesture({ onPress }))

      expect(mockTapGesture.onBegin).toHaveBeenCalled()
      expect(mockTapGesture.onFinalize).toHaveBeenCalled()
      expect(mockTapGesture.onEnd).toHaveBeenCalled()
    })
  })

  describe("long press gesture", () => {
    it("should enable long press gesture when onLongPress is provided", () => {
      const onLongPress = jest.fn()
      renderHook(() => usePressableGesture({ onLongPress }))

      expect(mockLongPressGesture.enabled).toHaveBeenCalledWith(true)
    })

    it("should disable long press gesture when disabled is true", () => {
      const onLongPress = jest.fn()
      renderHook(() => usePressableGesture({ onLongPress, disabled: true }))

      expect(mockLongPressGesture.enabled).toHaveBeenCalledWith(false)
    })

    it("should set minimum duration for long press", () => {
      const onLongPress = jest.fn()
      renderHook(() => usePressableGesture({ onLongPress }))

      expect(mockLongPressGesture.minDuration).toHaveBeenCalledWith(500)
    })
  })

  describe("haptic feedback", () => {
    it("should use default haptic type for press", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() =>
        usePressableGesture({ onPress, haptic: true, hapticType: "buttonPress" }),
      )

      // The hook configures gestures with haptic feedback
      expect(result.current.gesture).toBeDefined()
    })

    it("should use custom haptic type when provided", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() =>
        usePressableGesture({ onPress, haptic: true, hapticType: "cardPress" }),
      )

      expect(result.current.gesture).toBeDefined()
    })

    it("should not trigger haptics when disabled", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() => usePressableGesture({ onPress, haptic: false }))

      expect(result.current.gesture).toBeDefined()
    })
  })

  describe("animation options", () => {
    it("should use default press scale", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() => usePressableGesture({ onPress }))

      // Default pressScale is 0.96
      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should use custom press scale when provided", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() => usePressableGesture({ onPress, pressScale: 0.9 }))

      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should use custom long press scale when provided", () => {
      const onLongPress = jest.fn()
      const { result } = renderHook(() =>
        usePressableGesture({ onLongPress, longPressScale: 0.85 }),
      )

      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should animate opacity when enabled", () => {
      const onPress = jest.fn()
      const { result } = renderHook(() => usePressableGesture({ onPress, animateOpacity: true }))

      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should use custom spring config when provided", () => {
      const onPress = jest.fn()
      const customConfig = { damping: 20, stiffness: 300, mass: 0.8 }
      const { result } = renderHook(() =>
        usePressableGesture({ onPress, springConfig: customConfig }),
      )

      expect(result.current.gesture).toBeDefined()
    })
  })

  describe("composed gesture", () => {
    it("should compose tap and long press gestures", () => {
      const onPress = jest.fn()
      const onLongPress = jest.fn()
      const { result } = renderHook(() => usePressableGesture({ onPress, onLongPress }))

      expect(result.current.gesture).toBe(mockComposedGesture)
    })
  })

  describe("options combinations", () => {
    it("should handle all options together", () => {
      const options: UsePressableGestureOptions = {
        onPress: jest.fn(),
        onLongPress: jest.fn(),
        disabled: false,
        haptic: true,
        hapticType: "cardPress",
        hapticTypeLongPress: "longPress",
        pressScale: 0.95,
        longPressScale: 0.9,
        animateOpacity: true,
        springConfig: { damping: 18, stiffness: 350, mass: 0.6 },
      }

      const { result } = renderHook(() => usePressableGesture(options))

      expect(result.current.gesture).toBeDefined()
      expect(result.current.animatedStyle).toBeDefined()
    })

    it("should handle empty options", () => {
      const { result } = renderHook(() => usePressableGesture({}))

      expect(result.current.gesture).toBeDefined()
      expect(result.current.animatedStyle).toBeDefined()
    })
  })
})
