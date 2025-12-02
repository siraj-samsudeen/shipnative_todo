/**
 * Platform-agnostic database types
 *
 * These types provide a unified interface for database operations
 * across different platforms and providers (Supabase, etc.)
 */

export type DatabaseProvider = "supabase" | "mock"

export interface QueryFilter {
  column: string
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in"
  value: any
}

export interface QueryOptions {
  filters?: QueryFilter[]
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
  select?: string
}

export interface DatabaseResponse<T = any> {
  data: T | null
  error: Error | null
  count?: number | null
}

export interface DatabaseTable<T = any> {
  // Select
  select(columns?: string): DatabaseQuery<T>

  // Insert
  insert(data: Partial<T> | Partial<T>[]): Promise<DatabaseResponse<T>>

  // Update
  update(data: Partial<T>): DatabaseQuery<T>

  // Delete
  delete(): DatabaseQuery<T>

  // Upsert
  upsert?(data: Partial<T> | Partial<T>[]): Promise<DatabaseResponse<T>>
}

export interface DatabaseQuery<T = any> {
  // Filters
  eq(column: string, value: any): DatabaseQuery<T>
  neq(column: string, value: any): DatabaseQuery<T>
  gt(column: string, value: any): DatabaseQuery<T>
  gte(column: string, value: any): DatabaseQuery<T>
  lt(column: string, value: any): DatabaseQuery<T>
  lte(column: string, value: any): DatabaseQuery<T>
  like(column: string, pattern: string): DatabaseQuery<T>
  ilike(column: string, pattern: string): DatabaseQuery<T>
  in(column: string, values: any[]): DatabaseQuery<T>

  // Ordering
  order(column: string, options?: { ascending?: boolean }): DatabaseQuery<T>

  // Limiting
  limit(count: number): DatabaseQuery<T>
  range(from: number, to: number): DatabaseQuery<T>

  // Execution
  single(): Promise<DatabaseResponse<T>>
  maybeSingle(): Promise<DatabaseResponse<T>>

  // For update/delete
  match?(query: Record<string, any>): DatabaseQuery<T>
}

export interface DatabaseService {
  provider: DatabaseProvider

  // Get table
  from<T = any>(table: string): DatabaseTable<T>

  // RPC (stored procedures)
  rpc?<T = any>(fn: string, params?: Record<string, any>): Promise<DatabaseResponse<T>>
}

/**
 * Helper to check if database response has error
 */
export function hasError<T>(
  response: DatabaseResponse<T>,
): response is DatabaseResponse<T> & { error: Error } {
  return response.error !== null
}

/**
 * Helper to extract data from response
 */
export function getData<T>(response: DatabaseResponse<T>): T | null {
  return hasError(response) ? null : response.data
}
