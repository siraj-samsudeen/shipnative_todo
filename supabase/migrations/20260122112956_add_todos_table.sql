-- =====================================================================
-- TODOS TABLE MIGRATION
-- =====================================================================
-- Adds todos table with Row Level Security for user-specific todo items
-- Created: 2026-01-22

-- Create the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Todo data
    description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
    completed BOOLEAN DEFAULT false NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Policies for todos table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON public.todos(completed);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos(created_at DESC);

-- Trigger for todos table to update updated_at timestamp
DROP TRIGGER IF EXISTS on_todos_updated ON public.todos;
CREATE TRIGGER on_todos_updated
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update delete_user_account function to include todos cleanup
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Must be authenticated to delete account';
    END IF;

    -- App tables (extend to any tables that reference the user)
    DELETE FROM public.todos WHERE user_id = v_user_id;
    DELETE FROM public.push_tokens WHERE user_id = v_user_id;
    DELETE FROM public.user_preferences WHERE id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;

    -- Remove the auth user (requires definer rights)
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
