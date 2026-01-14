/**
 * Convex Storage Service
 *
 * Implements the StorageService interface for Convex.
 *
 * IMPORTANT: Convex storage works differently from Supabase storage.
 * Instead of using this service abstraction, use React hooks directly:
 *
 * ```typescript
 * // Example: Upload a file with Convex
 * import { useMutation } from "convex/react"
 * import { api } from "@convex/_generated/api"
 *
 * function UploadComponent() {
 *   const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
 *   const saveFile = useMutation(api.storage.saveFile)
 *
 *   const handleUpload = async (file: File) => {
 *     // 1. Get upload URL
 *     const uploadUrl = await generateUploadUrl()
 *
 *     // 2. Upload file directly
 *     const response = await fetch(uploadUrl, {
 *       method: "POST",
 *       body: file,
 *       headers: { "Content-Type": file.type }
 *     })
 *     const { storageId } = await response.json()
 *
 *     // 3. Save file metadata
 *     await saveFile({
 *       storageId,
 *       filename: file.name,
 *       contentType: file.type,
 *       size: file.size,
 *     })
 *   }
 * }
 * ```
 *
 * This service provides mock support for development and fallback behavior,
 * but for production, use the React hook pattern above.
 */

import { logger } from "../../../utils/Logger"
import type { StorageService, StorageResult, StorageUploadOptions, StorageFileInfo } from "../types"
import { isUsingMockConvex } from "./client"

// ============================================================================
// Mock Storage (for development without Convex credentials)
// ============================================================================

const mockStorage: Map<string, { blob: Blob; metadata: StorageFileInfo }> = new Map()

