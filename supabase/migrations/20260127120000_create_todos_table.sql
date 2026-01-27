-- =====================================================================
-- Create Todos Table Migration
-- =====================================================================
-- This migration creates the todos table for the Todo Application.
--
-- Features included:
-- - User-scoped todo items with RLS
-- - CRUD operations via RLS policies
-- - Index for query performance
--
-- Requirements: 2.1 (Display all Todo_Items), 5.1 (Delete removes Todo_Item)
-- =====================================================================

-- =====================================================================
-- TODOS TABLE
-- =====================================================================
-- Stores todo items for users
-- Each todo belongs to a single user (user_id references auth.users)

CREATE TABLE IF NOT EXISTS public.todos (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference (required, cascades on user deletion)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Todo data
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================
-- Users can only access their own todos

-- Users can view their own todos
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
CREATE POLICY "Users can view own todos"
    ON public.todos
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own todos
DROP POLICY IF EXISTS "Users can insert own todos" ON public.todos;
CREATE POLICY "Users can insert own todos"
    ON public.todos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
CREATE POLICY "Users can update own todos"
    ON public.todos
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own todos
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;
CREATE POLICY "Users can delete own todos"
    ON public.todos
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================================
-- INDEXES
-- =====================================================================
-- Index on user_id for faster queries when fetching user's todos

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
