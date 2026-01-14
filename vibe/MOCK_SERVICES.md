# Mock Services Guide for AI Assistants

This document explains the mock service architecture to help AI assistants understand how to work with the codebase when API keys are not available.

## Overview

This project uses **automatic mock services** for Supabase and other services (PostHog, Sentry, RevenueCat) that activate when API keys are missing in development.

> **Recommendation**: Set up real API keys from the start. Supabase, PostHog, and Sentry all have generous free tiers and take ~5 minutes to configure. This avoids surprises when you switch from mocks to production.

> **Important**: Mock mode is available for **Supabase** backend only. If using **Convex**, run `npx convex dev` for local development instead.

**When to use mock mode**:
- Quick UI prototyping before backend is ready
- Testing UI flows in isolation
- CI/CD environments without credentials

## Mock Service Architecture

### Automatic Detection

Mock services are automatically enabled based on environment variables:

```typescript
// apps/app/app/services/mocks/index.ts
export const USE_MOCK_SUPABASE = __DEV__ && !process.env.EXPO_PUBLIC_SUPABASE_URL
export const USE_MOCK_POSTHOG = __DEV__ && !process.env.EXPO_PUBLIC_POSTHOG_API_KEY
export const USE_MOCK_REVENUECAT = __DEV__ && 
  ((Platform.OS === "web" && !process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY) ||
   (Platform.OS !== "web" && !process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY && 
    !process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY))
export const USE_MOCK_SENTRY = __DEV__ && !process.env.EXPO_PUBLIC_SENTRY_DSN
```

**Key Point for AIs**: When a user asks for "frontend only" or "without backend", the mock services will automatically handle all backend operations.

### Available Mock Services

| Service | Mock Location | Real Service | Purpose |
|---------|--------------|--------------|---------|
| Supabase | `services/mocks/supabase/` | `@supabase/supabase-js` | Auth & Database |
| PostHog | `services/mocks/posthog.ts` | `posthog-react-native` / `posthog-js` | Analytics |
| Sentry | `services/mocks/sentry.ts` | `@sentry/react-native` / `@sentry/react` | Error Tracking |
| RevenueCat | `services/mocks/revenueCat.ts` | `react-native-purchases` (mobile) / `@revenuecat/purchases-js` (web) | Payments (iOS, Android, Web) |

> **Note**: Convex does not have mock services. Use `npx convex dev` for local Convex development.

---

## Mock Service Capabilities

### 1. Supabase Mock (`services/mocks/supabase.ts`)

**Authentication**:
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign out
- ✅ Session management (persists in SecureStore)
- ✅ Password reset (simulated)
- ✅ User updates
- ✅ Auth state listeners
- ✅ OAuth (Google, Apple, GitHub, Twitter) - realistic flow simulation

