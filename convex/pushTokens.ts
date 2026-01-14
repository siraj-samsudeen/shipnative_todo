/**
 * Push Token Functions
 *
 * Functions for managing push notification tokens.
 * These are used by the app to register and manage device tokens
 * for sending push notifications.
 */

import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { auth } from "./auth"

/**
 * Register or update a push token for the current user
 * Returns null if not authenticated (graceful degradation for fire-and-forget calls)
 */
export const register = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      // Return null instead of throwing - this is a fire-and-forget operation
      // that may be called before auth is fully established
      return null
    }

    // Check if token already exists for this user
    const existingToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (existingToken) {
      // Update existing token
      await ctx.db.patch(existingToken._id, {
        userId, // In case token was transferred to different user
        platform: args.platform,
        deviceId: args.deviceId,
        isActive: true,
        lastUsedAt: Date.now(),
      })
      return { id: existingToken._id, updated: true }
    }

    // Create new token
    const tokenId = await ctx.db.insert("pushTokens", {
      userId,
      token: args.token,
      platform: args.platform,
      deviceId: args.deviceId,
      isActive: true,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    })

    return { id: tokenId, updated: false }
  },
})

/**
 * Deactivate a specific push token
 * Returns { success: false } if not authenticated
 */
export const deactivate = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return { success: false }
    }

    const existingToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (existingToken && existingToken.userId === userId) {
      await ctx.db.patch(existingToken._id, {
        isActive: false,
      })
      return { success: true }
    }

    return { success: false }
  },
})

/**
 * Deactivate all push tokens for the current user (e.g., on logout)
 * Returns { deactivatedCount: 0 } if not authenticated
 */
export const deactivateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return { deactivatedCount: 0 }
    }

    const tokens = await ctx.db
      .query("pushTokens")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    for (const token of tokens) {
      await ctx.db.patch(token._id, {
        isActive: false,
      })
    }

    return { deactivatedCount: tokens.length }
  },
})

/**
 * Get all active push tokens for the current user
 */
export const listMyTokens = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return []
    }

    return await ctx.db
      .query("pushTokens")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()
  },
})

/**
 * Get all active push tokens for a user (admin use)
 * Returns tokens for sending notifications to a specific user
 */
export const getActiveTokensForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // You may want to add admin check here
    return await ctx.db
      .query("pushTokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()
  },
})

/**
 * Delete a push token completely (for cleanup)
 * Returns { success: false } if not authenticated
 */
export const remove = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return { success: false }
    }

    const existingToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (existingToken && existingToken.userId === userId) {
      await ctx.db.delete(existingToken._id)
      return { success: true }
    }

    return { success: false }
  },
})
