# Convex Guide

This guide explains how to use Convex for authentication, database, and real-time features in your app.

## Quick Start

### Local Development

Convex provides a local development server with hot reloading - this is better than mock mode:

```bash
# 1. Install Convex CLI (if not already installed)
npm install -g convex

# 2. Start local Convex dev server (in one terminal)
npx convex dev

# 3. Run the app (in another terminal)
yarn app:ios  # or yarn app:android or yarn web:dev
```

The local dev server gives you:
- ✅ Real database with your schema
- ✅ Hot reloading when you change functions
- ✅ Type-safe queries and mutations
- ✅ Full auth flow testing

> **Note**: Unlike Supabase, Convex does not have a mock mode. The local dev server provides a better development experience.

### Production Setup

#### 1. Create Convex Project

```bash
# Install Convex CLI
npm install -g convex

# Initialize Convex in your project
npx convex init

# Deploy your schema and functions
npx convex deploy
```

#### 2. Get Your Deployment URL

After running `npx convex deploy`, you'll get a URL like:
```
https://your-project-123.convex.cloud
```

#### 3. Add to Environment

Add to `.env`:
```bash
EXPO_PUBLIC_CONVEX_URL=https://your-project-123.convex.cloud
EXPO_PUBLIC_BACKEND_PROVIDER=convex
```

#### 4. Set Up Authentication Keys (Required)

Convex Auth requires `JWT_PRIVATE_KEY` and `JWKS` environment variables for signing and verifying tokens:

```bash
# Generate and set both keys automatically
npx @convex-dev/auth
```

This will prompt you to generate and set both `JWT_PRIVATE_KEY` and `JWKS` in your Convex deployment.

> **Warning**: Both `JWT_PRIVATE_KEY` and `JWKS` are required. Missing either will cause sign-in to fail with "pkcs8 format" or similar errors.

If the CLI doesn't work (e.g., uncommitted changes), see the manual setup in the Mintlify docs.

#### 5. Configure OAuth Providers (Optional)

In the Convex dashboard (Settings → Environment Variables), set up your auth providers.

> **Security Note**: All OAuth secrets and private keys are stored in the Convex Dashboard, NOT in client-side `.env` files. This is intentional - `EXPO_PUBLIC_*` variables are bundled into your app and visible to users. Keep secrets server-side only.

**For Google OAuth:**
```bash
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

**For Apple Sign-In:**
```bash
AUTH_APPLE_ID=your-apple-services-id
AUTH_APPLE_SECRET=your-apple-client-secret
# Generate the client secret from your Apple .p8 private key
# See: https://developer.apple.com/documentation/sign_in_with_apple
```

**For GitHub OAuth:**
```bash
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

**For Magic Link / OTP (via Resend):**
```bash
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
APP_NAME=YourAppName
```

**For Mobile OAuth (Required):**
```bash
SITE_URL=https://your-project.convex.site
```

> **Note**: OAuth won't work on iOS/Android if `SITE_URL` is `localhost`. You must deploy to get a public URL.

---

## Authentication

### Using useAuth() (The Only Auth Hook You Need)

```typescript
import { useAuth } from '@/hooks'

function ProfileScreen() {
  const {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    signInWithMagicLink,
    verifyOtp,
    updateProfile,
  } = useAuth()

  if (isLoading) return <LoadingSpinner />

  if (!isAuthenticated) {
    return (
      <View>
        <Button
          onPress={signInWithGoogle}
          title="Sign in with Google"
        />
        <Button
          onPress={signInWithApple}
          title="Sign in with Apple"
        />
      </View>
    )
  }

  return (
    <View>
      <Text>Welcome, {user?.displayName || user?.email}</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  )
}
```

`useAuth()` is the ONLY auth hook you need. It works with both Supabase and Convex backends.

### Sign Up with Email/Password

```typescript
const { signUp } = useAuth()

const handleSignUp = async () => {
  const { error } = await signUp('user@example.com', 'password123')
  if (error) {
    console.error('Sign up error:', error)
  }
  // User is automatically signed in
}
```

### Sign In with Email/Password