**Database**:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Query filters: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`
- ✅ Ordering: `order(column, { ascending })`
- ✅ Limiting: `limit(n)`, `range(from, to)`
- ✅ Single row queries: `single()`, `maybeSingle()`
- ✅ Upsert operations
- ✅ In-memory storage with SecureStore persistence

**Storage** (NEW):
- ✅ File upload (`upload()`)
- ✅ File download (`download()`)
- ✅ File removal (`remove()`)
- ✅ List files (`list()`)
- ✅ Public URLs (`getPublicUrl()`)
- ✅ Signed URLs (`createSignedUrl()`)
- ✅ Bucket management (create, delete, list)

**Realtime** (NEW):
- ✅ Channel subscriptions
- ✅ Postgres changes (INSERT, UPDATE, DELETE)
- ✅ Trigger events programmatically for testing
- ✅ Filter support

**RPC** (NEW):
- ✅ Custom RPC handler registration
- ✅ Test stored procedures without database

**Example Usage**:
```typescript
// This works exactly the same with mock or real Supabase
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('author_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)
```

**Testing Utilities**:
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Seed data for testing
mockSupabaseHelpers.seedTable('posts', [
  { id: 1, title: 'Post 1', content: 'Content 1' },
  { id: 2, title: 'Post 2', content: 'Content 2' },
])

// Get all data
const posts = mockSupabaseHelpers.getTableData('posts')

// Clear all data
mockSupabaseHelpers.clearAll()
```

**Error Simulation** (for testing error handling):
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Simulate auth errors
mockSupabaseHelpers.simulateError('auth', 'signIn', new Error('Network error'))

// Simulate database errors
mockSupabaseHelpers.simulateError('database', 'posts.select', new Error('Permission denied'))

// Clear simulated errors
mockSupabaseHelpers.clearSimulatedErrors()
```

**Storage** (for file uploads):
```typescript
import { supabase } from './services/supabase'

// Upload a file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123/avatar.png', fileBlob, { contentType: 'image/png' })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.png')

// Download a file
const { data: blob } = await supabase.storage
  .from('avatars')
  .download('user-123/avatar.png')

// List files
const { data: files } = await supabase.storage
  .from('avatars')
  .list('user-123/')
```

**Storage Testing Utilities**:
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Seed storage with test files
mockSupabaseHelpers.seedStorage([
  { bucket: 'avatars', path: 'user-123/avatar.png', data: 'base64data...' }
])

// Get all storage files
const files = mockSupabaseHelpers.getStorageFiles()

// Get files in specific bucket
const avatars = mockSupabaseHelpers.getBucketFiles('avatars')

// Clear all storage
mockSupabaseHelpers.clearStorage()
```

**Realtime Subscriptions**:
```typescript
import { supabase } from './services/supabase'

// Subscribe to database changes
const channel = supabase
  .channel('posts-channel')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('New post:', payload.new)
    }
  )
  .subscribe()

// Unsubscribe
channel.unsubscribe()
```

**Realtime Testing Utilities**:
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Trigger a realtime event (simulates database change)
mockSupabaseHelpers.triggerRealtimeEvent('posts', 'INSERT', { 
  id: 1, 
  title: 'New Post' 
})

// Get active subscriptions
const subs = mockSupabaseHelpers.getRealtimeSubscriptions()

// Clear all subscriptions
mockSupabaseHelpers.clearRealtimeSubscriptions()
```

**OAuth Flow** (realistic simulation):
```typescript
import { supabase } from './services/supabase'

// Start OAuth flow
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'apple', 'github', 'twitter'
  options: {
    redirectTo: 'myapp://auth-callback'
  }
})
// Mock simulates user completing OAuth after 1.5s delay
// Auth state listener will receive SIGNED_IN event
```

**OAuth Testing Utilities**:
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Check if OAuth is pending
if (mockSupabaseHelpers.hasPendingOAuth()) {
  // Manually complete with custom email
  await supabase.auth.simulateOAuthCallback('user@gmail.com')
}

// Cancel pending OAuth
mockSupabaseHelpers.cancelPendingOAuth()
```

**Custom RPC Handlers**:
```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Register a custom RPC handler
mockSupabaseHelpers.registerRpcHandler('get_user_stats', async (params) => ({
  data: { posts: 10, followers: 100, user_id: params?.user_id },
  error: null
}))

// Now this works in mock mode:
const { data } = await supabase.rpc('get_user_stats', { user_id: '123' })
// Returns: { posts: 10, followers: 100, user_id: '123' }

// Unregister
mockSupabaseHelpers.unregisterRpcHandler('get_user_stats')
```

---

### 2. PostHog Mock (`services/mocks/posthog.ts`)

**Analytics**:
- ✅ Event tracking
- ✅ Screen tracking
- ✅ User identification
- ✅ User properties
- ✅ Feature flags (simulated)
- ✅ Groups (B2B analytics)
- ✅ Opt in/out

**Feature Flags**:
```typescript
// Mock returns simulated flags
posthog.isFeatureEnabled('new-feature') // true
posthog.getFeatureFlag('test-variant') // 'control'
```

**Testing Utilities**:
```typescript
const mockPostHog = new MockPostHog({ apiKey: 'test' })

// Track events
mockPostHog.track('button_clicked')

// Get tracked events
const events = mockPostHog.getEvents()

// Set feature flags for testing
mockPostHog.setFeatureFlag('new-feature', true)
```

---

### 3. Sentry Mock (`services/mocks/sentry.ts`)

