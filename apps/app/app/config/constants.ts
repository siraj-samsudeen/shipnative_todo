/**
 * App Constants
 *
 * Centralized constants used throughout the app
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PREFERENCES: "user_preferences",
  ONBOARDING_COMPLETED: "onboarding_completed",
  THEME_MODE: "theme_mode",
} as const

/**
 * Navigation Routes
 */
export const ROUTES = {
  // Auth
  ONBOARDING: "Onboarding",
  WELCOME: "Welcome",
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",

  // Main
  STARTER: "Starter",
  PROFILE: "Profile",
  PAYWALL: "Paywall",
  SETTINGS: "Settings",

  // Dev
  DEMO: "Demo",
} as const

/**
 * Analytics Events
 */
export const ANALYTICS_EVENTS = {
  // Auth
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  SIGN_OUT: "sign_out",
  FORGOT_PASSWORD: "forgot_password",

  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_SKIPPED: "onboarding_skipped",

  // Subscription
  PAYWALL_VIEWED: "paywall_viewed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_COMPLETED: "subscription_completed",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  RESTORE_PURCHASES: "restore_purchases",

  // Errors
  ERROR_OCCURRED: "error_occurred",
  API_ERROR: "api_error",
  NETWORK_ERROR: "network_error",
} as const

/**
 * Subscription Tiers
 */
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
} as const

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  AUTH_ERROR: "Authentication failed. Please try again.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
} as const

/**
 * Timing Constants
 */
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  SPLASH_SCREEN_DELAY: 1000,
} as const

/**
 * Validation Rules
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

/**
 * UI Constants
 */
export const UI = {
  MAX_CONTENT_WIDTH: 600,
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
} as const