function generateMockStorageId(): string {
  return `storage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================================
// Convex Storage Service Implementation
// ============================================================================

/**
 * Create a Convex Storage service instance.
 *
 * IMPORTANT: Convex storage requires Convex functions to be defined.
 * You need to create mutations for generating upload URLs:
 *
 * ```typescript
 * // convex/storage.ts
 * import { mutation } from "./_generated/server"
 *
 * export const generateUploadUrl = mutation(async (ctx) => {
 *   return await ctx.storage.generateUploadUrl()
 * })
 *
 * export const getUrl = mutation({
 *   args: { storageId: v.id("_storage") },
 *   handler: async (ctx, args) => {
 *     return await ctx.storage.getUrl(args.storageId)
 *   },
 * })
 * ```
 */
export function createConvexStorageService(): StorageService {
  return {
    async upload(
      bucket: string, // Note: Convex doesn't have buckets, this is ignored
      path: string,
      file: Blob | ArrayBuffer | File,
      options?: StorageUploadOptions,
    ): Promise<StorageResult<{ path: string; id?: string }>> {
      try {
        if (isUsingMockConvex) {
          // Mock implementation
          const id = generateMockStorageId()
          const blob = file instanceof Blob ? file : new Blob([file])
          const metadata: StorageFileInfo = {
            id,
            name: path,
            size: blob.size,
            contentType: options?.contentType ?? (file instanceof File ? file.type : undefined),
            createdAt: new Date().toISOString(),
          }
          mockStorage.set(id, { blob, metadata })
          return {
            data: { path, id },
            error: null,
          }
        }

        // For real Convex storage:
        // 1. Call a mutation to get upload URL: const uploadUrl = await generateUploadUrl()
        // 2. POST the file: await fetch(uploadUrl, { method: "POST", body: file })
        // 3. Get the storageId from the response

        logger.warn(
          `[Convex] Direct storage upload not supported. ` +
            `Use useMutation(api.storage.generateUploadUrl) and fetch() instead.`,
        )

        return {
          data: null,
          error: {
            name: "StorageError",
            message: "Direct upload not supported. Use Convex's upload URL pattern.",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "StorageError", message: (error as Error).message },
        }
      }
    },

    async download(bucket: string, path: string): Promise<StorageResult<Blob>> {
      try {
        if (isUsingMockConvex) {
          // Try to find by path (id)
          const stored = mockStorage.get(path)
          if (stored) {
            return { data: stored.blob, error: null }
          }

          // Try to find by name
          for (const [, value] of mockStorage) {
            if (value.metadata.name === path) {
              return { data: value.blob, error: null }
            }
          }

          return {
            data: null,
            error: { name: "StorageError", message: "File not found" },
          }
        }

        logger.warn(
          `[Convex] Direct storage download not supported. ` +
            `Get the URL via useQuery and fetch it directly.`,
        )

        return {
          data: null,
          error: {
            name: "StorageError",
            message: "Direct download not supported. Use storage URL from Convex.",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "StorageError", message: (error as Error).message },
        }
      }
    },

    getPublicUrl(bucket: string, path: string): string {
      if (isUsingMockConvex) {
        return `mock://storage/${path}`
      }

      // In Convex, you'd get this from ctx.storage.getUrl(storageId) on the server
      // or store the URL when you get it after upload
      logger.warn(
        `[Convex] getPublicUrl returns a placeholder. ` +
          `Use the URL returned from your Convex storage mutation.`,
      )

      return `convex://storage/${path}`
    },

    async createSignedUrl(
      bucket: string,
      path: string,
      expiresIn: number,
    ): Promise<StorageResult<{ signedUrl: string }>> {
      if (isUsingMockConvex) {
        return {
          data: { signedUrl: `mock://storage/${path}?expires=${expiresIn}` },
          error: null,
        }
      }

      // Convex storage URLs are already signed and have a default expiration
      return {
        data: null,
        error: {
          name: "StorageError",
          message: "Convex storage URLs are automatically signed. Use getUrl() instead.",
        },
      }
    },

    async remove(bucket: string, paths: string[]): Promise<StorageResult<void>> {
      try {
        if (isUsingMockConvex) {
          for (const path of paths) {
            mockStorage.delete(path)
          }
          return { data: null, error: null }
        }

        // In Convex, you'd call ctx.storage.delete(storageId) in a mutation
        logger.warn(
          `[Convex] Direct storage delete not supported. ` +
            `Use useMutation(api.storage.deleteFile) instead.`,
        )

        return {
          data: null,
          error: {
            name: "StorageError",
            message: "Direct delete not supported. Use a Convex mutation.",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "StorageError", message: (error as Error).message },
        }
      }
    },

    async list(
      bucket: string,
      path?: string,
      options?: { limit?: number; offset?: number },
    ): Promise<StorageResult<StorageFileInfo[]>> {
      try {
        if (isUsingMockConvex) {
          let files = Array.from(mockStorage.values()).map((v) => v.metadata)

          if (path) {
            files = files.filter((f) => f.name.startsWith(path))
          }

          const offset = options?.offset ?? 0
          const limit = options?.limit ?? files.length
          files = files.slice(offset, offset + limit)

          return { data: files, error: null }
        }

        // Convex doesn't have a built-in file listing API
        // You'd need to track storage IDs in a table
        logger.warn(
          `[Convex] Storage listing not directly supported. ` +
            `Track file references in a Convex table.`,
        )

        return {
          data: null,
          error: {
            name: "StorageError",
            message: "File listing not supported. Track files in a Convex table.",
          },
        }
      } catch (error) {
        return {
          data: null,
          error: { name: "StorageError", message: (error as Error).message },
        }
      }
    },
  }
}

// ============================================================================
// Mock Storage Utilities (for testing)
// ============================================================================

export const convexMockStorage = {
  /**
   * Clear all mock storage
   */
  clear(): void {
    mockStorage.clear()
  },

  /**
   * Get all stored files
   */
  getAll(): StorageFileInfo[] {
    return Array.from(mockStorage.values()).map((v) => v.metadata)
  },

  /**
   * Add a mock file
   */
  add(id: string, blob: Blob, metadata?: Partial<StorageFileInfo>): void {
    mockStorage.set(id, {
      blob,
      metadata: {
        id,
        name: metadata?.name ?? id,
        size: blob.size,
        contentType: metadata?.contentType,
        createdAt: metadata?.createdAt ?? new Date().toISOString(),
      },
    })
  },
}
