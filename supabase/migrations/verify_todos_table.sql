-- Verification queries for todos table migration
-- Run these in the Supabase SQL Editor to verify the migration was successful

-- 1. Check if todos table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'todos';

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'todos'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'todos';

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'todos';

-- 5. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'todos';

-- 6. Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'todos';

-- Expected results:
-- ✓ Table 'todos' should exist
-- ✓ RLS should be enabled (rowsecurity = true)
-- ✓ 4 policies should exist (view, insert, update, delete)
-- ✓ 3 indexes should exist (user_id, completed, created_at)
-- ✓ 1 trigger should exist (on_todos_updated)
