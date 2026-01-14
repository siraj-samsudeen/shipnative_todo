# Backend Patterns

This guide explains how to work with the backend abstraction layer and when to use native APIs.

## TL;DR

| Task | What to Use |
|------|-------------|
| Auth in screens | `useAuth()` from `@/hooks` |
| Data fetching (Supabase) | React Query + `supabase.from()` |
| Data fetching (Convex) | `useQuery(api.xxx)` from `@/hooks/convex` |
| Real-time messages | `useRealtimeMessages()` from `@/hooks` |
| Provider-specific features | Native hooks from `@/hooks/supabase` or `@/hooks/convex` |

## The Mental Model

```
┌─────────────────────────────────────────┐
│           Screens / Components          │  ← Backend-agnostic
├─────────────────────────────────────────┤
│              useAuth()                  │  ← Unified (works with both)
├──────────────────┬──────────────────────┤
│   Supabase Path  │    Convex Path       │  ← Different paradigms
│                  │                       │
│  React Query     │  useQuery(api.xxx)   │  ← Different DX
│  supabase.from() │  useMutation(api.x)  │
│  RLS policies    │  Function guards     │
└──────────────────┴──────────────────────┘
```

**Key insight**: Auth is unified because email/OAuth flows are similar. Data fetching is NOT unified because Supabase (SQL) and Convex (reactive functions) are fundamentally different paradigms.

## Authentication

### The Unified Hook

Use `useAuth()` in all screens and components:

```typescript
import { useAuth, useUser, useAuthState } from '@/hooks'

function ProfileScreen() {
  const {
    user,                    // Unified AppUser object
    isAuthenticated,
    isLoading,
    signIn,                  // (email, password) => Promise
    signUp,                  // (email, password, metadata?) => Promise
    signOut,                 // () => Promise
    signInWithGoogle,        // () => Promise
    signInWithApple,         // () => Promise
    resetPassword,           // (email) => Promise
    updateProfile,           // (data) => Promise
    resendConfirmationEmail, // () => Promise
    completeOnboarding,      // () => Promise
  } = useAuth()

  // Lightweight alternatives
  const user = useUser()                    // Just the user
  const { isAuthenticated } = useAuthState() // Just the state
}
```

### Provider-Specific Auth Features

When you need features the unified hook doesn't expose:

```typescript
// Supabase: Magic link, OTP, session management
import { useSupabaseAuth } from '@/hooks/supabase'

const { sendMagicLink, verifyOtp, session } = useSupabaseAuth()

// Convex: OAuth providers, auth actions
import { useConvexAuth, useAuthActions } from '@/hooks/convex'

const { signIn } = useAuthActions()
await signIn('oauth', { provider: 'github' })
```

## Data Fetching

> **📱 See it in action:** The `DataDemoScreen` shows complete working examples for both backends.
> - Supabase version: `screens/DataDemoScreen.supabase.tsx`
> - Convex version: `screens/DataDemoScreen.convex.tsx`
>
> Navigate to it from any authenticated screen with `navigation.navigate('DataDemo')`.

### Supabase: SQL-like with React Query

Supabase uses PostgreSQL. Use React Query for caching and the Supabase SDK for queries:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

function UserList() {
  // Query with React Query
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // Mutation with cache invalidation
  const queryClient = useQueryClient()
  const createUser = useMutation({
    mutationFn: async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
```

### Convex: Reactive Queries

Convex queries are **reactive by default** - they auto-update when data changes. No manual refetching needed!

```typescript
import { useQuery, useMutation } from '@/hooks/convex'
import { api } from '@convex/_generated/api'

function UserList() {
  // Reactive query - auto-updates when data changes!
  const users = useQuery(api.users.list)

  // Mutation - auto-invalidates related queries
  const createUser = useMutation(api.users.create)

  const handleCreate = async () => {
    await createUser({ name: 'John', email: 'john@example.com' })
    // No need to refetch - useQuery auto-updates!
  }

  if (users === undefined) return <Loading />

  return <UserListView users={users} onCreate={handleCreate} />
}
```

**Define your Convex functions in `convex/` folder:**

```typescript
// convex/users.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  }
})

export const create = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', args)
  }
})
```

## What About `backend.db.query()`?

The abstraction layer provides a `DatabaseService` interface, but:

| Provider | `backend.db.query()` | Recommendation |
|----------|---------------------|----------------|
| **Supabase** | Works fine | Use for simple CRUD, but prefer direct SDK for complex queries |
| **Convex** | Returns errors/warnings | **Don't use** - use native `useQuery()` instead |

**Why?** Convex doesn't support direct table queries from the client. It's function-based by design. The abstraction can't bridge this fundamental difference.

## Real-time Features

### Messages & Chat

The `useRealtimeMessages` hook works with both backends:

```typescript
import { useRealtimeMessages } from '@/hooks'

function ChatRoom({ channelId }) {
  const {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    typingUsers,
    setTyping,
    isConnected,
  } = useRealtimeMessages({ channelId })

  // Supabase: Uses Postgres Changes + broadcast
  // Convex: Uses reactive queries + broadcast
}
```

### Presence

```typescript
import { useRealtimePresence } from '@/hooks'

