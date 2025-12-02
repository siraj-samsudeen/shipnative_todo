/**
 * PostHog Analytics Service
 *
 * Handles analytics tracking across web and mobile platforms.
 * Falls back to mock service when API key is missing or on unsupported platforms.
 */

import { Platform } from "react-native"

import type {
  AnalyticsService,
  AnalyticsConfig,
  EventProperties,
  UserProperties,
  ScreenProperties,
  GroupProperties,
} from "../types/analytics"
import { MockPostHog } from "./mocks/posthog"

// PostHog SDKs (platform-specific)
let PostHogRN: any = null // React Native
let PostHogJS: any = null // Web

// Load appropriate SDK based on platform
if (Platform.OS === "web") {
  try {
    PostHogJS = require("posthog-js")
  } catch (e) {
    console.warn("Failed to load posthog-js", e)
  }
} else {
  try {
    const module = require("posthog-react-native")
    PostHogRN = module.default || module.PostHog
  } catch (e) {
    console.warn("Failed to load posthog-react-native", e)
  }
}

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || ""
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"

// Use mock if API key is missing in development
const useMock = __DEV__ && !apiKey

class PostHogService implements AnalyticsService {
  platform = "posthog" as const
  private client: any = null
  private initialized = false

  async initialize(config?: AnalyticsConfig): Promise<void> {
    if (this.initialized) return

    const key = config?.apiKey || apiKey
    const apiHost = config?.host || host

    if (!key) {
      console.warn("PostHog API key not provided")
      return
    }

    try {
      if (Platform.OS === "web" && PostHogJS) {
        // Initialize PostHog for web
        PostHogJS.init(key, {
          api_host: apiHost,
          autocapture: config?.captureClicks ?? true,
          capture_pageview: config?.captureScreens ?? true,
          loaded: (posthog: any) => {
            this.client = posthog
            this.initialized = true
            if (__DEV__) {
              console.log("📊 [PostHog] Initialized for web")
            }
          },
        })
      } else if (PostHogRN) {
        // Initialize PostHog for React Native
        this.client = new PostHogRN(key, { host: apiHost })
        this.initialized = true
        if (__DEV__) {
          console.log("📊 [PostHog] Initialized for mobile")
        }
      }
    } catch (error) {
      console.error("Failed to initialize PostHog:", error)
    }
  }

  track(event: string, properties?: EventProperties): void {
    if (!this.client) return

    try {
      if (Platform.OS === "web") {
        this.client.capture(event, properties)
      } else {
        this.client.capture(event, properties)
      }

      if (__DEV__) {
        console.log(`📊 [PostHog] Event: ${event}`, properties || {})
      }
    } catch (error) {
      console.error("PostHog track error:", error)
    }
  }

  screen(name: string, properties?: ScreenProperties): void {
    if (!this.client) return

    try {
      if (Platform.OS === "web") {
        this.client.capture("$pageview", {
          $current_url: name,
          ...properties,
        })
      } else {
        this.client.screen(name, properties)
      }

      if (__DEV__) {
        console.log(`📊 [PostHog] Screen: ${name}`, properties || {})
      }
    } catch (error) {
      console.error("PostHog screen error:", error)
    }
  }

  identify(userId: string, properties?: UserProperties): void {
    if (!this.client) return

    try {
      this.client.identify(userId, properties)

      if (__DEV__) {
        console.log(`📊 [PostHog] Identify: ${userId}`, properties || {})
      }
    } catch (error) {
      console.error("PostHog identify error:", error)
    }
  }

  reset(): void {
    if (!this.client) return

    try {
      this.client.reset()

      if (__DEV__) {
        console.log("📊 [PostHog] Reset user")
      }
    } catch (error) {
      console.error("PostHog reset error:", error)
    }
  }

  setUserProperties(properties: UserProperties): void {
    if (!this.client) return

    try {
      // PostHog uses setPersonProperties for both web and mobile
      this.client.setPersonProperties(properties)

      if (__DEV__) {
        console.log("📊 [PostHog] Set user properties:", properties)
      }
    } catch (error) {
      console.error("PostHog setUserProperties error:", error)
    }
  }

  group(type: string, id: string, properties?: GroupProperties): void {
    if (!this.client) return

    try {
      this.client.group(type, id, properties)

      if (__DEV__) {
        console.log(`📊 [PostHog] Group: ${type}:${id}`, properties || {})
      }
    } catch (error) {
      console.error("PostHog group error:", error)
    }
  }

  isFeatureEnabled(flag: string): boolean {
    if (!this.client) return false

    try {
      return this.client.isFeatureEnabled(flag) ?? false
    } catch (error) {
      console.error("PostHog isFeatureEnabled error:", error)
      return false
    }
  }

  getFeatureFlag(flag: string): any {
    if (!this.client) return undefined

    try {
      return this.client.getFeatureFlag(flag)
    } catch (error) {
      console.error("PostHog getFeatureFlag error:", error)
      return undefined
    }
  }

  onFeatureFlags(callback: (flags: Record<string, any>) => void): void {
    if (!this.client) return

    try {
      this.client.onFeatureFlags(callback)
    } catch (error) {
      console.error("PostHog onFeatureFlags error:", error)
    }
  }

  optIn(): void {
    if (!this.client) return

    try {
      this.client.optIn()

      if (__DEV__) {
        console.log("📊 [PostHog] Opted in to tracking")
      }
    } catch (error) {
      console.error("PostHog optIn error:", error)
    }
  }

  optOut(): void {
    if (!this.client) return

    try {
      this.client.optOut()

      if (__DEV__) {
        console.log("📊 [PostHog] Opted out of tracking")
      }
    } catch (error) {
      console.error("PostHog optOut error:", error)
    }
  }

  async flush(): Promise<void> {
    if (!this.client) return

    try {
      await this.client.flush?.()

      if (__DEV__) {
        console.log("📊 [PostHog] Flushed events")
      }
    } catch (error) {
      console.error("PostHog flush error:", error)
    }
  }

  async shutdown(): Promise<void> {
    if (!this.client) return

    try {
      await this.client.shutdown?.()
      this.initialized = false

      if (__DEV__) {
        console.log("📊 [PostHog] Shutdown")
      }
    } catch (error) {
      console.error("PostHog shutdown error:", error)
    }
  }
}

// Export singleton instance
export const posthog: AnalyticsService = useMock
  ? new MockPostHog({ apiKey: "mock-key", host })
  : new PostHogService()

// Export initialization function
export const initPosthog = async () => {
  if (useMock) {
    if (__DEV__) {
      console.warn("⚠️  PostHog API key not found - using mock analytics")
      console.log("💡 Add EXPO_PUBLIC_POSTHOG_API_KEY to .env to use real PostHog")
    }
    return
  }

  await posthog.initialize({ apiKey, host })
}

if (useMock && __DEV__) {
  console.warn("⚠️  PostHog running in mock mode")
}
