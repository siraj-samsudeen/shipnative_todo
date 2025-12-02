/**
 * Sentry Error Tracking Service
 *
 * Handles error tracking and performance monitoring across web and mobile platforms.
 * Falls back to mock service when DSN is missing.
 */

import { Platform } from "react-native"

import type {
  ErrorTrackingService,
  ErrorTrackingConfig,
  ErrorContext,
  UserContext,
  Breadcrumb,
  ErrorLevel,
} from "../types/errorTracking"
import { mockSentry } from "./mocks/sentry"

// Sentry SDKs (platform-specific)
let SentryRN: any = null // React Native

// Load Sentry SDK based on platform
// Note: Web SDK (@sentry/react) is currently disabled due to React 19 compatibility issues
// See: https://github.com/getsentry/sentry-javascript/issues/...
if (Platform.OS !== "web") {
  try {
    SentryRN = require("@sentry/react-native")
  } catch (e) {
    console.warn("Failed to load @sentry/react-native", e)
  }
} else if (__DEV__) {
  console.warn("⚠️  Sentry web SDK disabled - React 19 not yet supported")
  console.log("💡 Error tracking on web will use mock implementation")
}

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || ""

// Use mock if DSN is missing in development
const useMock = __DEV__ && !dsn

class SentryService implements ErrorTrackingService {
  platform = "sentry" as const
  private initialized = false
  private Sentry: any = null

  initialize(config: ErrorTrackingConfig): void {
    if (this.initialized) return

    const sentryDsn = config.dsn || dsn

    if (!sentryDsn) {
      console.warn("Sentry DSN not provided")
      return
    }

    // Web platform is not supported yet (React 19 compatibility)
    if (Platform.OS === "web") {
      if (__DEV__) {
        console.warn("🐛 [Sentry] Web platform not supported - using mock implementation")
      }
      return
    }

    // Initialize Sentry for React Native (iOS/Android)
    if (!SentryRN) {
      console.warn("Sentry React Native SDK not available")
      return
    }

    try {
      SentryRN.init({
        dsn: sentryDsn,
        environment: config.environment || (__DEV__ ? "development" : "production"),
        release: config.release,
        dist: config.dist,
        enableInExpoDevelopment: config.enableInDevelopment ?? false,
        tracesSampleRate: config.tracesSampleRate ?? 1.0,
        beforeSend: config.beforeSend,
      })

      this.Sentry = SentryRN
      this.initialized = true

      if (__DEV__) {
        console.log("🐛 [Sentry] Initialized for mobile")
      }
    } catch (error) {
      console.error("Failed to initialize Sentry:", error)
    }
  }

  captureException(error: Error, context?: ErrorContext): string | undefined {
    if (!this.Sentry) return undefined

    try {
      return this.Sentry.captureException(error, {
        tags: context?.tags,
        extra: context?.extra,
        level: context?.level,
        fingerprint: context?.fingerprint,
        user: context?.user,
      })
    } catch (err) {
      console.error("Sentry captureException error:", err)
      return undefined
    }
  }

  captureMessage(message: string, level?: ErrorLevel, context?: ErrorContext): string | undefined {
    if (!this.Sentry) return undefined

    try {
      return this.Sentry.captureMessage(message, {
        level: level || "info",
        tags: context?.tags,
        extra: context?.extra,
        fingerprint: context?.fingerprint,
        user: context?.user,
      })
    } catch (error) {
      console.error("Sentry captureMessage error:", error)
      return undefined
    }
  }

  setUser(user: UserContext | null): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setUser(user)

      if (__DEV__ && user) {
        console.log("🐛 [Sentry] Set user:", user.id || user.email)
      }
    } catch (error) {
      console.error("Sentry setUser error:", error)
    }
  }

  setContext(key: string, value: any): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setContext(key, value)
    } catch (error) {
      console.error("Sentry setContext error:", error)
    }
  }

  setTag(key: string, value: string): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setTag(key, value)
    } catch (error) {
      console.error("Sentry setTag error:", error)
    }
  }

  setTags(tags: Record<string, string>): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setTags(tags)
    } catch (error) {
      console.error("Sentry setTags error:", error)
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setExtra(key, value)
    } catch (error) {
      console.error("Sentry setExtra error:", error)
    }
  }

  setExtras(extras: Record<string, any>): void {
    if (!this.Sentry) return

    try {
      this.Sentry.setExtras(extras)
    } catch (error) {
      console.error("Sentry setExtras error:", error)
    }
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.Sentry) return

    try {
      this.Sentry.addBreadcrumb({
        type: breadcrumb.type,
        category: breadcrumb.category,
        message: breadcrumb.message,
        data: breadcrumb.data,
        level: breadcrumb.level,
        timestamp: breadcrumb.timestamp,
      })
    } catch (error) {
      console.error("Sentry addBreadcrumb error:", error)
    }
  }

  withScope(callback: (scope: any) => void): void {
    if (!this.Sentry) return

    try {
      this.Sentry.withScope(callback)
    } catch (error) {
      console.error("Sentry withScope error:", error)
    }
  }

  startTransaction(name: string, op?: string): any {
    if (!this.Sentry) return null

    try {
      return this.Sentry.startTransaction({
        name,
        op: op || "custom",
      })
    } catch (error) {
      console.error("Sentry startTransaction error:", error)
      return null
    }
  }

  async close(timeout?: number): Promise<boolean> {
    if (!this.Sentry) return true

    try {
      return await this.Sentry.close(timeout)
    } catch (error) {
      console.error("Sentry close error:", error)
      return false
    }
  }
}

// Export singleton instance
export const sentry: ErrorTrackingService = useMock ? mockSentry : new SentryService()

// Export initialization function
export const initSentry = () => {
  if (useMock) {
    if (__DEV__) {
      console.warn("⚠️  Sentry DSN not found - using mock error tracking")
      console.log("💡 Add EXPO_PUBLIC_SENTRY_DSN to .env to use real Sentry")
    }
    return
  }

  sentry.initialize({
    dsn,
    environment: __DEV__ ? "development" : "production",
    enableInDevelopment: false,
  })
}

if (useMock && __DEV__) {
  console.warn("⚠️  Sentry running in mock mode")
}
