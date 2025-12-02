/**
 * Query Keys Factory
 *
 * Type-safe query key management with hierarchical structure
 */

/**
 * Query key factory for user-related queries
 */
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
}

/**
 * Query key factory for subscription-related queries
 */
export const subscriptionKeys = {
  all: ["subscription"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
  entitlements: () => [...subscriptionKeys.all, "entitlements"] as const,
  products: () => [...subscriptionKeys.all, "products"] as const,
  offerings: () => [...subscriptionKeys.all, "offerings"] as const,
}

/**
 * Query key factory for analytics-related queries
 */
export const analyticsKeys = {
  all: ["analytics"] as const,
  events: () => [...analyticsKeys.all, "events"] as const,
  event: (id: string) => [...analyticsKeys.events(), id] as const,
}

/**
 * Query key factory for app-related queries
 */
export const appKeys = {
  all: ["app"] as const,
  config: () => [...appKeys.all, "config"] as const,
  features: () => [...appKeys.all, "features"] as const,
}

/**
 * All query keys
 */
export const queryKeys = {
  user: userKeys,
  subscription: subscriptionKeys,
  analytics: analyticsKeys,
  app: appKeys,
}
