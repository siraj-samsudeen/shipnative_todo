/**
 * useAnalytics Hook
 *
 * React hook for accessing analytics and error tracking functionality.
 * Provides a convenient API for tracking events, screens, and errors.
 */

import { useCallback } from "react"

import { posthog } from "../services/posthog"
import { sentry } from "../services/sentry"
import type { EventProperties, UserProperties, ScreenProperties } from "../types/analytics"
import type { ErrorContext } from "../types/errorTracking"
import {
  trackEvent as utilTrackEvent,
  trackScreen as utilTrackScreen,
  trackError as utilTrackError,
  identifyUser as utilIdentifyUser,
  clearUser as utilClearUser,
  isFeatureEnabled as utilIsFeatureEnabled,
  getFeatureFlag as utilGetFeatureFlag,
  trackAuth,
  trackSubscription,
  trackOnboarding,
} from "../utils/analytics"

export interface UseAnalyticsReturn {
  // Event tracking
  trackEvent: (event: string, properties?: EventProperties) => void
  trackScreen: (screenName: string, properties?: ScreenProperties) => void

  // User identification
  identifyUser: (userId: string, properties?: UserProperties) => void
  clearUser: () => void

  // Error tracking
  trackError: (error: Error, context?: ErrorContext) => void

  // Feature flags
  isFeatureEnabled: (flag: string) => boolean
  getFeatureFlag: (flag: string) => any

  // Convenience methods
  auth: typeof trackAuth
  subscription: typeof trackSubscription
  onboarding: typeof trackOnboarding

  // Direct service access (for advanced usage)
  posthog: typeof posthog
  sentry: typeof sentry
}

/**
 * Hook for analytics and error tracking
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackScreen, isFeatureEnabled } = useAnalytics()
 *
 *   useEffect(() => {
 *     trackScreen('MyScreen')
 *   }, [])
 *
 *   const handleClick = () => {
 *     trackEvent('button_clicked', { button: 'submit' })
 *   }
 *
 *   const showNewFeature = isFeatureEnabled('new-feature')
 *
 *   return (
 *     <View>
 *       <Button onPress={handleClick} />
 *       {showNewFeature && <NewFeature />}
 *     </View>
 *   )
 * }
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const trackEvent = useCallback((event: string, properties?: EventProperties) => {
    utilTrackEvent(event, properties)
  }, [])

  const trackScreen = useCallback((screenName: string, properties?: ScreenProperties) => {
    utilTrackScreen(screenName, properties)
  }, [])

  const identifyUser = useCallback((userId: string, properties?: UserProperties) => {
    utilIdentifyUser(userId, properties)
  }, [])

  const clearUser = useCallback(() => {
    utilClearUser()
  }, [])

  const trackError = useCallback((error: Error, context?: ErrorContext) => {
    utilTrackError(error, context)
  }, [])

  const isFeatureEnabled = useCallback((flag: string) => {
    return utilIsFeatureEnabled(flag)
  }, [])

  const getFeatureFlag = useCallback((flag: string) => {
    return utilGetFeatureFlag(flag)
  }, [])

  return {
    trackEvent,
    trackScreen,
    identifyUser,
    clearUser,
    trackError,
    isFeatureEnabled,
    getFeatureFlag,
    auth: trackAuth,
    subscription: trackSubscription,
    onboarding: trackOnboarding,
    posthog,
    sentry,
  }
}