```typescript
const { signIn } = useAuth()

const handleSignIn = async () => {
  const { error } = await signIn('user@example.com', 'password123')
  if (error) {
    console.error('Sign in error:', error)
  }
}
```

### Magic Link / OTP Sign In

Sign in with a one-time code sent via email (requires Resend setup for Convex).

```typescript
const { signInWithMagicLink, verifyOtp } = useAuth()
const [codeSent, setCodeSent] = useState(false)

// Step 1: Request OTP
const handleRequestOtp = async () => {
  const { error } = await signInWithMagicLink('user@example.com')
  if (!error) {
    setCodeSent(true)
    // User receives email with verification code
  } else {
    console.error('OTP request error:', error)
  }
}

// Step 2: Verify OTP
const handleVerifyOtp = async (code: string) => {
  const { error } = await verifyOtp('user@example.com', code)
  if (error) {
    console.error('OTP verification error:', error)
  }
  // User is signed in on success
}
```

### OAuth Sign In (Google, Apple)

```typescript
const { signInWithGoogle, signInWithApple } = useAuth()

// Google
const handleGoogleSignIn = async () => {
  const { error } = await signInWithGoogle()
  if (error) console.error('Google sign in error:', error)
}

// Apple
const handleAppleSignIn = async () => {
  const { error } = await signInWithApple()
  if (error) console.error('Apple sign in error:', error)
}
```

**Features:**
- Native Google Sign-In on iOS/Android (falls back to OAuth if unavailable)
- Proper in-app browser OAuth handling via `expo-web-browser`
- Error handling for user cancellation vs. actual failures

### Password Reset

```typescript
const { resetPassword } = useAuth()

const handleResetPassword = async () => {
  const { error } = await resetPassword('user@example.com')
  if (error) {
    console.error('Reset error:', error)
  } else {
    alert('Check your email for reset instructions')
  }
}
```

### Update Profile

```typescript
const { updateProfile } = useAuth()

const handleUpdateProfile = async () => {
  const { error } = await updateProfile({
    fullName: 'John Doe',
    bio: 'Software developer',
    avatarUrl: 'https://example.com/avatar.jpg',
  })
  if (error) console.error('Update error:', error)
}
```

### Complete Onboarding

```typescript
const { completeOnboarding, hasCompletedOnboarding } = useAuth()

// Check if user needs onboarding
if (!hasCompletedOnboarding) {
  return <OnboardingFlow onComplete={completeOnboarding} />
}
```

---

## Security

### Function-Level Security (RLS Alternative)

Unlike Supabase which has Row Level Security (RLS) at the database level, Convex enforces security at the function level. We provide security helpers in `convex/lib/security.ts`:

```typescript
import { requireAuth, requireOwnership, requireRole } from "./lib/security"

// Require authentication
export const myMutation = mutation({
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx) // Throws if not authenticated
    // ... safe to proceed
  }
})

// Require ownership of a document
export const updatePost = mutation({
  args: { postId: v.id("posts"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx)
    const post = await requireOwnership(ctx, "posts", args.postId, userId, "authorId")
    // User owns this post - safe to update
    await ctx.db.patch(args.postId, { title: args.title })
  }
})

// Require admin role
export const adminAction = mutation({
  handler: async (ctx) => {
    const userId = await requireAuth(ctx)
    await requireRole(ctx, userId, ["admin", "moderator"])
    // User is admin or moderator
  }
})
```

### Security Helpers Available

| Helper | Description |
|--------|-------------|
| `requireAuth(ctx)` | Throws if user not authenticated, returns userId |
| `getAuthUserId(ctx)` | Returns userId or null (no throw) |
| `requireOwnership(ctx, table, id, userId, field?)` | Throws if user doesn't own document |
| `isOwner(ctx, table, id, userId, field?)` | Returns boolean (no throw) |
| `requireRole(ctx, userId, roles[])` | Throws if user doesn't have required role |
| `filterByOwner(ctx, table, userId, field?)` | Returns only user's documents |
| `withAuth(handler)` | Wrapper that injects userId into handler |
| `auditLog(ctx, userId, action, metadata?)` | Log security-relevant actions (console only in dev) |

