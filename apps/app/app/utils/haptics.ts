/**
 * Haptics Utility
 *
 * Provides haptic feedback for interactive elements.
 * Gracefully handles platforms where haptics are not available (web).
 */

import { Platform } from "react-native"
import * as Haptics from "expo-haptics"

/**
 * Check if haptics are available on this platform
 */
const isHapticsAvailable = Platform.OS === "ios" || Platform.OS === "android"

/**
 * Impact feedback styles for different interaction types
 */
export const hapticImpact = {
  /**
   * Light impact - for small UI elements like toggles, checkboxes
   */
  light: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Medium impact - for standard buttons and selections
   */
  medium: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Heavy impact - for significant actions like confirming or deleting
   */
  heavy: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Soft impact - for subtle feedback
   */
  soft: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Rigid impact - for snappy feedback
   */
  rigid: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },
}

/**
 * Notification feedback for system-level feedback
 */
export const hapticNotification = {
  /**
   * Success notification - for successful actions
   */
  success: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Warning notification - for warnings
   */
  warning: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },

  /**
   * Error notification - for errors
   */
  error: () => {
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      } catch {
        // Silently fail if haptics are not available
      }
    }
  },
}

/**
 * Selection feedback - for selection changes
 */
export const hapticSelection = () => {
  if (isHapticsAvailable) {
    try {
      Haptics.selectionAsync()
    } catch (_error) {
      console.warn("Haptics.selectionAsync not available:", _error)
    }
  }
}

/**
 * Pre-configured haptic presets for common interactions
 */
export const haptics = {
  // Button presses
  buttonPress: hapticImpact.medium,
  buttonPressLight: hapticImpact.light,
  buttonPressHeavy: hapticImpact.heavy,

  // Tab bar and navigation
  tabPress: hapticImpact.light,
  navigationPress: hapticImpact.light,

  // Toggles and switches
  toggleOn: hapticImpact.light,
  toggleOff: hapticImpact.soft,
  switchChange: hapticSelection,

  // Selection
  selection: hapticSelection,
  listItemPress: hapticImpact.light,
  cardPress: hapticImpact.light,

  // Status
  success: hapticNotification.success,
  warning: hapticNotification.warning,
  error: hapticNotification.error,

  // Gestures
  longPress: hapticImpact.heavy,
  swipe: hapticImpact.soft,
  pull: hapticImpact.rigid,

  // Special
  refresh: hapticImpact.rigid,
  delete: hapticNotification.warning,
  confirm: hapticNotification.success,
}
