# Technical Design: Todo Application

## Overview

A minimal todo application built with React Native and Expo, using Supabase for backend storage and React Query for server state management. The app provides CRUD operations for todo items with a clean, theme-aware UI. Todos are stored per-user with Row Level Security (RLS).

## Architecture

### State Management

The application uses React Query for server state management with Supabase as the backend. This provides:
- Automatic caching and background refetching
- Optimistic updates for responsive UI
- Cross-device sync via Supabase
- User-scoped data via RLS

### Data Model

```typescript
// Supabase table: todos
interface TodoRow {
  id: string           // UUID primary key
  user_id: string      // Foreign key to auth.users
  title: string        // Task text (non-empty, trimmed)
  completed: boolean   // Completion status, default false
  created_at: string   // Timestamp for ordering
}
```

### Database Schema

```sql
-- Migration: create_todos_table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Users can only access their own todos
CREATE POLICY "Users can view own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
```

### Component Structure

```
TodoScreen
├── Header (title)
├── TodoInput (add new todos)
├── TodoList
│   ├── EmptyState (when no todos)
│   └── TodoItem[] (list of todos)
│       ├── Checkbox (toggle completion)
│       ├── Description (text, editable)
│       └── DeleteButton (remove todo)
```

## Components

### TodoScreen
Main screen component that composes the todo interface.
- Uses `Screen` component with scroll preset
- Renders `TodoInput` and `TodoList`
- Requires authenticated user

### TodoInput
Text input for adding new todos.
- Validates input (rejects whitespace-only)
- Clears on successful add
- Supports Enter key submission

### TodoItem
Individual todo item display with edit/delete capabilities.
- Tap checkbox to toggle completion
- Long press or edit button to enter edit mode
- Swipe or delete button to remove
- Visual strikethrough for completed items

### TodoList
FlatList wrapper for rendering todos.
- Shows `EmptyState` when list is empty
- Shows loading state while fetching
- Renders `TodoItem` for each todo

## Hooks

### useTodos
React Query hook for fetching user's todos.

```typescript
const { data: todos, isLoading, error } = useTodos()
```

### useTodoMutations
Mutations for CRUD operations with optimistic updates.

```typescript
const { addTodo, toggleTodo, updateTodo, deleteTodo } = useTodoMutations()
```

## File Structure

```
apps/app/app/
├── screens/
│   └── TodoScreen.tsx
├── components/
│   ├── TodoInput.tsx
│   ├── TodoItem.tsx
│   └── TodoList.tsx
├── hooks/
│   └── useTodos.ts
├── types/
│   └── todo.ts
└── i18n/
    └── en.ts (add todo translations)

supabase/migrations/
└── YYYYMMDD_create_todos_table.sql
```

## Correctness Properties

### Property 1: Add Todo Validity
**Validates: Requirements 1.1, 1.2**

For any input string `s`:
- If `s.trim().length > 0`, then `addTodo(s)` succeeds and the todo list contains a new item with `title === s.trim()`
- If `s.trim().length === 0`, then `addTodo(s)` is prevented client-side and the todo list remains unchanged

### Property 2: Toggle Idempotence
**Validates: Requirement 3.1**

For any todo with id `id` and initial completion status `c`:
- After `toggleTodo(id)`, the todo's completion status is `!c`
- After `toggleTodo(id)` twice, the todo's completion status is `c`

### Property 3: Edit Todo Validity
**Validates: Requirements 4.2, 4.3**

For any existing todo with id `id` and original title `t`, and any input string `s`:
- If `s.trim().length > 0`, then `updateTodo(id, s)` succeeds and the todo's title becomes `s.trim()`
- If `s.trim().length === 0`, then `updateTodo(id, s)` is prevented client-side and the todo's title remains `t`

### Property 4: Delete Removes Todo
**Validates: Requirement 5.1**

For any todo with id `id` that exists in the list:
- After `deleteTodo(id)`, no todo with that id exists in the list
- The count of todos decreases by exactly 1

### Property 5: User Isolation (RLS)
**Validates: Security**

For any two users A and B:
- User A cannot read, update, or delete todos belonging to User B
- Todos created by User A have `user_id === A.id`

## Testing Strategy

### Unit Tests
- useTodos hook: Test query behavior with mocked Supabase
- useTodoMutations: Test mutations and optimistic updates
- TodoInput: Test validation and submission behavior
- TodoItem: Test toggle, edit, and delete interactions

### Integration Tests
- Full screen rendering with mock data
- User interaction flows (add, complete, edit, delete)
- Loading and error states

## Dependencies

All dependencies are already in the project:
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Server state management
- `uuid` - ID generation (handled by Supabase)
