/**
 * Storage Functions
 *
 * Functions for file upload and management.
 */

import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { auth } from "./auth"

/**
 * Generate an upload URL for file upload
 *
 * Usage:
 * 1. Call this mutation to get an upload URL
 * 2. POST your file to that URL
 * 3. Get the storageId from the response
 * 4. Save the storageId to your data
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Get a URL for a stored file
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

/**
 * Save file metadata after upload
 */
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    bucket: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const fileId = await ctx.db.insert("files", {
      userId,
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      bucket: args.bucket,
    })

    return { fileId, storageId: args.storageId }
  },
})

/**
 * Get files for current user
 */
export const listMyFiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return []
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 100)

    // Get URLs for each file
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    )
  },
})

/**
 * Delete a file
 */
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    if (file.userId !== userId) {
      throw new Error("Not authorized")
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId)

    // Delete metadata
    await ctx.db.delete(args.fileId)

    return { success: true }
  },
})
