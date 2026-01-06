/**
 * Mock Supabase Database
 *
 * Mock implementation of Supabase database query builder and table operations
 */

import { delay, persistDatabase } from "./helpers"
import { sharedState, type DatabaseRecord, type DatabaseFilter, type FilterValue } from "./types"
import type { DatabaseResponse } from "../../../types/database"
import { logger } from "../../../utils/Logger"

// Mock database query builder
export class MockDatabaseQuery {
  private tableName: string
  private filters: DatabaseFilter[] = []
  private orderColumn?: string
  private orderAscending: boolean = true
  private limitCount?: number
  private rangeFrom?: number
  private rangeTo?: number

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Get filters for external use (update/delete operations)
   */
  getFilters(): DatabaseFilter[] {
    return this.filters
  }

  eq(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "eq", value })
    return this
  }

  neq(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "neq", value })
    return this
  }

  gt(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "gt", value })
    return this
  }

  gte(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "gte", value })
    return this
  }

  lt(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "lt", value })
    return this
  }

  lte(column: string, value: FilterValue): this {
    this.filters.push({ column, operator: "lte", value })
    return this
  }

  like(column: string, pattern: string): this {
    this.filters.push({ column, operator: "like", value: pattern })
    return this
  }

  ilike(column: string, pattern: string): this {
    this.filters.push({ column, operator: "ilike", value: pattern })
    return this
  }

  in(column: string, values: string[] | number[]): this {
    this.filters.push({ column, operator: "in", value: values })
    return this
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderColumn = column
    this.orderAscending = options?.ascending ?? true
    return this
  }

  limit(count: number): this {
    this.limitCount = count
    return this
  }

  range(from: number, to: number): this {
    this.rangeFrom = from
    this.rangeTo = to
    return this
  }

  match(query: Record<string, FilterValue>): this {
    Object.entries(query).forEach(([column, value]) => {
      this.eq(column, value)
    })
    return this
  }

  /**
   * Apply filters to items - public for use by update/delete operations
   */
  applyFilters(items: DatabaseRecord[]): DatabaseRecord[] {
    return items.filter((item) => {
      return this.filters.every((filter) => {
        const value = item[filter.column]

        switch (filter.operator) {
          case "eq":
            return value === filter.value
          case "neq":
            return value !== filter.value
          case "gt":
            return (value as number) > (filter.value as number)
          case "gte":
            return (value as number) >= (filter.value as number)
          case "lt":
            return (value as number) < (filter.value as number)
          case "lte":
            return (value as number) <= (filter.value as number)
          case "like":
          case "ilike": {
            const pattern = String(filter.value).replace(/%/g, ".*")
            const regex = new RegExp(pattern, filter.operator === "ilike" ? "i" : "")
            return regex.test(String(value))
          }
          case "in":
            return (filter.value as (string | number)[]).includes(value as string | number)
          default:
            return true
        }
      })
    })
  }

  private applyOrdering(items: DatabaseRecord[]): DatabaseRecord[] {
    if (!this.orderColumn) return items

    const orderCol = this.orderColumn
    return [...items].sort((a, b) => {
      const aVal = a[orderCol]
      const bVal = b[orderCol]

      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1
      if (aVal < bVal) return this.orderAscending ? -1 : 1
      if (aVal > bVal) return this.orderAscending ? 1 : -1
      return 0
    })
  }

  private applyLimiting(items: DatabaseRecord[]): DatabaseRecord[] {
    if (this.rangeFrom !== undefined && this.rangeTo !== undefined) {
      return items.slice(this.rangeFrom, this.rangeTo + 1)
    }
    if (this.limitCount !== undefined) {
      return items.slice(0, this.limitCount)
    }
    return items
  }

  async single(): Promise<DatabaseResponse> {
    await delay(200)

    const table = sharedState.mockDatabase.get(this.tableName)
    if (!table) {
      return { data: null, error: new Error(`Table ${this.tableName} not found`) }
    }

    const items = Array.from(table.values())
    const filtered = this.applyFilters(items)

    if (filtered.length === 0) {
      return { data: null, error: new Error("No rows found") }
    }

    if (filtered.length > 1) {
      return { data: null, error: new Error("Multiple rows found") }
    }

    return { data: filtered[0], error: null }
  }

  async maybeSingle(): Promise<DatabaseResponse> {
    await delay(200)

    const table = sharedState.mockDatabase.get(this.tableName)
    if (!table) {
      return { data: null, error: null }
    }

    const items = Array.from(table.values())
    const filtered = this.applyFilters(items)

    if (filtered.length === 0) {
      return { data: null, error: null }
    }

    if (filtered.length > 1) {
      return { data: null, error: new Error("Multiple rows found") }
    }

    return { data: filtered[0], error: null }
  }

  async then(resolve: (value: DatabaseResponse) => void) {
    await delay(200)

    const table = sharedState.mockDatabase.get(this.tableName)
    if (!table) {
      resolve({ data: [], error: null })
      return
    }

    let items = Array.from(table.values())
    items = this.applyFilters(items)
    items = this.applyOrdering(items)
    items = this.applyLimiting(items)

    resolve({ data: items, error: null, count: items.length })
  }
}

