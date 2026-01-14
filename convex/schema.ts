/**
 * Convex Database Schema
 *
 * Define your database schema here. This is equivalent to Supabase tables.
 *
 * Learn more: https://docs.convex.dev/database/schemas
 */

import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values"

export default defineSchema({
  // ============================================================================
  // Auth Tables (managed by Convex Auth)
  // This spread includes: authSessions, authAccounts, authRefreshTokens,
  // authVerificationCodes, authVerifiers, and authRateLimits
  // ============================================================================
  ...authTables,

  // ============================================================================
  // Users Table
  // The `users` table is defined in authTables but we override it here
  // to add custom fields while keeping the required auth fields.
  // ============================================================================
  users: defineTable({
    // Convex Auth fields (required by authTables)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom user profile fields
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Role-based access control
    role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("moderator"))),

    // App-specific fields
    hasCompletedOnboarding: v.optional(v.boolean()),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
        notifications: v.optional(v.boolean()),
        language: v.optional(v.string()),
      })
    ),

    // Metadata
    lastSeenAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"]),

  // ============================================================================
  // User Profiles (extended profile data)
  // ============================================================================
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    socialLinks: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        github: v.optional(v.string()),
        linkedin: v.optional(v.string()),
      })
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  // ============================================================================
  // Posts / Content
  // ============================================================================
  posts: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    publishedAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    viewCount: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_authorId", ["authorId"])
    .index("by_status", ["status"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_slug", ["slug"])
    .index("by_authorId_status", ["authorId", "status"]),

  // ============================================================================
  // Comments
  // ============================================================================
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    isEdited: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_postId", ["postId"])
    .index("by_authorId", ["authorId"])
    .index("by_parentId", ["parentId"])
    .index("by_postId_createdAt", ["postId", "createdAt"]),

  // ============================================================================
  // Notifications
  // ============================================================================
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.optional(v.string()),
    data: v.optional(v.any()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // ============================================================================
  // Files (tracking storage references)
  // ============================================================================
  files: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    bucket: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
    createdAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_storageId", ["storageId"])
    .index("by_userId_bucket", ["userId", "bucket"]),

  // ============================================================================
  // Presence (for realtime user tracking)
  // ============================================================================
  presence: defineTable({
    channel: v.string(),
    userId: v.id("users"),
    state: v.optional(v.any()), // Custom state (cursor position, status, etc.)
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "userId"])
    .index("by_userId", ["userId"])
    .index("by_lastSeenAt", ["lastSeenAt"]),

  // ============================================================================
  // Broadcasts (for realtime messaging)
  // ============================================================================
  broadcasts: defineTable({
    channel: v.string(),
    event: v.string(),
    payload: v.any(),
    senderId: v.optional(v.id("users")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_created", ["channel", "createdAt"])
    .index("by_expiresAt", ["expiresAt"]),

  // ============================================================================
  // Push Tokens (for push notifications)
  // ============================================================================
  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
    deviceId: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["token"])
    .index("by_userId_platform", ["userId", "platform"]),

  // ============================================================================
  // Waitlist (for pre-launch signups)
  // ============================================================================
  waitlist: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("invited"), v.literal("joined"))),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_referralCode", ["referralCode"]),

  // ============================================================================
  // Audit Logs (for tracking important actions)
  // ============================================================================
  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    resource: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource", "resourceId"])
    .index("by_createdAt", ["createdAt"]),
})
