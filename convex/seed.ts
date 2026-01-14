/**
 * Seed Data for Convex
 *
 * Functions to populate the database with initial/test data.
 * Run via: npx convex run seed:run
 *
 * Usage:
 * - Development: npx convex run seed:run
 * - Clear data: npx convex run seed:clear
 * - Check status: npx convex run seed:status
 */

import { mutation, query, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"

// ============================================================================
// Seed Data Configuration
// ============================================================================

const SEED_USERS = [
  {
    name: "Demo User",
    email: "demo@example.com",
    bio: "This is a demo account for testing purposes.",
    hasCompletedOnboarding: true,
    preferences: {
      theme: "system" as const,
      notifications: true,
      language: "en",
    },
  },
  {
    name: "Test Admin",
    email: "admin@example.com",
    bio: "Administrator account for testing admin features.",
    hasCompletedOnboarding: true,
    preferences: {
      theme: "dark" as const,
      notifications: true,
      language: "en",
    },
  },
]

const SEED_POSTS = [
  {
    title: "Welcome to ShipNative",
    content:
      "This is your first post! ShipNative helps you build production-ready React Native apps with Convex or Supabase backends.",
    status: "published" as const,
    tags: ["welcome", "getting-started"],
  },
  {
    title: "Getting Started Guide",
    content:
      "Learn how to set up authentication, database queries, and file storage in your ShipNative app.",
    status: "published" as const,
    tags: ["tutorial", "documentation"],
  },
  {
    title: "Draft Post Example",
    content: "This post is saved as a draft and not visible to other users.",
    status: "draft" as const,
    tags: ["draft"],
  },
]

const SEED_NOTIFICATIONS = [
  {
    type: "welcome",
    title: "Welcome to the app!",
    body: "Thanks for signing up. Explore the features and let us know what you think.",
    read: false,
  },
  {
    type: "feature",
    title: "New Feature Available",
    body: "Check out our latest update with improved performance and new capabilities.",
    read: false,
  },
]

// ============================================================================
// Seed Functions
// ============================================================================

/**
 * Run the seed script to populate the database
 * Usage: npx convex run seed:run
 */
export const run = mutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if already seeded
    const existingUsers = await ctx.db.query("users").take(1)
    if (existingUsers.length > 0 && !args.force) {
      return {
        success: false,
        message: "Database already has data. Use force: true to seed anyway.",
        stats: null,
      }
    }

    const stats = {
      users: 0,
      profiles: 0,
      posts: 0,
      comments: 0,
      notifications: 0,
    }

    // Create users
    const userIds: Id<"users">[] = []
    for (const userData of SEED_USERS) {
      const userId = await ctx.db.insert("users", {
        ...userData,
        lastSeenAt: Date.now(),
      })
      userIds.push(userId)
      stats.users++

      // Create profile for each user
      await ctx.db.insert("profiles", {
        userId,
        displayName: userData.name,
        username: userData.email.split("@")[0],
        bio: userData.bio,
      })
      stats.profiles++

      // Create notifications for each user
      for (const notifData of SEED_NOTIFICATIONS) {
        await ctx.db.insert("notifications", {
          userId,
          ...notifData,
        })
        stats.notifications++
      }
    }

    // Create posts for the first user
    const authorId = userIds[0]
    const postIds: Id<"posts">[] = []
    for (const postData of SEED_POSTS) {
      const postId = await ctx.db.insert("posts", {
        authorId,
        ...postData,
        publishedAt: postData.status === "published" ? Date.now() : undefined,
      })
      postIds.push(postId)
      stats.posts++
    }

    // Create sample comments
    if (postIds.length > 0 && userIds.length > 1) {
      await ctx.db.insert("comments", {
        postId: postIds[0],
        authorId: userIds[1],
        content: "Great introduction! Looking forward to exploring more.",
      })
      stats.comments++

      await ctx.db.insert("comments", {
        postId: postIds[0],
        authorId: userIds[0],
        content: "Thanks for the feedback!",
      })
      stats.comments++
    }

    return {
      success: true,
      message: "Seed completed successfully",
      stats,
    }
  },
})

/**
 * Clear all seeded data
 * Usage: npx convex run seed:clear
 *
 * WARNING: This deletes ALL data from the specified tables!
 */
export const clear = mutation({
  args: {
    confirm: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      return {
        success: false,
        message: "Pass confirm: true to delete all data",
      }
    }

    const tables = ["comments", "posts", "notifications", "profiles", "files"] as const
    const stats: Record<string, number> = {}

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect()
      for (const doc of docs) {
        await ctx.db.delete(doc._id)
      }
      stats[table] = docs.length
    }

    // Note: We don't delete users as they're tied to auth
    // To fully reset, use the Convex dashboard

    return {
      success: true,
      message: "Data cleared successfully",
      deleted: stats,
    }
  },
})

/**
 * Check current database status
 * Usage: npx convex run seed:status
 */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const [users, profiles, posts, comments, notifications, files] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("profiles").collect(),
      ctx.db.query("posts").collect(),
      ctx.db.query("comments").collect(),
      ctx.db.query("notifications").collect(),
      ctx.db.query("files").collect(),
    ])

    return {
      counts: {
        users: users.length,
        profiles: profiles.length,
        posts: posts.length,
        comments: comments.length,
        notifications: notifications.length,
        files: files.length,
      },
      isEmpty:
        users.length === 0 &&
        profiles.length === 0 &&
        posts.length === 0,
      sampleUser: users[0] || null,
    }
  },
})

/**
 * Add a single test user (useful for quick testing)
 * Usage: npx convex run seed:addTestUser
 */
export const addTestUser = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email || `test-${Date.now()}@example.com`
    const name = args.name || "Test User"

    const userId = await ctx.db.insert("users", {
      name,
      email,
      bio: "Test user created via seed script",
      hasCompletedOnboarding: false,
      preferences: {
        theme: "system",
        notifications: true,
        language: "en",
      },
      lastSeenAt: Date.now(),
    })

    await ctx.db.insert("profiles", {
      userId,
      displayName: name,
      username: email.split("@")[0],
    })

    return {
      userId,
      email,
      name,
    }
  },
})
