// Ensure the gesture handler native module is registered before React Native loads
// This however is needed at the moment
// https://github.com/software-mansion/react-native-gesture-handler/issues/2402
import "setimmediate"

const isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative"

if (isReactNative) {
  require("react-native-gesture-handler")

  try {
    const ReactNative = require("react-native")
    const { SafeAreaView } = require("react-native-safe-area-context")
    const descriptor = Object.getOwnPropertyDescriptor(ReactNative, "SafeAreaView")

    if (descriptor?.configurable && SafeAreaView) {
      Object.defineProperty(ReactNative, "SafeAreaView", {
        configurable: true,
        enumerable: descriptor.enumerable ?? true,
        get() {
          return SafeAreaView
        },
      })
    }
  } catch (error) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("Failed to patch SafeAreaView", error)
    }
  }
}
