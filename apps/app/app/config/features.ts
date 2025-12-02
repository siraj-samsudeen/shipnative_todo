/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for enabling/disabling features
 */

import { env, isDevelopment } from "./env"

/**
 * Feature flags
 */
export interface FeatureFlags {
  // Development features
  enableDevDashboard: boolean
  enableReactotron: boolean
  enableDebugLogging: boolean

  // App features
  enableSocialAuth: boolean
  enableAppleAuth: boolean
  enableGoogleAuth: boolean
  enableEmailAuth: boolean

  // Subscription features
  enableSubscriptions: boolean
  enableTrialPeriod: boolean
  enableRestorePurchases: boolean

  // Analytics
  enableAnalytics: boolean
  enableCrashReporting: boolean

  // Experimental features
  enableExperimentalFeatures: boolean
}

/**
 * Get feature flags based on environment
 */
function getFeatureFlags(): FeatureFlags {
  return {
    // Development features - only in dev
    enableDevDashboard: isDevelopment,
    enableReactotron: isDevelopment,
    enableDebugLogging: isDevelopment,

    // Auth features
    enableSocialAuth: true,
    enableAppleAuth: true,
    enableGoogleAuth: true,
    enableEmailAuth: true,

    // Subscription features
    enableSubscriptions: true,
    enableTrialPeriod: true,
    enableRestorePurchases: true,

    // Analytics - only if configured
    enableAnalytics: !!env.posthogApiKey,
    enableCrashReporting: !!env.sentryDsn,

    // Experimental - only in dev
    enableExperimentalFeatures: isDevelopment,
  }
}

// Export feature flags
export const features = getFeatureFlags()

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return features[feature]
}
