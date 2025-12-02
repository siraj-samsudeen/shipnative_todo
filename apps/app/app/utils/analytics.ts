/**
 * Analytics Utility Functions
 *
 * Convenient helpers for tracking events, screens, and errors across the app.
 */

import { posthog } from "../services/posthog"
import { sentry } from "../services/sentry"
import type { EventProperties, UserProperties, ScreenProperties } from "../types/analytics"
import { AnalyticsEvents, AnalyticsScreens } from "../types/analytics"
import type { ErrorContext, Breadcrumb } from "../types/errorTracking"
import { BreadcrumbCategories } from "../types/errorTracking"

/**
 * Track a custom event
 */
export function trackEvent(event: string, properties?: EventProperties): void {
  posthog.track(event, properties)
}

/**
 * Track a screen view
 */
export function trackScreen(screenName: string, properties?: ScreenProperties): void {
  posthog.screen(screenName, properties)

  // Also add breadcrumb for Sentry
  sentry.addBreadcrumb({
    type: "navigation",
    category: BreadcrumbCategories.NAVIGATION,
    message: `Navigated to ${screenName}`,
    data: properties,
  })
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, properties?: UserProperties): void {
  posthog.identify(userId, properties)

  sentry.setUser({
    id: userId,
    ...properties,
  })
}

/**
 * Clear user identification (on logout)
 */
export function clearUser(): void {
  posthog.reset()
  sentry.setUser(null)
}

/**
 * Track an error
 */
export function trackError(error: Error, context?: ErrorContext): void {
  // Send to Sentry
  sentry.captureException(error, context)

  // Also track in analytics
  posthog.track(AnalyticsEvents.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    ...context?.tags,
  })
}

/**
 * Track a message (for non-error logging)
 */
export function trackMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext,
): void {
  sentry.captureMessage(message, level, context)
}

/**
 * Add a breadcrumb (for error context)
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  sentry.addBreadcrumb(breadcrumb)
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: string): boolean {
  return posthog.isFeatureEnabled(flag)
}

/**
 * Get a feature flag value
 */
export function getFeatureFlag(flag: string): any {
  return posthog.getFeatureFlag(flag)
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties): void {
  posthog.setUserProperties(properties)
}

/**
 * Track authentication events
 */
export const trackAuth = {
  signupStarted: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SIGNUP_STARTED, properties)
  },
  signupCompleted: (userId: string, properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SIGNUP_COMPLETED, properties)
    identifyUser(userId, properties as UserProperties)
  },
  loginStarted: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.LOGIN_STARTED, properties)
  },
  loginCompleted: (userId: string, properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.LOGIN_COMPLETED, properties)
    identifyUser(userId, properties as UserProperties)
  },
  logout: () => {
    trackEvent(AnalyticsEvents.LOGOUT)
    clearUser()
  },
}

/**
 * Track subscription events
 */
export const trackSubscription = {
  started: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, properties)
    addBreadcrumb({
      category: BreadcrumbCategories.SUBSCRIPTION,
      message: "Subscription started",
      data: properties,
    })
  },
  completed: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_COMPLETED, properties)
    addBreadcrumb({
      category: BreadcrumbCategories.SUBSCRIPTION,
      message: "Subscription completed",
      data: properties,
    })
  },
  cancelled: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_CANCELLED, properties)
    addBreadcrumb({
      category: BreadcrumbCategories.SUBSCRIPTION,
      message: "Subscription cancelled",
      data: properties,
    })
  },
  restored: (properties?: EventProperties) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_RESTORED, properties)
  },
}

/**
 * Track onboarding events
 */
export const trackOnboarding = {
  started: () => {
    trackEvent(AnalyticsEvents.ONBOARDING_STARTED)
  },
  completed: () => {
    trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED)
  },
  skipped: () => {
    trackEvent(AnalyticsEvents.ONBOARDING_SKIPPED)
  },
}

/**
 * Track app lifecycle events
 */
export const trackAppLifecycle = {
  opened: () => {
    trackEvent(AnalyticsEvents.APP_OPENED)
  },
  backgrounded: () => {
    trackEvent(AnalyticsEvents.APP_BACKGROUNDED)
  },
}

// Export standard events and screens for convenience
export { AnalyticsEvents, AnalyticsScreens }
