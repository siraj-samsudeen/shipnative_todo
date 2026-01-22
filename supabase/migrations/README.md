# Supabase Migrations

## Overview

This directory contains database migrations for your Supabase project. Migrations are versioned SQL files (named with timestamps) that track incremental changes to your database schema.

Each `.sql` file in this directory represents a single database change that can be applied in order.

## Applying Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# 2. Push all pending migrations to your remote database
supabase db push
```

### Option 2: Using Supabase Dashboard (Manual)

If you prefer to apply manually:

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Open the migration file you want to apply (e.g., `20260122112956_add_todos_table.sql`)
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

## Migration Workflow

### Creating New Migrations

When you need to make database changes:

```bash
# Generate a new migration file
supabase migration new your_migration_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql
# Edit the file and add your SQL changes
```

### Applying Migrations

```bash
# Apply to remote database
supabase db push

# Apply to local development database
supabase db reset  # Resets and applies all migrations
```

### Syncing Schema Changes

If you made changes directly in the Supabase dashboard:

```bash
# Pull remote schema changes into a new migration
supabase db pull

# This creates a new migration file with the differences
```

**Important**: `supabase db pull` creates a NEW migration file - it doesn't overwrite your existing files.

## Understanding schema.sql vs migrations/

- **`supabase/schema.sql`**: Complete database schema showing the current state (documentation/reference)
- **`supabase/migrations/*.sql`**: Individual incremental changes applied in chronological order (version control)

Think of `schema.sql` as a snapshot of "what the database looks like now" and `migrations/` as "how we got here".

## Best Practices

1. **Never edit schema.sql directly for changes** - Create migrations instead
2. **Always use migrations for team collaboration** - They track who changed what and when
3. **Test migrations locally first** - Use `supabase db reset` to test before pushing
4. **Keep migrations small and focused** - One logical change per migration
5. **Don't modify existing migrations** - Create new ones to fix issues

## Verification

After applying the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'todos';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'todos';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'todos';
```

## Rollback

If you need to remove the todos table:

```sql
DROP TABLE IF EXISTS public.todos CASCADE;
```

Note: This will permanently delete all todo data.
