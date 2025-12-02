/**
 * Platform-agnostic subscription types
 *
 * These types provide a unified interface for subscription management
 * across all platforms using RevenueCat (iOS, Android, and Web)
 */

export type SubscriptionPlatform = "revenuecat" | "revenuecat-web" | "mock"

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial" | "none"

export interface SubscriptionInfo {
  platform: SubscriptionPlatform
  status: SubscriptionStatus
  productId: string | null
  expirationDate: string | null
  willRenew: boolean
  isActive: boolean
  isTrial: boolean
}

export interface PricingPackage {
  id: string
  identifier: string
  title: string
  description: string
  price: number
  priceString: string
  currencyCode: string
  billingPeriod: "monthly" | "annual" | "lifetime"
  platform: SubscriptionPlatform
  // Platform-specific data
  platformData?: any
}

export interface SubscriptionService {
  platform: SubscriptionPlatform

  // Initialization
  configure(config: any): Promise<void>

  // User management
  logIn(userId: string): Promise<{ subscriptionInfo: SubscriptionInfo }>
  logOut(): Promise<{ subscriptionInfo: SubscriptionInfo }>

  // Subscription info
  getSubscriptionInfo(): Promise<SubscriptionInfo>

  // Packages/Products
  getPackages(): Promise<PricingPackage[]>

  // Purchase
  purchasePackage(pkg: PricingPackage): Promise<{
    subscriptionInfo: SubscriptionInfo
    error?: Error
  }>

  // Restore
  restorePurchases(): Promise<{
    subscriptionInfo: SubscriptionInfo
    error?: Error
  }>

  // Management
  getManagementUrl?(): Promise<string | null>

  // Listeners
  addSubscriptionUpdateListener?(listener: (info: SubscriptionInfo) => void): () => void
}

/**
 * Helper to convert platform-specific data to unified SubscriptionInfo
 */
export function createSubscriptionInfo(
  platform: SubscriptionPlatform,
  data: any,
): SubscriptionInfo {
  // Default empty state
  const defaultInfo: SubscriptionInfo = {
    platform,
    status: "none",
    productId: null,
    expirationDate: null,
    willRenew: false,
    isActive: false,
    isTrial: false,
  }

  if (!data) return defaultInfo

  // Platform-specific parsing will be done in each service
  return defaultInfo
}
