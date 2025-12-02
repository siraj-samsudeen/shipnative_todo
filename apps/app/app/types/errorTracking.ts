/**
 * Platform-agnostic error tracking types
 *
 * These types provide a unified interface for error tracking services
 * across different platforms and providers (Sentry, etc.)
 */

export type ErrorTrackingPlatform = "sentry" | "mock"

export type ErrorLevel = "fatal" | "error" | "warning" | "info" | "debug"

export type BreadcrumbType =
  | "default"
  | "debug"
  | "error"
  | "navigation"
  | "http"
  | "info"
  | "query"
  | "transaction"
  | "ui"
  | "user"

export interface UserContext {
  id?: string
  email?: string
  username?: string
  ip_address?: string
  [key: string]: any
}

export interface ErrorContext {
  tags?: Record<string, string>
  extra?: Record<string, any>
  level?: ErrorLevel
  fingerprint?: string[]
  user?: UserContext
}

export interface Breadcrumb {
  type?: BreadcrumbType
  category?: string
  message?: string
  data?: Record<string, any>
  level?: ErrorLevel
  timestamp?: number
}

export interface ErrorTrackingConfig {
  dsn: string
  environment?: string
  release?: string
  dist?: string
  enableInDevelopment?: boolean
  tracesSampleRate?: number
  beforeSend?: (event: any) => any | null
}

export interface ErrorTrackingService {
  platform: ErrorTrackingPlatform

  // Initialization
  initialize(config: ErrorTrackingConfig): void

  // Error capturing
  captureException(error: Error, context?: ErrorContext): string | undefined
  captureMessage(message: string, level?: ErrorLevel, context?: ErrorContext): string | undefined

  // User context
  setUser(user: UserContext | null): void

  // Context
  setContext(key: string, value: any): void
  setTag(key: string, value: string): void
  setTags(tags: Record<string, string>): void
  setExtra(key: string, value: any): void
  setExtras(extras: Record<string, any>): void

  // Breadcrumbs
  addBreadcrumb(breadcrumb: Breadcrumb): void

  // Scope management
  withScope?(callback: (scope: any) => void): void

  // Performance monitoring
  startTransaction?(name: string, op?: string): any

  // Utility
  close?(timeout?: number): Promise<boolean>
}

/**
 * Helper to create error context
 */
export function createErrorContext(
  tags?: Record<string, string>,
  extra?: Record<string, any>,
  level?: ErrorLevel,
): ErrorContext {
  return {
    tags,
    extra,
    level,
  }
}

/**
 * Helper to create breadcrumb
 */
export function createBreadcrumb(
  message: string,
  category?: string,
  type?: BreadcrumbType,
  data?: Record<string, any>,
): Breadcrumb {
  return {
    message,
    category,
    type: type || "default",
    data,
    timestamp: Date.now() / 1000,
  }
}

/**
 * Standard error tags
 */
export const ErrorTags = {
  COMPONENT: "component",
  SCREEN: "screen",
  ACTION: "action",
  PLATFORM: "platform",
  ENVIRONMENT: "environment",
} as const

/**
 * Standard breadcrumb categories
 */
export const BreadcrumbCategories = {
  AUTH: "auth",
  NAVIGATION: "navigation",
  API: "api",
  UI: "ui",
  SUBSCRIPTION: "subscription",
  USER_ACTION: "user.action",
} as const
