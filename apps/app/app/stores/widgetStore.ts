/**
 * Widget Store
 *
 * Manages widget-related state and preferences.
 * Handles syncing credentials to native widgets for both Supabase and Convex.
 */

import { Platform } from "react-native"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { isConvex } from "@/config/env"
import { features } from "@/config/features"
import { getWidgetConfig } from "@/services/widgets"
import { logger } from "@/utils/Logger"
import { storage } from "@/utils/storage"

// Available widget themes
export type WidgetTheme = "aurora" | "sunset" | "ocean" | "forest" | "midnight" | "minimal"

export const WIDGET_THEMES: { value: WidgetTheme; label: string; description: string }[] = [
  { value: "aurora", label: "Aurora", description: "Deep purple to teal gradient" },
  { value: "sunset", label: "Sunset", description: "Warm orange to pink gradient" },
  { value: "ocean", label: "Ocean", description: "Deep blue to cyan gradient" },
  { value: "forest", label: "Forest", description: "Dark green to mint gradient" },
  { value: "midnight", label: "Midnight", description: "Dark mode with blue accents" },
  { value: "minimal", label: "Minimal", description: "Clean white with blue accents" },
]

export interface WidgetState {
  // Whether widgets are enabled in the app
  isWidgetsEnabled: boolean

  // Whether user has enabled widgets in settings
  userWidgetsEnabled: boolean

  // Selected widget theme
  selectedTheme: WidgetTheme

  // Last sync timestamp
  lastSyncedAt: string | null

  // Sync status
  syncStatus: "idle" | "syncing" | "success" | "error"

  // Error message if any
  syncError: string | null

  // Actions
  toggleWidgets: () => Promise<void>
  syncWidgetCredentials: () => Promise<void>
  clearWidgetData: () => Promise<void>
  setTheme: (theme: WidgetTheme) => Promise<void>
}

/**
 * Write backend credentials to shared storage for native widgets
 * Supports both Supabase and Convex backends
 */
async function writeWidgetCredentials(theme: WidgetTheme = "aurora"): Promise<void> {
  const config = getWidgetConfig()

  try {
    // Store backend type so native widgets know which API to use
    storage.set("widget_backend_type", isConvex ? "convex" : "supabase")
    storage.set("widget_is_mock", config.isMock.toString())

    // Store selected theme for native widgets
    storage.set("widget_theme", theme)

    if (isConvex) {
      // Convex: Store Convex URL for HTTP endpoint access
      // Native widgets will call /api/widgets/* endpoints
      storage.set("convex_url", config.convexUrl || "")
      // Clear Supabase keys if present
      storage.delete("supabase_url")
      storage.delete("supabase_key")
      logger.info(
        `Widget credentials written to storage (${Platform.OS}) - Convex, theme: ${theme}`,
      )
    } else {
      // Supabase: Store URL and anon key for REST API access
      storage.set("supabase_url", config.supabaseUrl)
      storage.set("supabase_key", config.supabaseKey)
      // Clear Convex URL if present
      storage.delete("convex_url")
      logger.info(
        `Widget credentials written to storage (${Platform.OS}) - Supabase, theme: ${theme}`,
      )
    }
  } catch (error) {
    logger.error(`Failed to write widget credentials (${Platform.OS})`, { error })
    throw error
  }
}

/**
 * Clear widget credentials from shared storage
 */
async function clearWidgetCredentials(): Promise<void> {
  try {
    // Clear all possible widget credentials
    storage.delete("widget_backend_type")
    storage.delete("supabase_url")
    storage.delete("supabase_key")
    storage.delete("convex_url")
    storage.delete("widget_is_mock")
    storage.delete("widget_theme")
    logger.info("Widget credentials cleared from storage")
  } catch (error) {
    logger.error("Failed to clear widget credentials", { error })
    throw error
  }
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      isWidgetsEnabled: features.enableWidgets,
      userWidgetsEnabled: false,
      selectedTheme: "aurora" as WidgetTheme,
      lastSyncedAt: null,
      syncStatus: "idle",
      syncError: null,

      toggleWidgets: async () => {
        const { userWidgetsEnabled, selectedTheme } = get()
        const newValue = !userWidgetsEnabled

        set({ syncStatus: "syncing", syncError: null })

        try {
          if (newValue) {
            // Enable widgets - sync credentials
            await writeWidgetCredentials(selectedTheme)
            set({
              userWidgetsEnabled: true,
              lastSyncedAt: new Date().toISOString(),
              syncStatus: "success",
            })
            logger.info("Widgets enabled")
          } else {
            // Disable widgets - clear credentials
            await clearWidgetCredentials()
            set({
              userWidgetsEnabled: false,
              lastSyncedAt: null,
              syncStatus: "success",
            })
            logger.info("Widgets disabled")
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({
            syncStatus: "error",
            syncError: errorMessage,
          })
          logger.error("Failed to toggle widgets", { error })
        }
      },

      syncWidgetCredentials: async () => {
        const { userWidgetsEnabled, selectedTheme } = get()

        if (!userWidgetsEnabled) {
          logger.debug("Widgets not enabled, skipping sync")
          return
        }

        set({ syncStatus: "syncing", syncError: null })

        try {
          await writeWidgetCredentials(selectedTheme)
          set({
            lastSyncedAt: new Date().toISOString(),
            syncStatus: "success",
          })
          logger.info("Widget credentials synced")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({
            syncStatus: "error",
            syncError: errorMessage,
          })
          logger.error("Failed to sync widget credentials", { error })
        }
      },

      clearWidgetData: async () => {
        set({ syncStatus: "syncing", syncError: null })

        try {
          await clearWidgetCredentials()
          set({
            userWidgetsEnabled: false,
            lastSyncedAt: null,
            syncStatus: "success",
          })
          logger.info("Widget data cleared")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({
            syncStatus: "error",
            syncError: errorMessage,
          })
          logger.error("Failed to clear widget data", { error })
        }
      },

      setTheme: async (theme: WidgetTheme) => {
        const { userWidgetsEnabled } = get()

        set({ selectedTheme: theme })

        // If widgets are enabled, sync the new theme immediately
        if (userWidgetsEnabled) {
          set({ syncStatus: "syncing", syncError: null })

          try {
            await writeWidgetCredentials(theme)
            set({
              lastSyncedAt: new Date().toISOString(),
              syncStatus: "success",
            })
            logger.info(`Widget theme changed to ${theme}`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            set({
              syncStatus: "error",
              syncError: errorMessage,
            })
            logger.error("Failed to update widget theme", { error })
          }
        }
      },
    }),
    {
      name: "widget-storage",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
      partialize: (state) => ({
        userWidgetsEnabled: state.userWidgetsEnabled,
        selectedTheme: state.selectedTheme,
        lastSyncedAt: state.lastSyncedAt,
      }),
    },
  ),
)
