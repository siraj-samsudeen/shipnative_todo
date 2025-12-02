import { Platform } from "react-native"
import { CustomerInfo, PurchasesPackage } from "react-native-purchases"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { useAuthStore } from "./authStore"
import { revenueCat } from "../services/revenuecat"
import type {
  SubscriptionPlatform,
  SubscriptionInfo,
  PricingPackage,
  SubscriptionService,
} from "../types/subscription"
import * as storage from "../utils/storage"

interface SubscriptionState {
  isPro: boolean
  platform: SubscriptionPlatform

  // RevenueCat data (mobile)
  customerInfo: CustomerInfo | null

  // RevenueCat Web data
  webSubscriptionInfo: SubscriptionInfo | null

  // Unified packages
  packages: (PurchasesPackage | PricingPackage)[]
  loading: boolean

  // Actions
  setCustomerInfo: (info: CustomerInfo | null) => void
  setWebSubscriptionInfo: (info: SubscriptionInfo | null) => void
  setPackages: (packages: (PurchasesPackage | PricingPackage)[]) => void
  checkProStatus: () => void
  fetchPackages: () => Promise<void>
  purchasePackage: (pkg: PurchasesPackage | PricingPackage) => Promise<{ error?: Error }>
  restorePurchases: () => Promise<{ error?: Error }>
  initialize: () => Promise<void>
  getActiveService: () => SubscriptionService
}

// Custom storage adapter for Zustand to use MMKV
const mmkvStorage = {
  getItem: async (name: string) => {
    const value = storage.load(name)
    return value ? JSON.stringify(value) : null
  },
  setItem: async (name: string, value: string) => {
    storage.save(name, JSON.parse(value))
  },
  removeItem: async (name: string) => {
    storage.remove(name)
  },
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      platform: Platform.OS === "web" ? "revenuecat-web" : "revenuecat",
      customerInfo: null,
      webSubscriptionInfo: null,
      packages: [],
      loading: false,

      getActiveService: (): SubscriptionService => {
        // RevenueCat handles both mobile and web now
        return revenueCat as unknown as SubscriptionService
      },

      setCustomerInfo: (info) => {
        set({ customerInfo: info })
        get().checkProStatus()
      },

      setWebSubscriptionInfo: (info) => {
        set({ webSubscriptionInfo: info })
        get().checkProStatus()
      },

      setPackages: (packages) => {
        set({ packages })
      },

      checkProStatus: () => {
        const { customerInfo, webSubscriptionInfo, platform } = get()

        let isPro = false

        // Check RevenueCat (mobile) - customerInfo is actually a SubscriptionInfo object
        if (customerInfo && platform === "revenuecat") {
          // Check if it has the new SubscriptionInfo structure (with isActive property)
          if ("isActive" in customerInfo) {
            isPro = (customerInfo as any).isActive
          } else {
            // Fallback to old structure
            isPro = !!customerInfo.entitlements?.active?.["pro"]
          }
        }

        // Check RevenueCat Web
        if (webSubscriptionInfo && platform === "revenuecat-web") {
          isPro = webSubscriptionInfo.isActive
        }

        set({ isPro })
      },

      fetchPackages: async () => {
        try {
          const service = get().getActiveService()
          const packages = await service.getPackages()
          set({ packages })
        } catch (error) {
          console.error("Failed to fetch packages:", error)
        }
      },

      purchasePackage: async (pkg) => {
        try {
          set({ loading: true })
          const service = get().getActiveService()
          const { platform } = get()

          const result = await service.purchasePackage(pkg as any)

          if (platform === "revenuecat-web") {
            set({
              webSubscriptionInfo: result.subscriptionInfo,
              loading: false,
            })
          } else {
            set({
              customerInfo: result.subscriptionInfo as any,
              loading: false,
            })
          }

          get().checkProStatus()

          return result.error ? { error: result.error } : {}
        } catch (error: any) {
          set({ loading: false })

          // User cancelled
          if (error.userCancelled) {
            return {}
          }

          return { error: error as Error }
        }
      },

      restorePurchases: async () => {
        try {
          set({ loading: true })
          const service = get().getActiveService()
          const { platform } = get()

          const result = await service.restorePurchases()

          if (platform === "revenuecat-web") {
            set({
              webSubscriptionInfo: result.subscriptionInfo,
              loading: false,
            })
          } else {
            set({
              customerInfo: (result as any).subscriptionInfo || result.subscriptionInfo,
              loading: false,
            })
          }

          get().checkProStatus()

          return result.error ? { error: result.error } : {}
        } catch (error) {
          set({ loading: false })
          return { error: error as Error }
        }
      },

      initialize: async () => {
        try {
          const user = useAuthStore.getState().user
          const service = get().getActiveService()
          const { platform } = get()

          if (user) {
            // Login to RevenueCat with user ID
            const result = await service.logIn(user.id)

            if (platform === "revenuecat-web") {
              set({ webSubscriptionInfo: result.subscriptionInfo })
            } else {
              set({ customerInfo: result.subscriptionInfo as any })
            }

            get().checkProStatus()
          } else {
            // Logout from RevenueCat
            const result = await service.logOut()

            if (platform === "revenuecat-web") {
              set({
                webSubscriptionInfo: result.subscriptionInfo,
                isPro: false,
              })
            } else {
              set({
                customerInfo: result.subscriptionInfo as any,
                isPro: false,
              })
            }
          }

          // Fetch available packages
          await get().fetchPackages()

          // Listen for subscription updates (if supported)
          if (service.addSubscriptionUpdateListener) {
            service.addSubscriptionUpdateListener((info) => {
              if (platform === "revenuecat-web") {
                set({ webSubscriptionInfo: info })
              } else {
                set({ customerInfo: info as any })
              }
              get().checkProStatus()
            })
          }
        } catch (error) {
          console.error("Subscription initialization failed:", error)
        }
      },
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        // Only persist isPro and subscription info
        isPro: state.isPro,
        platform: state.platform,
        customerInfo: state.customerInfo,
        webSubscriptionInfo: state.webSubscriptionInfo,
      }),
    },
  ),
)
