/**
 * Subscription Store Selectors
 *
 * Memoized selectors for derived subscription state
 */

import { useSubscriptionStore } from "../subscriptionStore"

/**
 * Check if user has pro subscription
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const selectIsPro = () => useSubscriptionStore((state) => state.isPro)

/**
 * Check if user is on free tier
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const selectIsFree = () => useSubscriptionStore((state) => !state.isPro)

/**
 * Get subscription status
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectSubscriptionStatus = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSubscriptionStore((state) => {
    if (state.platform === "revenuecat") {
      // RevenueCat mobile - infer from entitlements
      return state.customerInfo?.entitlements.active["pro"] ? "active" : "inactive"
    } else if (state.platform === "revenuecat-web") {
      // RevenueCat web
      return state.webSubscriptionInfo?.status ?? "inactive"
    }
    return "inactive"
  })

/**
 * Check if subscription is loading
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const selectSubscriptionLoading = () => useSubscriptionStore((state) => state.loading)

/**
 * Get entitlements
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectEntitlements = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSubscriptionStore((state) => {
    if (state.platform === "revenuecat") {
      return Object.keys(state.customerInfo?.entitlements.active ?? {})
    } else if (state.platform === "revenuecat-web") {
      return state.webSubscriptionInfo?.isActive ? ["pro"] : []
    }
    return []
  })

/**
 * Check if user has specific entitlement
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectHasEntitlement = (entitlementId: string) =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSubscriptionStore((state) => {
    if (state.platform === "revenuecat") {
      return !!state.customerInfo?.entitlements.active[entitlementId]
    } else if (state.platform === "revenuecat-web") {
      return state.webSubscriptionInfo?.isActive && entitlementId === "pro"
    }
    return false
  })

/**
 * Get full subscription state
 * Note: This is a hook but uses "select" prefix for consistency with selector pattern
 */
export const selectSubscriptionState = () =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSubscriptionStore((state) => ({
    isPro: state.isPro,
    subscriptionStatus:
      state.platform === "revenuecat"
        ? state.customerInfo?.entitlements.active["pro"]
          ? "active"
          : "inactive"
        : state.platform === "revenuecat-web"
          ? (state.webSubscriptionInfo?.status ?? "inactive")
          : "inactive",
    entitlements:
      state.platform === "revenuecat"
        ? Object.keys(state.customerInfo?.entitlements.active ?? {})
        : state.platform === "revenuecat-web"
          ? state.webSubscriptionInfo?.isActive
            ? ["pro"]
            : []
          : [],
    loading: state.loading,
  }))
