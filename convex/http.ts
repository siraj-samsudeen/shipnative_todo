/**
 * Convex HTTP Routes
 *
 * This file exposes HTTP endpoints required for authentication,
 * including OAuth callbacks and JWT verification.
 *
 * Required endpoints exposed:
 * - /.well-known/openid-configuration (OpenID Connect discovery)
 * - /.well-known/jwks.json (JWT Web Key Set)
 * - /api/auth/signin/* (OAuth sign-in)
 * - /api/auth/callback/* (OAuth callback)
 * - /api/widgets/* (Widget data endpoints)
 */

import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { auth } from "./auth"
import { revenueCatWebhookHandler } from "./webhooks"

const http = httpRouter()

// Add authentication HTTP routes (OAuth callbacks, JWKS, etc.)
auth.addHttpRoutes(http)

// ============================================================================
// Webhook Endpoints
// External services (RevenueCat, etc.) send events here
// ============================================================================

/**
 * RevenueCat webhook endpoint
 * POST /api/webhooks/revenuecat
 *
 * Configure in RevenueCat Dashboard:
 * Project Settings → Integrations → Webhooks
 * URL: https://your-project.convex.site/api/webhooks/revenuecat
 */
http.route({
  path: "/api/webhooks/revenuecat",
  method: "POST",
  handler: revenueCatWebhookHandler,
})

// ============================================================================
// Widget HTTP Endpoints
// Native iOS/Android widgets call these endpoints to fetch data
// ============================================================================

/**
 * Widget data endpoint
 * GET /api/widgets/data?table=profiles&limit=1
 *
 * Headers required:
 * - Authorization: Bearer <convex-auth-token>
 */
http.route({
  path: "/api/widgets/data",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const table = url.searchParams.get("table") ?? "profiles"
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10)

    // Check authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    try {
      // Verify token and get user ID through auth
      const userId = await auth.getUserId(ctx)
      if (!userId) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Fetch widget data
      const data = await ctx.runQuery(internal.widgets.getWidgetDataInternal, {
        userId,
        table,
        limit,
      })

      return new Response(JSON.stringify({ data, error: null }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=300", // 5 minute cache for widgets
        },
      })
    } catch (error) {
      console.error("[Widget HTTP] Error fetching widget data:", error)
      return new Response(
        JSON.stringify({
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  }),
})

/**
 * Widget profile endpoint (simplified)
 * GET /api/widgets/profile
 */
http.route({
  path: "/api/widgets/profile",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const userId = await auth.getUserId(ctx)
      if (!userId) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      const data = await ctx.runQuery(internal.widgets.getWidgetDataInternal, {
        userId,
        table: "profiles",
        limit: 1,
      })

      return new Response(JSON.stringify({ data, error: null }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=300",
        },
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  }),
})

// Debug route to catch unhandled requests
// This helps debug OAuth redirect issues
http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    console.log("[HTTP Debug] Root route hit", {
      url: request.url,
      hasCode: !!code,
      hasError: !!error,
      searchParams: Object.fromEntries(url.searchParams),
    })

    // If there's a code, this might be an OAuth callback that didn't redirect properly
    if (code) {
      return new Response(
        JSON.stringify({
          message: "OAuth callback received at root",
          hint: "The redirectTo URL may not have been preserved. Check SITE_URL and redirect callback.",
          code: code.substring(0, 10) + "...",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Show status page
    return new Response(
      `<!DOCTYPE html>
<html>
<head><title>Convex Auth</title></head>
<body style="font-family: sans-serif; padding: 40px; text-align: center;">
  <h1>✅ Convex Auth is running</h1>
  <p>OAuth callback endpoints are available at:</p>
  <ul style="list-style: none; padding: 0;">
    <li>/api/auth/callback/google</li>
    <li>/api/auth/callback/apple</li>
    <li>/api/auth/callback/github</li>
  </ul>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    )
  }),
})

export default http
