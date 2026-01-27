/**
 * Todo types for the todo application
 *
 * These types define the data model for todo items stored in Supabase.
 * Todos are user-scoped via Row Level Security (RLS).
 */

/**
 * Represents a todo item row from the Supabase todos table.
 *
 * @property id - UUID primary key
 * @property user_id - Foreign key to auth.users (owner of the todo)
 * @property title - Task text (non-empty, trimmed)
 * @property completed - Completion status, default false
 * @property created_at - Timestamp for ordering
 */
export interface TodoRow {
  id: string
  user_id: string
  title: string
  completed: boolean
  created_at: string
}

/**
 * Input type for creating a new todo.
 * Omits auto-generated fields (id, user_id, created_at).
 */
export type TodoInsert = Pick<TodoRow, "title"> & Partial<Pick<TodoRow, "completed">>

/**
 * Input type for updating an existing todo.
 * All fields are optional except id which is used for identification.
 */
export type TodoUpdate = Partial<Pick<TodoRow, "title" | "completed">>