// Mock database table
export class MockDatabaseTable {
  private tableName: string

  constructor(tableName: string) {
    this.tableName = tableName

    // Initialize table if it doesn't exist
    if (!sharedState.mockDatabase.has(tableName)) {
      sharedState.mockDatabase.set(tableName, new Map())
    }
  }

  select(columns?: string) {
    if (__DEV__) {
      logger.debug(`[MockSupabase] SELECT`, { table: this.tableName, columns: columns || "*" })
    }
    return new MockDatabaseQuery(this.tableName)
  }

  async insert(data: DatabaseRecord | DatabaseRecord[]): Promise<DatabaseResponse> {
    await delay(300)

    const table = sharedState.mockDatabase.get(this.tableName)!
    const items = Array.isArray(data) ? data : [data]
    const inserted: DatabaseRecord[] = []

    items.forEach((item) => {
      const id =
        (item.id as string) || `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const record: DatabaseRecord = {
        ...item,
        id,
        created_at: (item.created_at as string) || new Date().toISOString(),
      }
      table.set(id, record)
      inserted.push(record)
    })

    // Persist database changes
    await persistDatabase()

    if (__DEV__) {
      logger.debug(`[MockSupabase] INSERT`, { table: this.tableName, rows: inserted.length })
    }

    return {
      data: Array.isArray(data) ? inserted : inserted[0],
      error: null,
    }
  }

  update(data: DatabaseRecord): MockDatabaseQuery {
    if (__DEV__) {
      logger.debug(`[MockSupabase] UPDATE`, { table: this.tableName })
    }

    const query = new MockDatabaseQuery(this.tableName)
    const tableName = this.tableName

    query.then = async (resolve) => {
      await delay(300)

      const table = sharedState.mockDatabase.get(tableName)!
      const items = Array.from(table.values())
      const filtered = query.applyFilters(items)

      filtered.forEach((item) => {
        const itemId = item.id as string
        const updated: DatabaseRecord = { ...item, ...data, updated_at: new Date().toISOString() }
        table.set(itemId, updated)
      })

      // Persist database changes
      await persistDatabase()

      if (__DEV__) {
        logger.debug(`[MockSupabase] Updated rows`, {
          table: tableName,
          count: filtered.length,
        })
      }

      resolve({ data: filtered, error: null })
    }

    return query
  }

  delete(): MockDatabaseQuery {
    if (__DEV__) {
      logger.debug(`[MockSupabase] DELETE`, { table: this.tableName })
    }

    const query = new MockDatabaseQuery(this.tableName)
    const tableName = this.tableName

    query.then = async (resolve) => {
      await delay(300)

      const table = sharedState.mockDatabase.get(tableName)!
      const items = Array.from(table.values())
      const filtered = query.applyFilters(items)

      filtered.forEach((item) => {
        const itemId = item.id as string
        table.delete(itemId)
      })

      // Persist database changes
      await persistDatabase()

      if (__DEV__) {
        logger.debug(`[MockSupabase] Deleted rows`, {
          table: tableName,
          count: filtered.length,
        })
      }

      resolve({ data: filtered, error: null })
    }

    return query
  }

  async upsert(data: DatabaseRecord | DatabaseRecord[]): Promise<DatabaseResponse> {
    await delay(300)

    const table = sharedState.mockDatabase.get(this.tableName)!
    const items = Array.isArray(data) ? data : [data]
    const upserted: DatabaseRecord[] = []

    items.forEach((item) => {
      const id =
        (item.id as string) || `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const existing = table.get(id)
      const record: DatabaseRecord = {
        ...existing,
        ...item,
        id,
        created_at: (existing?.created_at as string) || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      table.set(id, record)
      upserted.push(record)
    })

    // Persist database changes
    await persistDatabase()

    if (__DEV__) {
      logger.debug(`[MockSupabase] UPSERT`, { table: this.tableName, rows: upserted.length })
    }

    return {
      data: Array.isArray(data) ? upserted : upserted[0],
      error: null,
    }
  }
}
