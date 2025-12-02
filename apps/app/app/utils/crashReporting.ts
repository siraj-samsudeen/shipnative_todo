/**
 * If you're using Sentry
 *   Expo https://docs.expo.dev/guides/using-sentry/
 */
// import * as Sentry from "@sentry/react-native"

/**
 * If you're using Crashlytics: https://rnfirebase.io/crashlytics/usage
 */
// import crashlytics from "@react-native-firebase/crashlytics"

/**
 * If you're using Bugsnag:
 *   RN   https://docs.bugsnag.com/platforms/react-native/)
 *   Expo https://docs.bugsnag.com/platforms/react-native/expo/
 */
// import Bugsnag from "@bugsnag/react-native"
// import Bugsnag from "@bugsnag/expo"

/**
 *  This is where you put your crash reporting service initialization code to call in `./app/app.tsx`
 */
export const initCrashReporting = () => {
  // Sentry.init({
  //   dsn: "YOUR DSN HERE",
  //   debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  // })
  // Bugsnag.start("YOUR API KEY")
}

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch where defined using Reactotron.tron.error.
   */
  HANDLED = "Handled",
}

/**
 * Manually report a handled error.
 */
export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    // Log to console and Reactotron in development
    const message = error.message || "Unknown"
    console.error(error)
    console.log(message, type)
  } else {
    // In production, utilize crash reporting service of choice below:
    // RN
    // Sentry.captureException(error)
    // crashlytics().recordError(error)
    // Bugsnag.notify(error)
  }
}

/**
 * Capture an exception with optional context
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
  },
) => {
  if (__DEV__) {
    console.error("Exception captured:", error)
    if (context) {
      console.log("Context:", context)
    }
  } else {
    // In production, send to crash reporting service
    // Sentry.captureException(error, {
    //   tags: context?.tags,
    //   extra: context?.extra,
    // })
  }
}

/**
 * Capture a message with optional context
 */
export const captureMessage = (
  message: string,
  context?: {
    level?: "fatal" | "error" | "warning" | "info" | "debug"
    tags?: Record<string, string>
    extra?: Record<string, any>
  },
) => {
  if (__DEV__) {
    console.log(`Message captured [${context?.level || "info"}]:`, message)
    if (context) {
      console.log("Context:", context)
    }
  } else {
    // In production, send to crash reporting service
    // Sentry.captureMessage(message, {
    //   level: context?.level || 'info',
    //   tags: context?.tags,
    //   extra: context?.extra,
    // })
  }
}