### Security Best Practices

1. **Always use security helpers** - Don't manually check auth in every function
2. **Check ownership before mutations** - Users should only modify their own data
3. **Use role-based access** for admin features
4. **Log sensitive operations** with `auditLog` (logs to console in development; extend for production logging)

---

## Seed Data

Populate your database with test data using the seed functions:

```bash
# Run seed script
npx convex run seed:run

# Check database status
npx convex run seed:status

# Clear all data (careful!)
npx convex run seed:clear --arg '{"confirm": true}'

# Add a single test user
npx convex run seed:addTestUser
npx convex run seed:addTestUser --arg '{"email": "test@example.com", "name": "Test User"}'
```

### Seed Data Includes

- **2 demo users** (demo@example.com, admin@example.com)
- **3 sample posts** (published and draft)
- **Sample comments** with threading
- **Welcome notifications** for each user

### Custom Seed Data

Modify `convex/seed.ts` to add your own seed data:

```typescript
const SEED_USERS = [
  {
    name: "Demo User",
    email: "demo@example.com",
    bio: "This is a demo account",
    // Add your custom fields
  },
]
```

---

## Real-Time Presence

Track which users are online in a channel (like a chat room or collaborative document):

### Join a Channel

```typescript
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'

function CollaborativeEditor({ documentId }) {
  const joinPresence = useMutation(api.realtime.joinPresence)
  const updatePresence = useMutation(api.realtime.updatePresence)
  const leavePresence = useMutation(api.realtime.leavePresence)

  // Get all users in the channel (reactive!)
  const presence = useQuery(api.realtime.getPresence, {
    channel: `document:${documentId}`
  })

  // Join on mount
  useEffect(() => {
    joinPresence({
      channel: `document:${documentId}`,
      state: { cursor: null, status: 'viewing' }
    })

    // Leave on unmount
    return () => {
      leavePresence({ channel: `document:${documentId}` })
    }
  }, [documentId])

  // Update cursor position
  const handleMouseMove = (e) => {
    updatePresence({
      channel: `document:${documentId}`,
      state: { cursor: { x: e.clientX, y: e.clientY }, status: 'editing' }
    })
  }

  return (
    <View>
      <Text>{presence?.count} users online</Text>
      {presence?.users.map(p => (
        <Avatar key={p.odbc} user={p.user} cursor={p.state?.cursor} />
      ))}
    </View>
  )
}
```

### Presence Heartbeat

Send periodic heartbeats to keep presence alive:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    updatePresence({ channel: `room:${roomId}` })
  }, 10000) // Every 10 seconds

  return () => clearInterval(interval)
}, [roomId])
```

---

## Real-Time Broadcast

Send ephemeral messages to all users in a channel:

### Send Broadcast

```typescript
const broadcast = useMutation(api.realtime.broadcast)

// Send cursor position to all users
const handleMouseMove = (e) => {
  broadcast({
    channel: `document:${documentId}`,
    event: 'cursor_move',
    payload: { userId: myUserId, x: e.clientX, y: e.clientY }
  })
}

// Send typing indicator
const handleTyping = () => {
  broadcast({
    channel: `chat:${chatId}`,
    event: 'typing',
    payload: { userId: myUserId }
  })
}
```

### Subscribe to Broadcasts

```typescript
function ChatRoom({ chatId }) {
  const [lastSeen, setLastSeen] = useState(Date.now() - 30000)

  // Subscribe to broadcasts (reactive query!)
  const broadcasts = useQuery(api.realtime.subscribeBroadcast, {
    channel: `chat:${chatId}`,
    since: lastSeen
  })

  // Handle new messages
  useEffect(() => {
    if (broadcasts?.messages) {
      for (const msg of broadcasts.messages) {
        if (msg.event === 'typing') {
          showTypingIndicator(msg.payload.userId)
        }
        if (msg.event === 'cursor_move') {
          updateCursor(msg.payload)
        }
      }
      // Update last seen to avoid re-processing
      setLastSeen(Date.now())
    }
  }, [broadcasts])
}
```

---

## Database Operations

### Queries (Reading Data)

```typescript
import { useQuery } from '@/hooks'
import { api } from '@convex/_generated/api'

