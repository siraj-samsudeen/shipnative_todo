/**
 * Widget Service - Backend-Agnostic
 *
 * This file conditionally exports the correct widget service based on your backend:
 * - Supabase: Uses Supabase REST API for widget data (widgets.supabase.ts)
 * - Convex: Uses Convex HTTP endpoints for widget data (widgets.convex.ts)
 *
 * Native widgets (iOS/Android) use HTTP endpoints to fetch data:
 * - Supabase: Direct REST API calls with Supabase URL/Key
 * - Convex: HTTP endpoint at /api/widgets/* with auth token
 *
 * HOW TO USE:
 * 1. Look at the version for your backend (.supabase.ts or .convex.ts)
 * 2. Use fetchWidgetData() for fetching widget data
 * 3. Use getWidgetConfig() to get config for native widgets
 *
 * KEY DIFFERENCES:
 * - Supabase: REST API with anon key, direct table access
 * - Convex: HTTP action endpoints, token-based auth
 */

import { isConvex } from "@/config/env"

// Conditional export based on backend provider
// This ensures tree-shaking removes the unused version in production

// eslint-disable-next-line @typescript-eslint/no-require-imports
const widgetService = isConvex
  ? require("./widgets.convex")
  : require("./widgets.supabase")

export const fetchWidgetData = widgetService.fetchWidgetData
export const clearWidgetCache = widgetService.clearWidgetCache
export const getWidgetConfig = widgetService.getWidgetConfig
export const validateWidgetData = widgetService.validateWidgetData

// Re-export types for TypeScript
export type { WidgetCache } from "./widgets.supabase"
