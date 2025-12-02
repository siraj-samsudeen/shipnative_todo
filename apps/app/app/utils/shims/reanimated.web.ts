/**
 * Web polyfill for React Native Reanimated
 *
 * Reanimated requires _getAnimationTimestamp to be available on the global object.
 * On web, we need to provide this polyfill before Reanimated is imported.
 *
 * This file is automatically resolved only on web platform by Metro's resolver.
 */

// Only set up polyfill on web (check for window to ensure we're in a browser environment)
if (typeof window !== "undefined") {
  // Ensure global exists (it should in React Native Web)
  const globalObj: Record<string, unknown> = typeof global !== "undefined" ? global : window

  // Polyfill _getAnimationTimestamp for Reanimated on web
  // This uses performance.now() which is available in all modern browsers
  if (!globalObj._getAnimationTimestamp) {
    globalObj._getAnimationTimestamp = () => {
      if (typeof performance !== "undefined" && performance.now) {
        return performance.now()
      }
      // Fallback to Date.now() if performance.now() is not available
      return Date.now()
    }
  }
}
