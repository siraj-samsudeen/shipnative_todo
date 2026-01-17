/**
 * Native Convex Provider
 *
 * Provides the Convex client and auth context to the app.
 * Uses ConvexAuthProvider for native Convex Auth integration.
 *
 * This provider is the recommended way to use Convex in your app.
 * It provides:
 * - Reactive data subscriptions via useQuery
 * - Type-safe mutations via useMutation
 * - Native auth state via useConvexAuth
 * - Secure token storage for React Native
 */

import { type ReactNode, useMemo } from "react"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ConvexReactClient } from "convex/react"

import { env } from "../config/env"
import { logger } from "../utils/Logger"
import { webSecureStorage } from "../utils/webStorageEncryption"

// ============================================================================
// Configuration
// ============================================================================

const convexUrl = env.convexUrl ?? ""

// ============================================================================
// Secure Storage Implementation
// ============================================================================

/**
 * Secure storage adapter for Convex Auth
 *
 * - iOS: Uses Keychain via expo-secure-store
 * - Android: Uses EncryptedSharedPreferences via expo-secure-store
 * - Web: Uses encrypted localStorage
 */
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return webSecureStorage.getItem(key)
      }
      return await SecureStore.getItemAsync(key, {
        keychainService: "shipnativeapp.convex",
        ...(Platform.OS === "ios" && {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }),
      })
    } catch (error) {
      logger.error("Failed to get item from secure storage", { key }, error as Error)
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.setItem(key, value)
        return
      }
      await SecureStore.setItemAsync(key, value, {
        keychainService: "shipnativeapp.convex",
        ...(Platform.OS === "ios" && {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }),
      })
    } catch (error) {
      logger.error("Failed to set item in secure storage", { key }, error as Error)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        webSecureStorage.removeItem(key)
        return
      }
      await SecureStore.deleteItemAsync(key, {
        keychainService: "shipnativeapp.convex",
      })
    } catch (error) {
      logger.error("Failed to remove item from secure storage", { key }, error as Error)
    }
  },
}

// ============================================================================
// Client Singleton
// ============================================================================

let convexClient: ConvexReactClient | null = null

/**
 * Get or create the Convex client singleton
 *
 * @throws Error if EXPO_PUBLIC_CONVEX_URL is not configured
 */
export function getConvexClient(): ConvexReactClient {
  if (convexClient) {
    return convexClient
  }

  if (!convexUrl) {
    const errorMessage = [
      "EXPO_PUBLIC_CONVEX_URL is not configured.",
      "",
      "To use Convex backend:",
      "1. Run: npx convex dev",
      "2. Add to apps/app/.env: EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210",
      "",
      "Or switch to Supabase: EXPO_PUBLIC_BACKEND_PROVIDER=supabase",
    ].join("\n")

    logger.error(errorMessage)
    throw new Error(errorMessage)
  }

  convexClient = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false, // Disable for React Native
  })

  return convexClient
}

/**
 * Destroy the Convex client
 */
export function destroyConvexClient(): void {
  if (convexClient && typeof convexClient.close === "function") {
    convexClient.close()
  }
  convexClient = null
}

// ============================================================================
// Provider Component
// ============================================================================

interface ConvexProviderProps {
  children: ReactNode
}

/**
 * ConvexProvider - Root provider for Convex
 *
 * Wraps your app with ConvexAuthProvider to enable:
 * - Reactive queries with useQuery
 * - Type-safe mutations with useMutation
 * - Native auth with useConvexAuth and useAuthActions
 *
 * @example
 * ```tsx
 * // In your app entry point
 * import { ConvexProvider } from "@/providers/ConvexProvider"
 *
 * export default function App() {
 *   return (
 *     <ConvexProvider>
 *       <YourApp />
 *     </ConvexProvider>
 *   )
 * }
 * ```
 */
export function ConvexProvider({ children }: ConvexProviderProps): React.ReactElement {
  // Get or create client (memoized to prevent recreating on re-renders)
  // Must be called unconditionally to satisfy React's rules of hooks
  const client = useMemo(() => (convexUrl ? getConvexClient() : null), [])

  // Use platform-specific storage
  // On web, we let Convex Auth use its default storage
  // On mobile, we use secure storage
  const storage = Platform.OS === "android" || Platform.OS === "ios" ? secureStorage : undefined

  // Check if Convex URL is configured before trying to create client
  if (!convexUrl || !client) {
    return <ConvexConfigError />
  }

  return (
    <ConvexAuthProvider client={client} storage={storage}>
      {children}
    </ConvexAuthProvider>
  )
}

// ============================================================================
// Config Error Component
// ============================================================================

function ConvexConfigError(): React.ReactElement {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: "#1a1a2e",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: 24,
    },
    icon: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: "#fff",
      marginBottom: 12,
      textAlign: "center" as const,
    },
    message: {
      fontSize: 14,
      color: "#a0a0a0",
      textAlign: "center" as const,
      marginBottom: 24,
      lineHeight: 22,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    step: {
      backgroundColor: "#2a2a4e",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      width: "100%" as const,
      maxWidth: 400,
    },
    stepNumber: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: "#6366f1",
      marginBottom: 4,
    },
    stepText: {
      fontSize: 14,
      color: "#e0e0e0",
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    or: {
      fontSize: 14,
      color: "#666",
      marginVertical: 16,
    },
    link: {
      color: "#6366f1",
      textDecorationLine: "underline" as const,
    },
  }

  // Inline require to avoid issues with module loading order
  const { View, Text, Linking } = require("react-native")

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.title}>Convex Not Configured</Text>
      <Text style={styles.message}>
        You&apos;ve set EXPO_PUBLIC_BACKEND_PROVIDER=convex{"\n"}
        but EXPO_PUBLIC_CONVEX_URL is missing.
      </Text>

      <View style={styles.step}>
        <Text style={styles.stepNumber}>STEP 1 - Start Convex dev server</Text>
        <Text style={styles.stepText}>npx convex dev</Text>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepNumber}>STEP 2 - Add to apps/app/.env</Text>
        <Text style={styles.stepText}>EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210</Text>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepNumber}>STEP 3 - Restart the app</Text>
        <Text style={styles.stepText}>Stop and re-run: yarn app:ios</Text>
      </View>

      <Text style={styles.or}>— or switch to Supabase —</Text>

      <View style={styles.step}>
        <Text style={styles.stepNumber}>In apps/app/.env</Text>
        <Text style={styles.stepText}>EXPO_PUBLIC_BACKEND_PROVIDER=supabase</Text>
      </View>

      <Text
        style={[styles.message, styles.link]}
        onPress={() => Linking.openURL("https://docs.convex.dev/quickstart")}
      >
        View Convex Docs →
      </Text>
    </View>
  )
}
