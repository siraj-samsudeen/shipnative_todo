/**
 * Supabase Database Service
 *
 * Implements the DatabaseService interface for Supabase.
 */

import type { DatabaseService, DatabaseResult, QueryFilter, QueryOptions } from "../types"
import { getSupabaseClient } from "./client"

// ============================================================================
// Helper Functions
// ============================================================================

type SupabaseFilterBuilder = ReturnType<
  ReturnType<ReturnType<typeof getSupabaseClient>["from"]>["select"]
>

function applyFilters(query: SupabaseFilterBuilder, filters: QueryFilter[]): SupabaseFilterBuilder {
  let result = query

  for (const filter of filters) {
    switch (filter.operator) {
      case "eq":
        result = result.eq(filter.column, filter.value)
        break
      case "neq":
        result = result.neq(filter.column, filter.value)
        break
      case "gt":
        result = result.gt(filter.column, filter.value)
        break
      case "gte":
        result = result.gte(filter.column, filter.value)
        break
      case "lt":
        result = result.lt(filter.column, filter.value)
        break
      case "lte":
        result = result.lte(filter.column, filter.value)
        break
      case "like":
        result = result.like(filter.column, filter.value as string)
        break
      case "ilike":
        result = result.ilike(filter.column, filter.value as string)
        break
      case "in":
        result = result.in(filter.column, filter.value as unknown[])
        break
      case "contains":
        result = result.contains(filter.column, filter.value as unknown[])
        break
    }
  }

  return result
}

// ============================================================================
// Supabase Database Service Implementation
// ============================================================================

export function createSupabaseDatabaseService(): DatabaseService {
  const getClient = () => getSupabaseClient()

  return {
    async query<T = unknown>(table: string, options?: QueryOptions): Promise<DatabaseResult<T[]>> {
      let query = getClient()
        .from(table)
        .select(options?.select ?? "*", { count: "exact" })

      // Apply filters
      if (options?.filters) {
        query = applyFilters(query, options.filters) as typeof query
      }

      // Apply ordering
      if (options?.orderBy) {
        for (const order of options.orderBy) {
          query = query.order(order.column, { ascending: order.ascending ?? true })
        }
      }

      // Apply pagination
      if (options?.limit !== undefined) {
        query = query.limit(options.limit)
      }
      if (options?.offset !== undefined) {
        const limit = options.limit ?? 1000
        query = query.range(options.offset, options.offset + limit - 1)
      }

      const { data, error, count } = await query

      return {
        data: data as T[] | null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
        count,
      }
    },

    async get<T = unknown>(
      table: string,
      id: string,
      options?: { select?: string },
    ): Promise<DatabaseResult<T>> {
      const { data, error } = await getClient()
        .from(table)
        .select(options?.select ?? "*")
        .eq("id", id)
        .single()

      return {
        data: data as T | null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },

    async insert<T = unknown>(
      table: string,
      data: Partial<T> | Partial<T>[],
      options?: { returning?: boolean },
    ): Promise<DatabaseResult<T>> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = getClient().from(table).insert(data as any)

      if (options?.returning !== false) {
        const { data: result, error } = await query.select()
        return {
          data: (Array.isArray(data) ? result : result?.[0]) as T | null,
          error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
        }
      }

      const { error } = await query
      return {
        data: null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },

    async update<T = unknown>(
      table: string,
      data: Partial<T>,
      filters: QueryFilter[],
    ): Promise<DatabaseResult<T>> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (getClient().from(table) as any).update(data)
      query = applyFilters(
        query as unknown as SupabaseFilterBuilder,
        filters,
      ) as unknown as typeof query

      const { data: result, error } = await query.select()

      return {
        data: result?.[0] as T | null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },

    async delete<T = unknown>(table: string, filters: QueryFilter[]): Promise<DatabaseResult<T>> {
      let query = getClient().from(table).delete()
      query = applyFilters(
        query as unknown as SupabaseFilterBuilder,
        filters,
      ) as unknown as typeof query

      const { data: result, error } = await query.select()

      return {
        data: result?.[0] as T | null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },

    async upsert<T = unknown>(
      table: string,
      data: Partial<T> | Partial<T>[],
      options?: { onConflict?: string; returning?: boolean },
    ): Promise<DatabaseResult<T>> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = getClient().from(table).upsert(data as any, {
        onConflict: options?.onConflict,
      })

      if (options?.returning !== false) {
        const { data: result, error } = await query.select()
        return {
          data: (Array.isArray(data) ? result : result?.[0]) as T | null,
          error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
        }
      }

      const { error } = await query
      return {
        data: null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },

    async rpc<T = unknown>(
      functionName: string,
      params?: Record<string, unknown>,
    ): Promise<DatabaseResult<T>> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await getClient().rpc(functionName as any, params as any)

      return {
        data: data as T | null,
        error: error ? { ...error, name: "DatabaseError", message: error.message } : null,
      }
    },
  }
}