function OnlineUsers({ channelId }) {
  const { users, updateStatus } = useRealtimePresence({
    channelId,
    userId: currentUser.id,
  })

  // Shows who's online in real-time
}
```

## Account Deletion

Account deletion works with both backends through the `DeleteAccountModal` component.

### How It Works

| Backend | Deletion Method |
|---------|-----------------|
| Supabase | Edge Function (`delete-user`) with fallback to direct API |
| Convex | Mutation (`api.users.deleteAccount`) |

The `DeleteAccountModal` automatically detects your backend and uses the appropriate deletion method:

```typescript
// DeleteAccountModal handles both backends automatically
import { DeleteAccountModal } from '@/components'

// In your Profile screen:
<DeleteAccountModal
  visible={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
/>
```

### Supabase Account Deletion Flow

1. Calls Edge Function `delete-user` for server-side deletion
2. Falls back to direct profile row deletion + auth API if Edge Function fails
3. Clears subscription state and signs out

### Convex Account Deletion Flow

1. Calls `api.users.deleteAccount` mutation
2. Clears subscription state
3. Resets auth store

## User Preferences & Onboarding

User preferences (theme, notifications) and onboarding status are handled differently by each backend.

### How It Works

| Feature | Supabase | Convex |
|---------|----------|--------|
| Dark Theme | `profiles.dark_mode_enabled` column | `users.preferences.theme` field |
| Push Notifications | `profiles.push_notifications_enabled` | `users.preferences.notifications` |
| Onboarding Status | `profiles.has_completed_onboarding` | `users.hasCompletedOnboarding` |
| Push Tokens | `push_tokens` table | `pushTokens` table |

### Supabase: preferencesSync Service

```typescript
import { syncDarkModePreference, syncPushNotificationsPreference } from '@/services/preferencesSync'

// Sync preferences to database (fire-and-forget)
syncDarkModePreference(userId, true)
syncPushNotificationsPreference(userId, enabled)
```

### Convex: Mutations

```typescript
import { useMutation } from '@/hooks/convex'
import { api } from '@convex/_generated/api'

const updatePreferences = useMutation(api.users.updatePreferences)

// Update theme preference
await updatePreferences({ theme: 'dark' })

// Update notification preference
await updatePreferences({ notifications: true })
```

### Profile Screen & Home Screen

Both screens display user data from `useAuth()`:

```typescript
import { useAuth } from '@/hooks'

function ProfileScreen() {
  const { user, userId } = useAuth()

  // User data works with both backends
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User'
  const avatarUrl = user?.avatarUrl
}
```

### Onboarding Completion

```typescript
import { useAuth } from '@/hooks'

function OnboardingScreen() {
  const { completeOnboarding } = useAuth()

  const handleFinish = async () => {
    await completeOnboarding()
    // Supabase: Syncs to profiles.has_completed_onboarding
    // Convex: Calls api.users.completeOnboarding mutation
  }
}
```

## Security: Provider-Specific

Security is **not abstracted** because the models are fundamentally different.

### Supabase: Row Level Security (RLS)

```sql
-- In Supabase dashboard or migrations
CREATE POLICY "Users can only see own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### Convex: Function Guards

```typescript
// convex/profiles.ts
export const getMyProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')

    return await ctx.db
      .query('profiles')
      .filter(q => q.eq(q.field('userId'), identity.subject))
      .first()
  }
})
```

## Migration Between Providers

If you need to switch from Supabase to Convex (or vice versa):

### What transfers automatically:
- Screen components using `useAuth()`
- UI logic and state management
- Storage upload/download patterns

### What needs rewriting:
- Database schema (SQL → Convex schema.ts)
- Security rules (RLS → function guards)
- Data fetching (React Query → useQuery)
- Real-time subscriptions (different patterns)

### Setup Cleanup

During `yarn setup`, you can optionally remove the unused provider's code:

```
🧹 CLEANUP UNUSED BACKEND CODE

You selected SUPABASE as your backend.
We can remove the convex code to simplify your codebase.

Folders that would be removed:
   • apps/app/app/services/backend/convex/
   • apps/app/app/hooks/convex/
   • packages/backend/convex/

Remove unused convex backend code? (y/N)
```

## Best Practices

### Do:
- Use `useAuth()` for all auth operations in screens
- Use native data fetching for your chosen provider
- Use provider-specific security features (RLS or function guards)
- Consider removing unused provider code for clarity

### Don't:
- Use `backend.db.query()` with Convex
- Mix providers in the same codebase (choose one)
- Try to abstract away security - understand your provider's model
- Fight the paradigm - embrace SQL (Supabase) or reactive (Convex)

## Quick Reference

```typescript
// ✅ Auth (unified)
import { useAuth } from '@/hooks'

// ✅ Supabase data
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

// ✅ Convex data
import { useQuery, useMutation } from '@/hooks/convex'
import { api } from '@convex/_generated/api'

// ✅ Real-time (unified)
import { useRealtimeMessages, useRealtimePresence } from '@/hooks'

// ⚠️ Provider-specific auth
import { useSupabaseAuth } from '@/hooks/supabase'
import { useConvexAuth, useAuthActions } from '@/hooks/convex'

// ❌ Don't use for Convex
backend.db.query('users')  // Returns error
```