**Error Tracking**:
- ✅ Exception capturing
- ✅ Message logging
- ✅ Breadcrumbs
- ✅ User context
- ✅ Tags and extras
- ✅ Performance monitoring (simulated)

**Console Output**:
```
🐛 [MockSentry] Exception: Error message
🐛 [MockSentry] Stack: ...
🐛 [MockSentry] Tags: { component: 'PaymentForm' }
🐛 [MockSentry] Breadcrumbs: [...]
```

**Testing Utilities**:
```typescript
import { mockSentry } from './services/mocks/sentry'

// Get captured errors
const errors = mockSentry.getErrors()

// Get breadcrumbs
const breadcrumbs = mockSentry.getBreadcrumbs()

// Clear history
mockSentry.clearErrors()
```

---

### 4. RevenueCat Mock (`services/mocks/revenueCat.ts`)

**Subscriptions**:
- ✅ Purchase flow (always succeeds)
- ✅ Restore purchases
- ✅ Get offerings/packages
- ✅ Customer info
- ✅ Entitlements
- ✅ Subscription states (active, expired, cancelled)

**Testing**:
```typescript
import { mockRevenueCat } from './services/mocks/revenueCat'

// Simulate subscription states
mockRevenueCat.setProStatus(true) // User is now Pro
mockRevenueCat.setProStatus(false) // User is now Free

// Check current status
const isPro = mockRevenueCat.getIsPro()

// Reset to initial state (useful for testing)
mockRevenueCat.reset()
```

---

---

## AI Assistant Guidelines

### When User Asks for "Frontend Only"

**DO**:
1. ✅ Use mock services - they're already set up
2. ✅ Write code as if backend exists
3. ✅ Use real Supabase/PostHog/etc. APIs
4. ✅ Explain that mocks will handle it automatically

**DON'T**:
1. ❌ Create fake data in components
2. ❌ Use `useState` for data that should come from backend
3. ❌ Skip database operations
4. ❌ Tell user they need to set up backend first

**Example Response**:
```
I'll create the feature using Supabase for data storage. Since you don't have 
API keys set up, the mock Supabase service will automatically handle all 
database operations in memory. The code will work exactly the same when you 
add real Supabase credentials later.
```

### When User Wants to Test Features

**Seed Mock Data**:
```typescript
// In a test setup file or component
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Seed posts
mockSupabaseHelpers.seedTable('posts', [
  {
    id: 1,
    title: 'Welcome Post',
    content: 'This is a test post',
    author_id: 'mock-user-123',
    created_at: new Date().toISOString(),
  },
])

// Seed user profiles
mockSupabaseHelpers.seedTable('profiles', [
  {
    id: 'mock-user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
  },
])
```

### When Implementing New Features

**Always use the real service APIs**:

```typescript
// ✅ GOOD - Works with both mock and real
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('author_id', userId)

// ❌ BAD - Hardcoded data
const data = [
  { id: 1, title: 'Post 1' },
  { id: 2, title: 'Post 2' },
]
```

### When User Mentions "No Backend"

**Clarify**:
```
This project has mock services that simulate the backend automatically. You can:

1. Develop the entire frontend without any backend setup
2. All database queries, auth, analytics work via mocks
3. When ready for production, just add API keys
4. No code changes needed - mocks use the same API

Would you like me to proceed with the mock services, or do you want to set up 
real backend services first?
```

---

## Mock Service Behavior

### Data Persistence

**During App Session**:
- ✅ Data persists in memory
- ✅ Auth sessions maintained
- ✅ Database queries work across components

**On App Restart**:
- ❌ All mock data is cleared
- ❌ User logged out
- ❌ Database tables empty

**Solution for Testing**:
Use `mockSupabaseHelpers.seedTable()` in app initialization or test setup.

### Network Delays

Mocks simulate realistic network delays:
```typescript
// Simulated delays
await delay(500)  // Database queries
await delay(200)  // Auth operations
await delay(1000) // Purchases
```

This helps test loading states and user experience.

### Console Logging

All mock operations log to console:
```
🔐 [MockSupabase] Sign in: user@example.com
💾 [MockSupabase] SELECT * FROM posts
📊 [MockPostHog] Event: button_clicked
🐛 [MockSentry] Exception: Error message
💰 [MockRevenueCat] Purchase: pro_monthly
```

