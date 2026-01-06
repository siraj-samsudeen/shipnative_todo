/**
 * Subscription Flow Integration Tests
 *
 * Tests for complete subscription purchase flows including:
 * - Fetching offerings
 * - Purchase flow
 * - Restore purchases
 * - Pro status changes
 */

import { act, renderHook, waitFor } from "@testing-library/react-native"

import * as revenueCatService from "../../services/revenuecat"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import type { PricingPackage, SubscriptionInfo } from "../../types/subscription"

// Mock RevenueCat service
jest.mock("../../services/revenuecat", () => ({
  revenueCat: {
    initialize: jest.fn(),
    getSubscriptionInfo: jest.fn(),
    getPackages: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
    addSubscriptionUpdateListener: jest.fn(),
  },
  isRevenueCatMock: true,
}))

// Mock auth store
jest.mock("../../stores/auth", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      user: { id: "test-user-123" },
      isAuthenticated: true,
    })),
    subscribe: jest.fn(() => jest.fn()),
  },
}))

const mockPackages: PricingPackage[] = [
  {
    identifier: "monthly",
    packageType: "MONTHLY",
    product: {
      identifier: "com.app.monthly",
      title: "Monthly",
      description: "Monthly subscription",
      priceString: "$9.99",
      price: 9.99,
      currencyCode: "USD",
    },
  },
  {
    identifier: "annual",
    packageType: "ANNUAL",
    product: {
      identifier: "com.app.annual",
      title: "Annual",
      description: "Annual subscription",
      priceString: "$79.99",
      price: 79.99,
      currencyCode: "USD",
    },
  },
]

const mockSubscriptionInfo: SubscriptionInfo = {
  isActive: true,
  willRenew: true,
  periodType: "normal",
  expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  productIdentifier: "com.app.monthly",
  isSandbox: true,
  originalPurchaseDate: new Date().toISOString(),
}

const mockFreeSubscriptionInfo: SubscriptionInfo = {
  isActive: false,
  willRenew: false,
  periodType: "normal",
  expirationDate: null,
  productIdentifier: null,
  isSandbox: false,
  originalPurchaseDate: null,
}

