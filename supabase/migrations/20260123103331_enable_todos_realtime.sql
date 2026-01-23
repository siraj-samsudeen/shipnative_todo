-- =====================================================================
-- ENABLE REALTIME FOR TODOS TABLE
-- =====================================================================
-- Enables Supabase realtime replication for the todos table
-- This allows the useTodosRealtime() hook to receive live updates
-- Created: 2026-01-23

-- Enable realtime replication for todos table
-- This is idempotent - safe to run multiple times
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;

