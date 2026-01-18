/**
 * Webhook Handlers
 *
 * Handles incoming webhooks from external services like RevenueCat.
 * Includes signature verification for security.
 */

import { httpAction, internalAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

// RevenueCat event types we care about
type RevenueCatEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "NON_RENEWING_PURCHASE"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_EXTENDED"
  | "BILLING_ISSUE"
  | "PRODUCT_CHANGE"
  | "TRANSFER"
  | "EXPIRATION"

interface RevenueCatWebhookEvent {
  api_version: string
  event: {
    type: RevenueCatEventType
    id: string
    app_user_id: string
    original_app_user_id: string
    aliases: string[]
    product_id: string
    entitlement_ids: string[]
    period_type: string
    purchased_at_ms: number
    expiration_at_ms: number | null
    environment: "SANDBOX" | "PRODUCTION"
    store: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "RC_BILLING"
    is_family_share: boolean
    country_code: string
    currency: string
    price: number
    price_in_purchased_currency: number
    subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>
    transaction_id: string
    original_transaction_id: string
    takehome_percentage?: number
  }
}

/**
 * Verify RevenueCat webhook signature using HMAC-SHA1
 * https://www.revenuecat.com/docs/integrations/webhooks#signature-verification
 */
async function verifyRevenueCatSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    console.warn("[Webhook] Missing signature or secret")
    return false
  }

  try {
    // RevenueCat uses HMAC-SHA1 for webhook signatures
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    )

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    )

    // Convert to hex string
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Constant-time comparison to prevent timing attacks
    if (computedSignature.length !== signature.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < computedSignature.length; i++) {
      result |= computedSignature.charCodeAt(i) ^ signature.charCodeAt(i)
    }

    return result === 0
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error)
    return false
  }
}

/**
 * HTTP handler for RevenueCat webhooks
 */