function PostList() {
  // Automatically reactive - updates when data changes
  const posts = useQuery(api.posts.list)

  if (posts === undefined) return <Loading />

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
    />
  )
}
```

### Queries with Arguments

```typescript
const post = useQuery(api.posts.getById, { id: postId })
const userPosts = useQuery(api.posts.byUser, { userId })
```

### Conditional Queries

```typescript
// Skip query when no userId
const posts = useQuery(
  api.posts.byUser,
  userId ? { userId } : 'skip'
)
```

### Mutations (Writing Data)

```typescript
import { useMutation } from '@/hooks'
import { api } from '@convex/_generated/api'

function CreatePost() {
  const createPost = useMutation(api.posts.create)

  const handleSubmit = async () => {
    await createPost({
      title: 'My Post',
      content: 'Hello world!',
    })
  }

  return <Button onPress={handleSubmit} title="Create Post" />
}
```

### Actions (Server-Side Logic)

```typescript
import { useAction } from '@/hooks'
import { api } from '@convex/_generated/api'

function SendEmail() {
  const sendEmail = useAction(api.emails.send)

  const handleSend = async () => {
    await sendEmail({
      to: 'user@example.com',
      subject: 'Hello',
      body: 'Welcome to our app!',
    })
  }

  return <Button onPress={handleSend} title="Send Email" />
}
```

---

## Schema Definition

The schema is defined in `convex/schema.ts`. Key tables include:

| Table | Description |
|-------|-------------|
| `users` | User accounts with auth fields + custom fields |
| `profiles` | Extended user profile data |
| `posts` | Content with draft/published status |
| `comments` | Threaded comments |
| `notifications` | User notifications |
| `files` | File storage metadata |
| `presence` | Real-time user presence tracking |
| `broadcasts` | Ephemeral broadcast messages |
| `pushTokens` | Push notification tokens |
| `waitlist` | Pre-launch email signups |
| `auditLogs` | Security audit trail |

### Adding Custom Tables

```typescript
// In convex/schema.ts
myTable: defineTable({
  userId: v.id("users"),
  title: v.string(),
  data: v.any(),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_createdAt", ["createdAt"]),
```

---

## Writing Functions

### Queries

`convex/posts.ts`:

```typescript
import { query } from "./_generated/server"
import { v } from "convex/values"
import { requireAuth, getAuthUserId } from "./lib/security"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(50)
  },
})

export const myPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .collect()
  },
})
```

### Mutations with Security

```typescript
import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireAuth, requireOwnership } from "./lib/security"

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx)

    return await ctx.db.insert("posts", {
      authorId: userId,
      title: args.title,
      content: args.content,
      status: "draft",
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx)
    await requireOwnership(ctx, "posts", args.id, userId, "authorId")

    await ctx.db.patch(args.id, {
      ...(args.title && { title: args.title }),
      ...(args.content && { content: args.content }),
      updatedAt: Date.now(),
    })
  },
})
```

---

## File Storage

### Upload Files

```typescript
import { useMutation } from '@/hooks/convex'
import { api } from '@convex/_generated/api'

function FileUploader() {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const saveFile = useMutation(api.storage.saveFile)

  const uploadFile = async (file: File) => {
    // 1. Get upload URL
    const uploadUrl = await generateUploadUrl()

    // 2. Upload file
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    const { storageId } = await response.json()

    // 3. Save metadata
    await saveFile({
      storageId,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    })
  }

  return <Button onPress={() => pickAndUpload()} title="Upload" />
}
```

### Get File URLs

```typescript
import { useQuery } from '@/hooks/convex'
import { api } from '@convex/_generated/api'

