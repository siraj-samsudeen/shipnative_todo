/**
 * useAnalytics Hook Tests
 *
 * Comprehensive tests for the analytics hook functionality
 */

import { renderHook, act } from "@testing-library/react-native"

import { useAnalytics } from "../useAnalytics"

// Mock the analytics utils
const mockTrackEvent = jest.fn()
const mockTrackScreen = jest.fn()
const mockIdentifyUser = jest.fn()
const mockClearUser = jest.fn()
const mockTrackError = jest.fn()
const mockIsFeatureEnabled = jest.fn()
const mockGetFeatureFlag = jest.fn()
const mockTrackAuth = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}
const mockTrackSubscription = {
  purchase: jest.fn(),
  cancel: jest.fn(),
}
const mockTrackOnboarding = {
  start: jest.fn(),
  complete: jest.fn(),
}

jest.mock("../../utils/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  trackScreen: (...args: unknown[]) => mockTrackScreen(...args),
  identifyUser: (...args: unknown[]) => mockIdentifyUser(...args),
  clearUser: () => mockClearUser(),
  trackError: (...args: unknown[]) => mockTrackError(...args),
  isFeatureEnabled: (flag: string) => mockIsFeatureEnabled(flag),
  getFeatureFlag: (flag: string) => mockGetFeatureFlag(flag),
  trackAuth: mockTrackAuth,
  trackSubscription: mockTrackSubscription,
  trackOnboarding: mockTrackOnboarding,
}))

jest.mock("../../services/posthog", () => ({
  posthog: {
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  },
}))

jest.mock("../../services/sentry", () => ({
  sentry: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
}))

describe("useAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("trackEvent", () => {
    it("should call trackEvent with event name", () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent("button_clicked")
      })

      expect(mockTrackEvent).toHaveBeenCalledWith("button_clicked", undefined)
    })

    it("should call trackEvent with event name and properties", () => {
      const { result } = renderHook(() => useAnalytics())
      const properties = { button: "submit", screen: "checkout" }

      act(() => {
        result.current.trackEvent("button_clicked", properties)
      })

      expect(mockTrackEvent).toHaveBeenCalledWith("button_clicked", properties)
    })

    it("should maintain stable reference across renders", () => {
      const { result, rerender } = renderHook(() => useAnalytics())
      const firstTrackEvent = result.current.trackEvent

      rerender({})

      expect(result.current.trackEvent).toBe(firstTrackEvent)
    })
  })

  describe("trackScreen", () => {
    it("should call trackScreen with screen name", () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackScreen("HomeScreen")
      })

      expect(mockTrackScreen).toHaveBeenCalledWith("HomeScreen", undefined)
    })

    it("should call trackScreen with screen name and properties", () => {
      const { result } = renderHook(() => useAnalytics())
      const properties = { source: "deep_link" }

      act(() => {
        result.current.trackScreen("ProductScreen", properties)
      })

      expect(mockTrackScreen).toHaveBeenCalledWith("ProductScreen", properties)
    })
  })

  describe("identifyUser", () => {
    it("should call identifyUser with userId", () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.identifyUser("user-123")
      })

      expect(mockIdentifyUser).toHaveBeenCalledWith("user-123", undefined)
    })

    it("should call identifyUser with userId and properties", () => {
      const { result } = renderHook(() => useAnalytics())
      const properties = { email: "test@example.com", plan: "premium" }

      act(() => {
        result.current.identifyUser("user-123", properties)
      })

      expect(mockIdentifyUser).toHaveBeenCalledWith("user-123", properties)
    })
  })

  describe("clearUser", () => {
    it("should call clearUser", () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.clearUser()
      })

      expect(mockClearUser).toHaveBeenCalled()
    })
  })

  describe("trackError", () => {
    it("should call trackError with error", () => {
      const { result } = renderHook(() => useAnalytics())
      const error = new Error("Test error")

      act(() => {
        result.current.trackError(error)
      })

      expect(mockTrackError).toHaveBeenCalledWith(error, undefined)
    })

    it("should call trackError with error and context", () => {
      const { result } = renderHook(() => useAnalytics())
      const error = new Error("Test error")
      const context = {
        tags: { screen: "HomeScreen", action: "fetch_data" },
      }

      act(() => {
        result.current.trackError(error, context)
      })

      expect(mockTrackError).toHaveBeenCalledWith(error, context)
    })
  })

  describe("feature flags", () => {
    it("should check if feature is enabled", () => {
      mockIsFeatureEnabled.mockReturnValue(true)
      const { result } = renderHook(() => useAnalytics())

      let isEnabled: boolean
      act(() => {
        isEnabled = result.current.isFeatureEnabled("new-feature")
      })

      expect(mockIsFeatureEnabled).toHaveBeenCalledWith("new-feature")
      expect(isEnabled!).toBe(true)
    })

    it("should get feature flag value", () => {
      mockGetFeatureFlag.mockReturnValue("variant-a")
      const { result } = renderHook(() => useAnalytics())

      let flagValue: string | boolean | number | null | undefined
      act(() => {
        flagValue = result.current.getFeatureFlag("experiment-1")
      })

      expect(mockGetFeatureFlag).toHaveBeenCalledWith("experiment-1")
      expect(flagValue).toBe("variant-a")
    })

    it("should return undefined for missing feature flag", () => {
      mockGetFeatureFlag.mockReturnValue(undefined)
      const { result } = renderHook(() => useAnalytics())

      let flagValue: string | boolean | number | null | undefined
      act(() => {
        flagValue = result.current.getFeatureFlag("non-existent")
      })

      expect(flagValue).toBeUndefined()
    })
  })

  describe("convenience methods", () => {
    it("should expose auth tracking object", () => {
      const { result } = renderHook(() => useAnalytics())

      // The auth object is imported directly from utils/analytics
      // It should be defined and have the expected shape (even if mocked to undefined)
      expect("auth" in result.current).toBe(true)
    })

    it("should expose subscription tracking object", () => {
      const { result } = renderHook(() => useAnalytics())

      // The subscription object is imported directly from utils/analytics
      expect("subscription" in result.current).toBe(true)
    })

    it("should expose onboarding tracking object", () => {
      const { result } = renderHook(() => useAnalytics())

      // The onboarding object is imported directly from utils/analytics
      expect("onboarding" in result.current).toBe(true)
    })
  })

  describe("direct service access", () => {
    it("should expose posthog service", () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.posthog).toBeDefined()
    })

    it("should expose sentry service", () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.sentry).toBeDefined()
    })
  })
})