export const revenueCatWebhookHandler = httpAction(async (ctx, request) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const body = await request.text()

  // Get webhook secret from environment
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET

  // Verify signature (skip in development if no secret configured)
  const signature = request.headers.get("X-RevenueCat-Signature")

  if (webhookSecret) {
    const isValid = await verifyRevenueCatSignature(body, signature, webhookSecret)
    if (!isValid) {
      console.error("[Webhook] Invalid signature")
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  } else {
    console.warn(
      "[Webhook] REVENUECAT_WEBHOOK_SECRET not set - skipping signature verification"
    )
  }

  // Parse the webhook payload
  let payload: RevenueCatWebhookEvent
  try {
    payload = JSON.parse(body)
  } catch (error) {
    console.error("[Webhook] Invalid JSON payload:", error)
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const event = payload.event
  console.log(`[Webhook] Received RevenueCat event: ${event.type}`, {
    productId: event.product_id,
    userId: event.app_user_id,
    environment: event.environment,
  })

  // Process purchase events
  const purchaseEvents: RevenueCatEventType[] = [
    "INITIAL_PURCHASE",
    "NON_RENEWING_PURCHASE",
    "RENEWAL",
  ]

  if (purchaseEvents.includes(event.type)) {
    // Schedule Discord notification
    await ctx.runAction(internal.webhooks.sendPurchaseNotification, {
      eventType: event.type,
      productId: event.product_id,
      userId: event.app_user_id,
      price: event.price_in_purchased_currency,
      currency: event.currency,
      store: event.store,
      environment: event.environment,
      countryCode: event.country_code,
      transactionId: event.transaction_id,
    })
  }

  // Return success (RevenueCat expects 2xx)
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})

/**
 * Send purchase notification to Discord
 * Uses Discord webhook for channel message and bot API for DM
 */
export const sendPurchaseNotification = internalAction({
  args: {
    eventType: v.string(),
    productId: v.string(),
    userId: v.string(),
    price: v.number(),
    currency: v.string(),
    store: v.string(),
    environment: v.string(),
    countryCode: v.string(),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const discordBotToken = process.env.DISCORD_BOT_TOKEN
    const discordOwnerId = process.env.DISCORD_OWNER_ID
    const discordChannelId = process.env.DISCORD_NOTIFICATION_CHANNEL_ID

    if (!discordBotToken) {
      console.warn("[Discord] DISCORD_BOT_TOKEN not configured - skipping notification")
      return
    }

    if (!discordOwnerId) {
      console.warn("[Discord] DISCORD_OWNER_ID not configured - skipping DM")
    }

    // Format price with currency
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: args.currency || "USD",
    }).format(args.price)

    // Get emoji for store
    const storeEmoji: Record<string, string> = {
      APP_STORE: "🍎",
      PLAY_STORE: "🤖",
      STRIPE: "💳",
      RC_BILLING: "💳",
    }

    // Get emoji for event type
    const eventEmoji: Record<string, string> = {
      INITIAL_PURCHASE: "🎉",
      NON_RENEWING_PURCHASE: "💰",
      RENEWAL: "🔄",
    }

    const emoji = eventEmoji[args.eventType] || "💵"
    const storeIcon = storeEmoji[args.store] || "🛒"
    const envBadge = args.environment === "SANDBOX" ? " [SANDBOX]" : ""

    // Build the message
    const message = {
      content: discordOwnerId ? `<@${discordOwnerId}>` : undefined,
      embeds: [
        {
          title: `${emoji} New Purchase${envBadge}`,
          color: args.environment === "SANDBOX" ? 0xffa500 : 0x00ff00, // Orange for sandbox, green for production
          fields: [
            {
              name: "Product",
              value: args.productId,
              inline: true,
            },
            {
              name: "Amount",
              value: formattedPrice,
              inline: true,
            },
            {
              name: "Store",
              value: `${storeIcon} ${args.store}`,
              inline: true,
            },
            {
              name: "Country",
              value: `:flag_${args.countryCode.toLowerCase()}: ${args.countryCode}`,
              inline: true,
            },
            {
              name: "Event Type",
              value: args.eventType.replace(/_/g, " "),
              inline: true,
            },
            {
              name: "Transaction ID",
              value: `\`${args.transactionId.slice(0, 12)}...\``,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `User: ${args.userId.slice(0, 16)}...`,
          },
        },
      ],
    }

    const headers = {
      Authorization: `Bot ${discordBotToken}`,
      "Content-Type": "application/json",
    }

    // Send DM to owner
    if (discordOwnerId) {
      try {
        // First, create/get DM channel
        const dmChannelResponse = await fetch(
          "https://discord.com/api/v10/users/@me/channels",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ recipient_id: discordOwnerId }),
          }
        )

        if (dmChannelResponse.ok) {
          const dmChannel = await dmChannelResponse.json()

          // Send message to DM channel
          const dmResponse = await fetch(
            `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
            {
              method: "POST",
              headers,
              body: JSON.stringify(message),
            }
          )

          if (dmResponse.ok) {
            console.log("[Discord] DM sent successfully")
          } else {
            const error = await dmResponse.text()
            console.error("[Discord] Failed to send DM:", error)
          }
        } else {
          const error = await dmChannelResponse.text()
          console.error("[Discord] Failed to create DM channel:", error)
        }
      } catch (error) {
        console.error("[Discord] DM error:", error)
      }
    }

    // Also post to notification channel if configured
    if (discordChannelId) {
      try {
        const channelResponse = await fetch(
          `https://discord.com/api/v10/channels/${discordChannelId}/messages`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(message),
          }
        )

        if (channelResponse.ok) {
          console.log("[Discord] Channel message sent successfully")
        } else {
          const error = await channelResponse.text()
          console.error("[Discord] Failed to send channel message:", error)
        }
      } catch (error) {
        console.error("[Discord] Channel message error:", error)
      }
    }
  },
})