describe("Subscription Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useSubscriptionStore.setState({
      isPro: false,
      loading: false,
      packages: [],
      customerInfo: null,
      webSubscriptionInfo: null,
      platform: "revenuecat-native",
    })
  })

  describe("Initialization", () => {
    it("should initialize subscription service and fetch status", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.initialize as jest.Mock).mockResolvedValue(undefined)
      ;(revenueCatService.revenueCat.getSubscriptionInfo as jest.Mock).mockResolvedValue(
        mockFreeSubscriptionInfo,
      )
      ;(revenueCatService.revenueCat.getPackages as jest.Mock).mockResolvedValue(mockPackages)
      ;(revenueCatService.revenueCat.addSubscriptionUpdateListener as jest.Mock).mockReturnValue(
        undefined,
      )

      await act(async () => {
        await result.current.initialize()
      })

      await waitFor(() => {
        expect(result.current.packages).toHaveLength(2)
        expect(result.current.isPro).toBe(false)
      })

      expect(revenueCatService.revenueCat.initialize).toHaveBeenCalled()
    })

    it("should detect pro status from subscription info", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.initialize as jest.Mock).mockResolvedValue(undefined)
      ;(revenueCatService.revenueCat.getSubscriptionInfo as jest.Mock).mockResolvedValue(
        mockSubscriptionInfo,
      )
      ;(revenueCatService.revenueCat.getPackages as jest.Mock).mockResolvedValue(mockPackages)
      ;(revenueCatService.revenueCat.addSubscriptionUpdateListener as jest.Mock).mockReturnValue(
        undefined,
      )

      await act(async () => {
        await result.current.initialize()
      })

      await waitFor(() => {
        expect(result.current.isPro).toBe(true)
        expect(result.current.customerInfo?.isActive).toBe(true)
      })
    })
  })

  describe("Fetch Packages", () => {
    it("should fetch available packages", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.getPackages as jest.Mock).mockResolvedValue(mockPackages)

      await act(async () => {
        await result.current.fetchPackages()
      })

      await waitFor(() => {
        expect(result.current.packages).toHaveLength(2)
        expect(result.current.packages[0].identifier).toBe("monthly")
        expect(result.current.packages[1].identifier).toBe("annual")
      })
    })

    it("should handle empty packages gracefully", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.getPackages as jest.Mock).mockResolvedValue([])

      await act(async () => {
        await result.current.fetchPackages()
      })

      await waitFor(() => {
        expect(result.current.packages).toHaveLength(0)
      })
    })

    it("should handle fetch error gracefully", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.getPackages as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      )

      await act(async () => {
        await result.current.fetchPackages()
      })

      // Should not throw, packages should remain empty
      expect(result.current.packages).toHaveLength(0)
    })
  })

  describe("Purchase Flow", () => {
    it("should complete purchase successfully", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.purchasePackage as jest.Mock).mockResolvedValue({
        subscriptionInfo: mockSubscriptionInfo,
        error: null,
      })

      let purchaseResult: { error?: Error }
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockPackages[0])
      })

      await waitFor(() => {
        expect(purchaseResult.error).toBeUndefined()
        expect(result.current.isPro).toBe(true)
        expect(result.current.customerInfo?.isActive).toBe(true)
      })
    })

    it("should handle user cancellation gracefully", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.purchasePackage as jest.Mock).mockRejectedValue({
        userCancelled: true,
      })

      let purchaseResult: { error?: Error }
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockPackages[0])
      })

      // User cancellation should not be treated as an error
      expect(purchaseResult!.error).toBeUndefined()
      expect(result.current.isPro).toBe(false)
    })

    it("should handle purchase error", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      const purchaseError = new Error("Payment declined")
      ;(revenueCatService.revenueCat.purchasePackage as jest.Mock).mockRejectedValue(purchaseError)

      let purchaseResult: { error?: Error }
      await act(async () => {
        purchaseResult = await result.current.purchasePackage(mockPackages[0])
      })

      expect(purchaseResult!.error).toBeDefined()
      expect(purchaseResult!.error?.message).toBe("Payment declined")
      expect(result.current.isPro).toBe(false)
    })

    it("should set loading state during purchase", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      let resolvePromise: (value: unknown) => void
      const purchasePromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(revenueCatService.revenueCat.purchasePackage as jest.Mock).mockReturnValue(purchasePromise)

      // Start purchase
      const purchasePromiseResult = act(async () => {
        await result.current.purchasePackage(mockPackages[0])
      })

      // Loading should be true
      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      // Complete purchase
      resolvePromise!({
        subscriptionInfo: mockSubscriptionInfo,
        error: null,
      })

      await purchasePromiseResult

      // Loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe("Restore Purchases", () => {
    it("should restore purchases successfully", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.restorePurchases as jest.Mock).mockResolvedValue({
        subscriptionInfo: mockSubscriptionInfo,
        error: null,
      })

      let restoreResult: { subscriptionInfo?: SubscriptionInfo; error?: Error }
      await act(async () => {
        restoreResult = await result.current.restorePurchases()
      })

      await waitFor(() => {
        expect(restoreResult.error).toBeUndefined()
        expect(restoreResult.subscriptionInfo?.isActive).toBe(true)
        expect(result.current.isPro).toBe(true)
      })
    })

    it("should handle no purchases to restore", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.restorePurchases as jest.Mock).mockResolvedValue({
        subscriptionInfo: mockFreeSubscriptionInfo,
        error: null,
      })

      let restoreResult: { subscriptionInfo?: SubscriptionInfo; error?: Error }
      await act(async () => {
        restoreResult = await result.current.restorePurchases()
      })

      await waitFor(() => {
        expect(restoreResult.subscriptionInfo?.isActive).toBe(false)
        expect(result.current.isPro).toBe(false)
      })
    })

    it("should handle restore error", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      const restoreError = new Error("Restore failed")
      ;(revenueCatService.revenueCat.restorePurchases as jest.Mock).mockResolvedValue({
        subscriptionInfo: mockFreeSubscriptionInfo,
        error: restoreError,
      })

      let restoreResult: { subscriptionInfo?: SubscriptionInfo; error?: Error }
      await act(async () => {
        restoreResult = await result.current.restorePurchases()
      })

      expect(restoreResult!.error).toBeDefined()
    })
  })

  describe("Pro Status", () => {
    it("should check pro status correctly", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      // Set customer info with active subscription
      await act(async () => {
        result.current.setCustomerInfo(mockSubscriptionInfo)
      })

      await act(async () => {
        result.current.checkProStatus()
      })

      await waitFor(() => {
        expect(result.current.isPro).toBe(true)
      })
    })

    it("should detect expired subscription", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      // Set expired subscription
      const expiredInfo: SubscriptionInfo = {
        ...mockSubscriptionInfo,
        isActive: false,
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      }

      await act(async () => {
        result.current.setCustomerInfo(expiredInfo)
      })

      await act(async () => {
        result.current.checkProStatus()
      })

      await waitFor(() => {
        expect(result.current.isPro).toBe(false)
      })
    })
  })

  describe("User Login/Logout", () => {
    it("should log in user to subscription service", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.logIn as jest.Mock).mockResolvedValue({
        subscriptionInfo: mockSubscriptionInfo,
        created: false,
      })

      await act(async () => {
        await result.current.logIn("user-123")
      })

      expect(revenueCatService.revenueCat.logIn).toHaveBeenCalledWith("user-123")
    })

    it("should log out user from subscription service", async () => {
      const { result } = renderHook(() => useSubscriptionStore())

      ;(revenueCatService.revenueCat.logOut as jest.Mock).mockResolvedValue(undefined)

      await act(async () => {
        await result.current.logOut()
      })

      expect(revenueCatService.revenueCat.logOut).toHaveBeenCalled()
    })
  })
})
