/**
 * NetworkMonitor Tests
 *
 * Comprehensive tests for the network monitoring service
 */

import { renderHook, act, waitFor } from "@testing-library/react-native"

import {
  networkMonitor,
  NetworkQuality,
  useNetworkState,
  useIsOnline,
  useNetworkQuality,
  type NetworkState,
} from "../NetworkMonitor"

// Mock NetInfo
const mockAddEventListener = jest.fn()
const mockFetch = jest.fn()
const mockUnsubscribe = jest.fn()

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: (callback: (state: unknown) => void) => {
    mockAddEventListener(callback)
    return mockUnsubscribe
  },
  fetch: () => mockFetch(),
}))

// Mock analytics
jest.mock("../../utils/analytics", () => ({
  trackEvent: jest.fn(),
}))

// Mock logger
jest.mock("../../utils/Logger", () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

import { trackEvent } from "../../utils/analytics"
import { logger } from "../../utils/Logger"

describe("NetworkMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Ensure clean state before each test
    networkMonitor.destroy()
    mockFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    })
  })

  afterEach(() => {
    networkMonitor.destroy()
  })

  describe("initialize", () => {
    it("should fetch initial network state", async () => {
      await networkMonitor.initialize()

      expect(mockFetch).toHaveBeenCalled()
    })

    it("should subscribe to network changes", async () => {
      await networkMonitor.initialize()

      expect(mockAddEventListener).toHaveBeenCalled()
    })

    it("should log initialization", async () => {
      await networkMonitor.initialize()

      expect(logger.info).toHaveBeenCalledWith(
        "Network monitor initialized",
        expect.any(Object),
      )
    })

    it("should handle initialization errors", async () => {
      const error = new Error("NetInfo failed")
      mockFetch.mockRejectedValue(error)

      await networkMonitor.initialize()

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to initialize network monitor",
        {},
        error,
      )
    })
  })

  describe("network quality determination", () => {
    it("should return OFFLINE when not connected", async () => {
      mockFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.OFFLINE)
    })

    it("should return EXCELLENT for wifi", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.EXCELLENT)
    })

    it("should return EXCELLENT for 5G cellular", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "5g" },
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.EXCELLENT)
    })

    it("should return GOOD for 4G cellular", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "4g" },
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.GOOD)
    })

    it("should return FAIR for 3G cellular", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "3g" },
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.FAIR)
    })

    it("should return POOR for 2G cellular", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "2g" },
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.POOR)
    })

    it("should return GOOD for other connection types", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "ethernet",
      })

      await networkMonitor.initialize()

      expect(networkMonitor.getQuality()).toBe(NetworkQuality.GOOD)
    })
  })

  describe("state accessors", () => {
    it("should return current state", async () => {
      await networkMonitor.initialize()

      const state = networkMonitor.getState()

      expect(state).toEqual({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
        quality: NetworkQuality.EXCELLENT,
      })
    })

    it("should check if online", async () => {
      await networkMonitor.initialize()

      expect(networkMonitor.isOnline()).toBe(true)
    })

    it("should check if internet is reachable", async () => {
      await networkMonitor.initialize()

      expect(networkMonitor.isInternetReachable()).toBe(true)
    })

    it("should return correct online status when disconnected", async () => {
      mockFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })
      await networkMonitor.initialize()

      expect(networkMonitor.isOnline()).toBe(false)
    })
  })

  describe("listeners", () => {
    it("should add and call listener with current state", async () => {
      await networkMonitor.initialize()
      const listener = jest.fn()

      networkMonitor.addListener(listener)

      expect(listener).toHaveBeenCalledWith({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
        quality: NetworkQuality.EXCELLENT,
      })
    })

    it("should call listener immediately with current state when available", async () => {
      await networkMonitor.initialize()
      const listener = jest.fn()

      networkMonitor.addListener(listener)

      // Listener is called immediately with current state
      expect(listener).toHaveBeenCalledWith({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
        quality: NetworkQuality.EXCELLENT,
      })
    })

    it("should return unsubscribe function", async () => {
      await networkMonitor.initialize()
      const listener = jest.fn()

      const unsubscribe = networkMonitor.addListener(listener)
      expect(typeof unsubscribe).toBe("function")

      listener.mockClear()
      unsubscribe()

      // Simulate network change
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled()
    })

    it("should notify listeners on network change", async () => {
      await networkMonitor.initialize()
      const listener = jest.fn()

      networkMonitor.addListener(listener)
      listener.mockClear()

      // Simulate network change
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })

      expect(listener).toHaveBeenCalledWith({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
        quality: NetworkQuality.OFFLINE,
      })
    })

    it("should handle listener errors gracefully during network changes", async () => {
      await networkMonitor.initialize()

      // Add a listener that doesn't throw initially
      const errorListener = jest.fn()
      const normalListener = jest.fn()

      networkMonitor.addListener(errorListener)
      networkMonitor.addListener(normalListener)

      // Now make the error listener throw on subsequent calls
      errorListener.mockClear()
      normalListener.mockClear()
      errorListener.mockImplementation(() => {
        throw new Error("Listener error")
      })

      // Simulate network change - this goes through notifyListeners which has try/catch
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "4g" },
      })

      expect(logger.error).toHaveBeenCalledWith(
        "Network listener error",
        {},
        expect.any(Error),
      )
      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled()
    })
  })

  describe("analytics tracking", () => {
    it("should track network connected event", async () => {
      mockFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })
      await networkMonitor.initialize()

      // Simulate reconnection
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
      })

      expect(trackEvent).toHaveBeenCalledWith("network_connected", {
        type: "wifi",
        quality: NetworkQuality.EXCELLENT,
      })
    })

    it("should track network disconnected event", async () => {
      await networkMonitor.initialize()

      // Simulate disconnection
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })

      expect(trackEvent).toHaveBeenCalledWith("network_disconnected", {
        type: "none",
        quality: NetworkQuality.OFFLINE,
      })
    })

    it("should log quality changes", async () => {
      mockFetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "cellular",
        details: { cellularGeneration: "4g" },
      })
      await networkMonitor.initialize()

      // Simulate quality change
      const eventCallback = mockAddEventListener.mock.calls[0][0]
      eventCallback({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
      })

      expect(logger.debug).toHaveBeenCalledWith("Network quality changed", {
        from: NetworkQuality.GOOD,
        to: NetworkQuality.EXCELLENT,
      })
    })
  })

  describe("destroy", () => {
    it("should unsubscribe from NetInfo", async () => {
      await networkMonitor.initialize()

      networkMonitor.destroy()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it("should clear all listeners", async () => {
      await networkMonitor.initialize()
      const listener = jest.fn()
      networkMonitor.addListener(listener)

      networkMonitor.destroy()
      listener.mockClear()

      // Listener should not be called after destroy
      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe("useNetworkState hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Ensure clean state by destroying first
    networkMonitor.destroy()
    mockFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    })
  })

  afterEach(() => {
    networkMonitor.destroy()
  })

  it("should update state when network monitor is initialized", async () => {
    await networkMonitor.initialize()
    const { result } = renderHook(() => useNetworkState())

    // Once initialized, state should reflect actual network state
    await waitFor(() => {
      expect(result.current.type).toBe("wifi")
      expect(result.current.quality).toBe(NetworkQuality.EXCELLENT)
    })
  })

  it("should cleanup listener on unmount", async () => {
    await networkMonitor.initialize()
    const { unmount } = renderHook(() => useNetworkState())

    unmount()

    // No error should occur when network changes after unmount
    const eventCallback = mockAddEventListener.mock.calls[0][0]
    expect(() => {
      eventCallback({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      })
    }).not.toThrow()
  })
})

describe("useIsOnline hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    networkMonitor.destroy()
    mockFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    })
  })

  afterEach(() => {
    networkMonitor.destroy()
  })

  it("should return online status after initialization", async () => {
    await networkMonitor.initialize()
    const { result } = renderHook(() => useIsOnline())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})

describe("useNetworkQuality hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    networkMonitor.destroy()
    mockFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    })
  })

  afterEach(() => {
    networkMonitor.destroy()
  })

  it("should return network quality after initialization", async () => {
    await networkMonitor.initialize()
    const { result } = renderHook(() => useNetworkQuality())

    await waitFor(() => {
      expect(result.current).toBe(NetworkQuality.EXCELLENT)
    })
  })
})