function FileList() {
  const files = useQuery(api.storage.listMyFiles)

  return (
    <FlatList
      data={files}
      renderItem={({ item }) => (
        <View>
          <Text>{item.filename}</Text>
          <Image source={{ uri: item.url }} />
        </View>
      )}
    />
  )
}
```

---

## Cron Jobs

Automatic cleanup tasks run via cron jobs defined in `convex/crons.ts`:

| Job | Interval | Description |
|-----|----------|-------------|
| Cleanup stale presence | 1 minute | Removes presence records older than 1 minute |
| Cleanup expired broadcasts | 5 minutes | Removes broadcast messages past TTL |

### Adding Custom Crons

```typescript
// In convex/crons.ts
crons.interval(
  "my custom job",
  { hours: 1 },
  internal.myModule.myFunction,
  { arg1: "value" }
)
```

---

## Auth Configuration

The auth configuration is in `convex/auth.ts`:

```typescript
import { convexAuth } from "@convex-dev/auth/server"
import { Password } from "@convex-dev/auth/providers/Password"
import { Email } from "@convex-dev/auth/providers/Email"
import Google from "@auth/core/providers/google"
import Apple from "@auth/core/providers/apple"
import GitHub from "@auth/core/providers/github"

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password(),           // Email/password
    Email({ id: "resend", ... }),  // Magic link / OTP via Resend
    Google({...}),        // Google OAuth
    Apple({...}),         // Apple OAuth
    GitHub({...}),        // GitHub OAuth
  ],
})
```

---

## Type Safety

Convex provides end-to-end type safety:

```typescript
// Schema defines types
const schema = defineSchema({
  posts: defineTable({
    title: v.string(),
    views: v.number(),
  }),
})

// Generated types flow through
const posts = useQuery(api.posts.list)
// ^? Post[] | undefined

const createPost = useMutation(api.posts.create)
// TypeScript errors if you pass wrong args:
await createPost({ title: 123 }) // Error: number not assignable to string
```

---

## Best Practices

### 1. Use Security Helpers

```typescript
import { requireAuth, requireOwnership } from "./lib/security"

export const update = mutation({
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx)
    await requireOwnership(ctx, "posts", args.id, userId, "authorId")
    // Safe to proceed
  },
})
```

### 2. Use Indexes for Queries

```typescript
// Schema
posts: defineTable({...})
  .index("by_authorId", ["authorId"])
  .index("by_status", ["status"])

// Query - use the index
ctx.db.query("posts")
  .withIndex("by_authorId", (q) => q.eq("authorId", userId))
```

### 3. Handle Loading States

```typescript
const data = useQuery(api.posts.list)

if (data === undefined) {
  return <Loading /> // Query still loading
}

// Now data is Post[]
```

### 4. Use Optimistic Updates

```typescript
const sendMessage = useMutation(api.messages.send)
  .withOptimisticUpdate((localStore, args) => {
    const { channelId, text } = args
    const currentMessages = localStore.getQuery(api.messages.list, { channelId })
    if (currentMessages) {
      localStore.setQuery(api.messages.list, { channelId }, [
        ...currentMessages,
        { id: 'temp', text, pending: true },
      ])
    }
  })
```

---

## Environment Variables

### Client-Side (in `apps/app/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_CONVEX_URL` | Yes | Your Convex deployment URL |
| `EXPO_PUBLIC_BACKEND_PROVIDER` | Yes | Set to `convex` |

### Server-Side (set in Convex Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_PRIVATE_KEY` | **Yes** | RSA private key for signing auth tokens (run `npx @convex-dev/auth`) |
| `JWKS` | **Yes** | JSON Web Key Set for verifying tokens (run `npx @convex-dev/auth`) |
| `SITE_URL` | For OAuth | Public URL for OAuth callbacks (e.g., `https://your-project.convex.site`) |
| `AUTH_GOOGLE_ID` | For Google OAuth | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For Google OAuth | Google OAuth client secret |
| `AUTH_APPLE_ID` | For Apple Sign-In | Apple client ID |
| `AUTH_APPLE_SECRET` | For Apple Sign-In | Apple client secret |
| `AUTH_GITHUB_ID` | For GitHub OAuth | GitHub client ID |
| `AUTH_GITHUB_SECRET` | For GitHub OAuth | GitHub client secret |
| `RESEND_API_KEY` | For Magic Link/OTP | Resend API key |
| `RESEND_FROM_EMAIL` | For Magic Link/OTP | Sender email address |
| `APP_NAME` | Optional | App name for emails |