This helps with debugging and understanding data flow.

---

## Common Patterns

### Authentication Flow

```typescript
import { useAuth } from './hooks/useAuth'

function LoginScreen() {
  const { signIn, loading } = useAuth()
  
  const handleLogin = async () => {
    // Works with both mock and real Supabase
    const { error } = await signIn({
      email: 'user@example.com',
      password: 'password123',
    })
    
    if (error) {
      alert(error.message)
    }
  }
  
  return <Button onPress={handleLogin} disabled={loading} />
}
```

### Database Queries

```typescript
import { supabase } from './services/supabase'

function PostsList() {
  const [posts, setPosts] = useState([])
  
  useEffect(() => {
    // Works with both mock and real Supabase
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setPosts(data)
    }
    
    fetchPosts()
  }, [])
  
  return <FlatList data={posts} ... />
}
```

### Analytics Tracking

```typescript
import { useAnalytics } from './hooks/useAnalytics'

function ProductScreen() {
  const { trackEvent, trackScreen } = useAnalytics()
  
  useEffect(() => {
    // Works with both mock and real PostHog
    trackScreen('ProductScreen', { product_id: '123' })
  }, [])
  
  const handlePurchase = () => {
    // Works with both mock and real PostHog
    trackEvent('purchase_clicked', {
      product_id: '123',
      price: 29.99,
    })
  }
  
  return <Button onPress={handlePurchase} />
}
```

---

## Transitioning to Production

When ready to use real services:

1. **Add API Keys** to `.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
EXPO_PUBLIC_POSTHOG_API_KEY=your-key
EXPO_PUBLIC_SENTRY_DSN=your-dsn
# etc.
```

2. **Restart App**:
```bash
yarn app:start --clear
```

3. **No Code Changes Needed**:
The same code works with real services!

---

## Mock Service Limitations

> **Recommendation**: Set up real Supabase from the start. Free tier is generous, setup takes ~5 minutes, and you avoid mock/production drift.

| Feature | Mock Support | Notes |
|---------|--------------|-------|
| Basic CRUD | ✅ Full | Works identically |
| Auth (email/password) | ✅ Full | Session persistence included |
| Auth (OAuth) | ✅ Simulated | Simulates flow, no real provider |
| Query filters (eq, gt, lt, etc.) | ✅ Full | Standard filters work |
| Ordering & Limiting | ✅ Full | Works identically |
| Storage API | ✅ Full | Upload, download, list, URLs |
| Realtime Subscriptions | ⚠️ Manual | Must trigger events manually |
| Row Level Security | ❌ None | **No permission checks** |
| Complex joins/relations | ❌ None | Single table queries only |
| Database functions/triggers | ❌ None | Not supported |
| Full-text search | ❌ None | Not supported |

**When mocks make sense**:
- Quick UI prototyping (< 1 day)
- CI/CD without credentials
- Isolated component testing

**When to use real services** (recommended):
- Any serious development
- Testing auth flows with real providers
- Testing Row Level Security
- Anything beyond basic CRUD

---

## Summary for AI Assistants

**Key Takeaways**:

1. **Recommend real API keys** - Free tiers are generous, setup is quick, avoids mock/production drift
2. **Mock services are for Supabase backend only** - Convex uses `npx convex dev` instead
3. **Mocks cover basic CRUD, auth, and storage** - Enough to build and test UI
4. **Same API for mock and real** - No code changes needed
5. **Mocks have limitations** - No RLS, no complex joins, no DB triggers

**What mocks handle well**:
- ✅ Basic CRUD operations
- ✅ Auth flows (sign up, sign in, OAuth simulation)
- ✅ File storage (upload, download, URLs)
- ✅ Simple queries with filters

**What mocks don't handle**:
- ❌ Row Level Security (no permission checks)
- ❌ Complex joins/relations
- ❌ Database functions/triggers
- ❌ Full-text search

**When in doubt**:
- Recommend setting up real Supabase (5 min, free tier)
- If user insists on no setup, mocks work for basic flows
- If using Convex: `npx convex dev` is required (no mocks)
