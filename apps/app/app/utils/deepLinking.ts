import { Linking } from "react-native"
import type * as Notifications from "expo-notifications"

// Note: Navigation will be handled by React Navigation in the app
// This file provides utility functions for parsing deep links
// Actual navigation should be done via navigationRef in your navigators

/**
 * Deep link URL scheme
 * Format: zennative://screen/path?param=value
 */
export const DEEP_LINK_SCHEME = "zennative"

/**
 * Parse deep link URL into components
 */
export function parseDeepLink(url: string): {
  screen?: string
  path?: string
  params?: Record<string, string>
} | null {
  try {
    const parsedUrl = new URL(url)

    // Check if it's our scheme
    if (parsedUrl.protocol !== `${DEEP_LINK_SCHEME}:`) {
      return null
    }

    // Extract screen/path
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
    const screen = pathParts[0]
    const path = pathParts.slice(1).join("/")

    // Extract query params
    const params: Record<string, string> = {}
    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return {
      screen,
      path: path || undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
    }
  } catch (error) {
    console.error("[DeepLinking] Error parsing deep link:", error)
    return null
  }
}

/**
 * Handle deep link navigation
 * Returns parsed link data for the app to handle navigation
 */
export function handleDeepLink(url: string): {
  screen: string
  params?: Record<string, string>
} | null {
  const parsed = parseDeepLink(url)

  if (!parsed || !parsed.screen) {
    console.warn("[DeepLinking] Invalid deep link:", url)
    return null
  }

  console.log("[DeepLinking] Parsed deep link:", parsed)

  // Return parsed data for app to handle navigation with React Navigation
  return {
    screen: parsed.screen,
    params: parsed.params,
  }
}

/**
 * Generate deep link URL
 */
export function generateDeepLink(screen: string, params?: Record<string, string>): string {
  let url = `${DEEP_LINK_SCHEME}://${screen}`

  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }

  return url
}

/**
 * Common deep link routes
 */
export const DeepLinkRoutes = {
  // Auth
  RESET_PASSWORD: (token: string) => generateDeepLink("reset-password", { token }),
  VERIFY_EMAIL: (token: string) => generateDeepLink("verify-email", { token }),

  // App screens
  PROFILE: () => generateDeepLink("profile"),
  PAYWALL: () => generateDeepLink("paywall"),
  SETTINGS: () => generateDeepLink("settings"),

  // Referral
  REFERRAL: (code: string) => generateDeepLink("referral", { code }),

  // Share
  SHARE_CONTENT: (id: string) => generateDeepLink("share", { id }),
}

/**
 * Handle deep link from notification
 * Returns parsed link for app to handle navigation
 */
export function handleNotificationDeepLink(response: Notifications.NotificationResponse): {
  screen: string
  params?: Record<string, string>
} | null {
  const data = response.notification.request.content.data

  if (data?.deepLink) {
    // If notification has full deep link URL
    return handleDeepLink(data.deepLink as string)
  } else if (data?.screen) {
    // If notification has screen and params
    return {
      screen: data.screen as string,
      params: data.params as Record<string, string>,
    }
  }

  return null
}

/**
 * Initialize deep linking
 * Pass a callback to handle navigation with React Navigation
 */
export async function initializeDeepLinking(
  onDeepLink?: (linkData: { screen: string; params?: Record<string, string> }) => void,
) {
  // Handle app opened from deep link (app was closed)
  const initialUrl = await Linking.getInitialURL()
  if (initialUrl) {
    console.log("[DeepLinking] App opened with URL:", initialUrl)
    const parsed = handleDeepLink(initialUrl)
    if (parsed && onDeepLink) {
      onDeepLink(parsed)
    }
  }

  // Handle deep links while app is running
  const subscription = Linking.addEventListener("url", ({ url }) => {
    console.log("[DeepLinking] Received URL while running:", url)
    const parsed = handleDeepLink(url)
    if (parsed && onDeepLink) {
      onDeepLink(parsed)
    }
  })

  return subscription
}

/**
 * Deep linking utilities export
 */
export const deepLinking = {
  parse: parseDeepLink,
  handle: handleDeepLink,
  generate: generateDeepLink,
  initialize: initializeDeepLinking,
  handleNotification: handleNotificationDeepLink,
  routes: DeepLinkRoutes,
  scheme: DEEP_LINK_SCHEME,
}