---

## Troubleshooting

### "Missing environment variable JWT_PRIVATE_KEY", "JWKS", or "pkcs8 format" error

**Problem**: Auth fails with key-related errors

**Solution**:
Run the Convex Auth setup to generate and set both keys:
```bash
npx @convex-dev/auth
```

If you have uncommitted changes and the CLI fails, generate keys manually:

```bash
# Create a script to generate matching keys
cat << 'EOF' > generate_keys.mjs
import crypto from 'crypto';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const publicKeyObj = crypto.createPublicKey(publicKey);
const jwk = publicKeyObj.export({ format: 'jwk' });
jwk.alg = 'RS256';
jwk.use = 'sig';
jwk.kid = crypto.randomUUID();

console.log('=== JWT_PRIVATE_KEY ===');
console.log(privateKey);
console.log('=== JWKS ===');
console.log(JSON.stringify({ keys: [jwk] }));
EOF

node generate_keys.mjs
```

Then set both values in Convex:
```bash
npx convex env set JWT_PRIVATE_KEY -- "<paste-private-key>"
npx convex env set JWKS '<paste-jwks-json>'
rm generate_keys.mjs
```

> **Important**:
> - `JWT_PRIVATE_KEY` must be in PKCS#8 PEM format (starts with `-----BEGIN PRIVATE KEY-----`)
> - `JWKS` must be valid JSON with a `keys` array containing the matching public key
> - Both must be generated together from the same key pair

### App not connecting to Convex

**Problem**: App fails to connect or shows connection errors

**Solution**:
- Ensure `npx convex dev` is running (for local development)
- Verify `.env` file has `EXPO_PUBLIC_CONVEX_URL` set
- For production, ensure you've run `npx convex deploy`
- Restart Metro: `yarn app:start --clear`

### Auth not persisting

**Problem**: User logged out on app restart

**Solution**:
- Check SecureStore permissions (iOS/Android)
- Verify `ConvexAuthProvider` has storage configured
- Check for errors in console

### Queries not updating

**Problem**: UI not updating when data changes

**Solution**:
- Queries are reactive by default
- Check you're using `useQuery`, not direct client calls
- Verify your mutation is actually modifying the data

### Type errors

**Problem**: TypeScript errors with Convex types

**Solution**:
- Run `npx convex dev` to regenerate types
- Check your schema matches your function args
- Restart TypeScript server in your IDE

### OTP emails not sending

**Problem**: Magic link / OTP not working

**Solution**:
- Verify `RESEND_API_KEY` is set in Convex dashboard
- Check `RESEND_FROM_EMAIL` is a verified domain
- Check Convex logs for errors

### OAuth not working on mobile

**Problem**: OAuth shows "Convex Auth is running" instead of redirecting to provider

**Solution**:
OAuth requires a publicly accessible `SITE_URL`. If you're using local Convex (`127.0.0.1`), OAuth won't redirect properly.

```bash
# Check your SITE_URL
npx convex env list

# Deploy to cloud and set public URL
npx convex deploy
npx convex env set SITE_URL "https://your-project.convex.site"
```

> **Note**: OAuth will NOT work on iOS/Android simulators if `SITE_URL` is set to `localhost` or `127.0.0.1`. You must deploy to get a public URL for mobile OAuth testing.

---

## Next Steps

- [ ] Start local dev server (`npx convex dev`)
- [ ] Set up auth keys (`npx @convex-dev/auth`) - **Required for auth to work**
- [ ] Add deployment URL to `.env` (`EXPO_PUBLIC_CONVEX_URL`)
- [ ] Run seed data (`npx convex run seed:run`)
- [ ] Test authentication flow
- [ ] Configure OAuth providers (optional)
- [ ] Set up Resend for magic links (optional)
- [ ] Deploy to production (`npx convex deploy`)
- [ ] Set `SITE_URL` for mobile OAuth (after deploy)
