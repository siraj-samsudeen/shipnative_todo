import { serve } from "https://deno.land/std@0.223.0/http/server.ts"
import { createHmac } from "node:crypto"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// RevenueCat webhook event types we care about
const PURCHASE_EVENTS = [
  "INITIAL_PURCHASE",
  "RENEWAL",
  "NON_RENEWING_PURCHASE",
]

interface RevenueCatWebhookEvent {
  api_version: string
  event: {
    type: string
    id: string
    app_id: string
    app_user_id: string
    original_app_user_id: string
    product_id: string
    price: number
    price_in_purchased_currency: number
    currency: string
    store: string
    environment: string
    purchased_at_ms: number
    expiration_at_ms?: number
    is_trial_conversion?: boolean
    period_type?: string
    entitlement_ids?: string[]
    presented_offering_id?: string
    country_code?: string
  }
}

/**
 * Verify RevenueCat webhook signature
 * https://www.revenuecat.com/docs/integrations/webhooks#signature-verification
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn("Missing signature or secret - skipping verification")
    return false
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  // Use constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }
  return result === 0
}

/**
 * Send Discord DM via bot
 */
async function sendDiscordDM(
  botToken: string,
  userId: string,
  content: string
): Promise<boolean> {
  try {
    // First, create a DM channel with the user
    const dmChannelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: userId,
      }),
    })

    if (!dmChannelResponse.ok) {
      const error = await dmChannelResponse.text()
      console.error("Failed to create DM channel:", error)
      return false
    }

    const dmChannel = await dmChannelResponse.json()
    const channelId = dmChannel.id

    // Send the message to the DM channel
    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      }
    )

    if (!messageResponse.ok) {
      const error = await messageResponse.text()
      console.error("Failed to send DM:", error)
      return false
    }

    console.log("Discord DM sent successfully")
    return true
  } catch (error) {
    console.error("Discord DM error:", error)
    return false
  }
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

/**
 * Format the purchase notification message
 */
function formatPurchaseMessage(event: RevenueCatWebhookEvent["event"]): string {
  const formattedPrice = formatCurrency(
    event.price_in_purchased_currency,
    event.currency
  )

  const purchaseDate = new Date(event.purchased_at_ms).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const storeName = {
    app_store: "App Store",
    play_store: "Play Store",
    stripe: "Stripe (Web)",
    promotional: "Promotional",
  }[event.store] || event.store

  const eventTypeLabel = {
    INITIAL_PURCHASE: "New Purchase",
    RENEWAL: "Renewal",
    NON_RENEWING_PURCHASE: "One-time Purchase",
  }[event.type] || event.type

  const isProd = event.environment === "PRODUCTION"
  const envLabel = isProd ? "" : " [SANDBOX]"

  let message = `**${eventTypeLabel}${envLabel}**\n\n`
  message += `**Product:** ${event.product_id}\n`
  message += `**Amount:** ${formattedPrice}\n`
  message += `**Store:** ${storeName}\n`
  message += `**Date:** ${purchaseDate}\n`

  if (event.country_code) {
    message += `**Country:** ${event.country_code}\n`
  }

  if (event.is_trial_conversion) {
    message += `**Trial Conversion:** Yes\n`
  }

  if (event.entitlement_ids && event.entitlement_ids.length > 0) {
    message += `**Entitlements:** ${event.entitlement_ids.join(", ")}\n`
  }

  message += `\n*User ID: ${event.app_user_id}*`

  return message
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    // Get environment variables
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET")
    const discordBotToken = Deno.env.get("DISCORD_BOT_TOKEN")
    const discordUserId = Deno.env.get("DISCORD_OWNER_USER_ID")

    if (!discordBotToken || !discordUserId) {
      console.error("Missing required Discord environment variables")
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get raw body for signature verification
    const rawBody = await req.text()

    // Verify webhook signature (if secret is configured)
    if (webhookSecret) {
      const signature = req.headers.get("X-RevenueCat-Signature")

      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error("Invalid webhook signature")
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      console.log("Webhook signature verified")
    } else {
      console.warn("REVENUECAT_WEBHOOK_SECRET not configured - skipping signature verification")
    }

    // Parse the webhook payload
    const webhookData: RevenueCatWebhookEvent = JSON.parse(rawBody)
    const eventType = webhookData.event.type

    console.log(`Received RevenueCat event: ${eventType}`)

    // Only process purchase events
    if (!PURCHASE_EVENTS.includes(eventType)) {
      console.log(`Ignoring event type: ${eventType}`)
      return new Response(
        JSON.stringify({ success: true, message: "Event ignored" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Format and send the notification
    const message = formatPurchaseMessage(webhookData.event)
    const dmSent = await sendDiscordDM(discordBotToken, discordUserId, message)

    if (!dmSent) {
      console.error("Failed to send Discord notification")
      // Still return 200 to acknowledge receipt - don't retry webhook
    }

    return new Response(
      JSON.stringify({ success: true, notified: dmSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Webhook processing error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
