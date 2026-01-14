/**
 * User Queries and Mutations
 *
 * Functions for managing user data.
 */

import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { auth } from "./auth"

/**
 * Get the current authenticated user
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return null
    }

    const user = await ctx.db.get(userId)
    return user
  },
})

/**
 * Get a user by ID
 */
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    await ctx.db.patch(userId, {
      name: args.name,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
    })

    return await ctx.db.get(userId)
  },
})

/**
 * Update user preferences
 */
export const updatePreferences = mutation({
  args: {
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    notifications: v.optional(v.boolean()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db.get(userId)
    const currentPreferences = user?.preferences ?? {}

    await ctx.db.patch(userId, {
      preferences: {
        ...currentPreferences,
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.notifications !== undefined && { notifications: args.notifications }),
        ...(args.language !== undefined && { language: args.language }),
      },
    })

    return await ctx.db.get(userId)
  },
})

/**
 * Complete onboarding
 */
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    await ctx.db.patch(userId, {
      hasCompletedOnboarding: true,
    })

    return await ctx.db.get(userId)
  },
})

/**
 * Update last seen timestamp
 */
export const updateLastSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return
    }

    await ctx.db.patch(userId, {
      lastSeenAt: Date.now(),
    })
  },
})

/**
 * Delete current user account
 * Note: This soft-deletes. For hard delete, you may need additional cleanup.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    // Delete user data
    await ctx.db.delete(userId)

    // You may want to also delete related data:
    // - Posts
    // - Comments
    // - Files
    // - etc.

    return { success: true }
  },
})
