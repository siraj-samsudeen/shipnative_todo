# Supabase Migrations

This directory contains database migration files for the Supabase backend. Migrations allow you to version control your database schema changes and apply them consistently across different environments.

**Why migrations instead of `schema.sql`?** Migrations provide version control and prevent "already exists" errors when running the schema multiple times. They're the industry standard for managing database schemas in production (used by Rails, Django, Laravel, Prisma, etc.).

## Why Use Migrations?

- **Version Control**: Track all database schema changes in git
- **Reproducibility**: Easily recreate your database schema in any environment
- **Collaboration**: Multiple developers can work on schema changes without conflicts
- **Rollback**: Ability to revert changes if needed
- **Documentation**: Each migration file documents what changed and why

## Migration File Naming Convention

Migration files follow this naming pattern:
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

Example: `20260122101738_initial_schema.sql`

The timestamp ensures migrations run in chronological order.

## Creating a New Migration

### Using Supabase CLI (Recommended)

```bash
# Create a new migration file
supabase migration new add_todos_table

# This creates a new file like: supabase/migrations/20260122120000_add_todos_table.sql
```

Then edit the file to add your SQL changes.

### Manual Creation

1. Create a new file with the timestamp format:
   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_todos_table.sql
   ```

2. Add your SQL statements to the file:
   ```sql
   -- Add todos table
   CREATE TABLE IF NOT EXISTS public.todos (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       title TEXT NOT NULL,
       completed BOOLEAN DEFAULT false,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

   -- Add policies
   CREATE POLICY "Users can view own todos"
       ON public.todos
       FOR SELECT
       USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own todos"
       ON public.todos
       FOR INSERT
       WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own todos"
       ON public.todos
       FOR UPDATE
       USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own todos"
       ON public.todos
       FOR DELETE
       USING (auth.uid() = user_id);
   ```

## Applying Migrations

### Local Development

If you're using Supabase locally:

```bash
# Start local Supabase (applies all migrations automatically)
supabase start

# Or apply migrations to running local instance
supabase db reset
```

### Remote/Production

#### Option 1: Supabase CLI (Recommended)

```bash
# Link your project (one-time setup)
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push
```

#### Option 2: Manual Application

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and click **Run**

## Migration Best Practices

### 1. Always Use `IF NOT EXISTS`

This makes migrations idempotent (safe to run multiple times):

```sql
CREATE TABLE IF NOT EXISTS public.todos (...);
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
```

### 2. Drop Policies Before Recreating

Always drop policies before recreating them to avoid conflicts:

```sql
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
CREATE POLICY "Users can view own todos"
    ON public.todos
    FOR SELECT
    USING (auth.uid() = user_id);
```

### 3. Always Enable RLS on New Tables

Every table that stores user data should have Row Level Security enabled:

```sql
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
```

### 4. Add Indexes for Foreign Keys

Always add indexes for columns used in WHERE clauses or JOINs:

```sql
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos(created_at DESC);
```

### 5. Use Descriptive Migration Names

Good examples:
- `add_todos_table.sql`
- `add_user_avatar_column.sql`
- `create_posts_table.sql`
- `add_indexes_to_todos.sql`

Bad examples:
- `migration.sql`
- `update.sql`
- `fix.sql`

### 6. One Migration Per Feature

Keep migrations focused on a single feature or change. This makes them easier to understand and rollback if needed.

### 7. Never Modify Existing Migrations

Once a migration is applied to production, never modify it. Instead, create a new migration to make changes.

### 8. Test Migrations Locally First

Always test migrations on local Supabase before applying to production:

```bash
supabase start
supabase db reset  # This will apply all migrations
```

## Common Migration Patterns

### Adding a New Table

```sql
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posts"
    ON public.posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
```

### Adding a Column

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;
```

### Adding an Index

```sql
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
```

### Adding a Trigger

```sql
DROP TRIGGER IF EXISTS on_posts_updated ON public.posts;
CREATE TRIGGER on_posts_updated
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

## Rollback Strategy

If you need to rollback a migration:

1. Create a new migration that reverses the changes:
   ```bash
   supabase migration new rollback_add_todos_table
   ```

2. Add the reverse SQL statements:
   ```sql
   DROP TABLE IF EXISTS public.todos CASCADE;
   ```

3. Apply the rollback migration

## Troubleshooting

### Migration Fails with "relation already exists"

This means the table/index already exists. Use `IF NOT EXISTS` or `IF EXISTS` clauses.

### Migration Fails with "policy already exists"

Drop the policy before recreating it:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Changes Not Appearing After Migration

1. Check migration was applied successfully
2. Verify RLS policies allow access to the data
3. Check if you need to refresh your Supabase client

## Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
