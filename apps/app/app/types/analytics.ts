/**
 * Platform-agnostic analytics types
 *
 * These types provide a unified interface for analytics services
 * across different platforms and providers (PostHog, etc.)
 */

export type AnalyticsPlatform = "posthog" | "mock"

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface UserProperties {
  email?: string
  name?: string
  [key: string]: string | number | boolean | null | undefined
}

export interface ScreenProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface GroupProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface AnalyticsConfig {
  apiKey: string
  host?: string
  enableInDevelopment?: boolean
  captureScreens?: boolean
  captureClicks?: boolean
}

export interface FeatureFlag {
  key: string
  value: boolean | string | number
  payload?: any
}

export interface AnalyticsService {
  platform: AnalyticsPlatform

  // Initialization
  initialize(config: AnalyticsConfig): Promise<void>

  // Events
  track(event: string, properties?: EventProperties): void
  screen(name: string, properties?: ScreenProperties): void

  // User identification
  identify(userId: string, properties?: UserProperties): void
  reset(): void

  // User properties
  setUserProperties(properties: UserProperties): void

  // Groups (for B2B analytics)
  group(type: string, id: string, properties?: GroupProperties): void

  // Feature flags
  isFeatureEnabled(flag: string): boolean
  getFeatureFlag(flag: string): any
  onFeatureFlags?(callback: (flags: Record<string, any>) => void): void

  // Opt in/out
  optIn(): void
  optOut(): void

  // Utility
  flush?(): Promise<void>
  shutdown?(): Promise<void>
}

/**
 * Helper to create a standardized event name
 */
export function createEventName(category: string, action: string, label?: string): string {
  const parts = [category, action]
  if (label) parts.push(label)
  return parts.join("_").toLowerCase()
}

/**
 * Standard event names for common actions
 */
export const AnalyticsEvents = {
  // Authentication
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_STARTED: "login_started",
  LOGIN_COMPLETED: "login_completed",
  LOGOUT: "logout",

  // Subscription
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_COMPLETED: "subscription_completed",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_RESTORED: "subscription_restored",

  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_SKIPPED: "onboarding_skipped",

  // App lifecycle
  APP_OPENED: "app_opened",
  APP_BACKGROUNDED: "app_backgrounded",

  // Screens
  SCREEN_VIEWED: "screen_viewed",

  // Errors
  ERROR_OCCURRED: "error_occurred",
} as const

/**
 * Standard screen names
 */
export const AnalyticsScreens = {
  WELCOME: "Welcome",
  LOGIN: "Login",
  REGISTER: "Register",
  ONBOARDING: "Onboarding",
  HOME: "Home",
  PROFILE: "Profile",
  SETTINGS: "Settings",
  PAYWALL: "Paywall",
} as const
