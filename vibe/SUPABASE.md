# Supabase Guide

This guide explains how to use Supabase for authentication and database operations in your app.

## Quick Start

### Development Mode (No API Keys)

The app automatically uses a mock Supabase client when credentials are missing:

```bash
# Just run the app - mock Supabase will be used automatically
yarn app:ios
# or
yarn app:android
# or
yarn web:dev
```

You'll see console logs:
```
🔐 [MockSupabase] Initialized mock Supabase client
⚠️  Supabase credentials not found - using mock authentication
```

### Production Setup

#### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for database to be provisioned

#### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy your Project URL
3. Copy your **publishable** key (`sb_publishable_...`) from the API settings

#### 3. Add to Environment

Add to `.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key-here
```

#### 4. Set Up Database Schema

Shipnative includes a production-ready database schema. To set it up:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the `supabase/schema.sql` file from the repository
4. Copy and paste the entire file into the SQL Editor
5. Click **Run** to execute

The schema includes:
- **profiles** - User profile information (first name, last name, avatar, onboarding status, etc.)
- **user_preferences** - App preferences (language, timezone, privacy, marketing, etc.)
- **push_tokens** - Expo push notification tokens for multiple devices
- **waitlist** - Email collection for pre-launch marketing
- Automatic triggers for profile creation on signup
- Row Level Security (RLS) policies
- Helper functions for common operations

See [BACKEND.md](./BACKEND.md) for detailed database documentation.

## Usage

### Using useAuth() (The Only Auth Hook You Need)

```typescript
import { useAuth } from '@/hooks'

function LoginScreen() {
  const {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    signInWithMagicLink,
    verifyOtp,
    updateProfile,
  } = useAuth()

  const handleLogin = async () => {
    const { error } = await signIn('user@example.com', 'password123')
    if (error) {
      alert(error.message)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return (
      <View>
        <Text>Welcome {user?.displayName || user?.email}</Text>
        <Button onPress={signOut} title="Sign Out" />
      </View>
    )
  }

  return <Button onPress={handleLogin} title="Sign In" />
}
```

`useAuth()` is the ONLY auth hook you need. It works with both Supabase and Convex backends.

### Direct Client Access

```typescript
import { supabase } from './services/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

## Authentication

All auth methods are available through `useAuth()`.

### Sign Up

```typescript
const { signUp } = useAuth()

const handleSignUp = async () => {
  const { error } = await signUp('user@example.com', 'password123')
  if (error) {
    console.error('Sign up error:', error)
  }
}
```

### Sign In

```typescript
const { signIn } = useAuth()

const handleSignIn = async () => {
  const { error } = await signIn('user@example.com', 'password123')
  if (error) {
    console.error('Sign in error:', error)
  }
}
```

### Sign Out

```typescript
const { signOut } = useAuth()

const handleSignOut = async () => {
  const { error } = await signOut()
  if (error) {
    console.error('Sign out error:', error)
  }
}
```

### OAuth Sign In (Google & Apple)

```typescript
const { signInWithGoogle, signInWithApple } = useAuth()

const handleGoogleSignIn = async () => {
  const { error } = await signInWithGoogle()
  if (error) console.error('Google sign in error:', error)
}

const handleAppleSignIn = async () => {
  const { error } = await signInWithApple()
  if (error) console.error('Apple sign in error:', error)
}
```

### Magic Link / OTP Sign In

```typescript
const { signInWithMagicLink, verifyOtp } = useAuth()
const [codeSent, setCodeSent] = useState(false)

// Step 1: Request magic link / OTP
const handleRequestCode = async () => {
  const { error } = await signInWithMagicLink('user@example.com')
  if (!error) {
    setCodeSent(true)
    alert('Check your email for a login link or code!')
  }
}

// Step 2: Verify OTP (if using OTP mode)
const handleVerify = async (code: string) => {
  const { error } = await verifyOtp('user@example.com', code)
  if (error) console.error('Verification error:', error)
}
```

Google uses the native Google Sign-In SDK to obtain an ID token and exchanges it with Supabase.
Apple (and web) uses OAuth with PKCE and redirects back to the app.

Social login buttons are automatically shown/hidden based on feature flags:
- `enableGoogleAuth`: Shows Google sign in button
- `enableAppleAuth`: Shows Apple sign in button
- If both are disabled, no social login section appears

## Setup Wizard for Social Login

The Shipnative setup wizard (`yarn setup`) will guide you through setting up Google and Apple OAuth:

### Google OAuth Setup

1. **Run setup wizard**: Run `yarn setup` from the project root
2. **Choose Google OAuth**: Select "Yes" when prompted to set up Google OAuth
3. **Google Cloud Console**: Create OAuth credentials and consent screen:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Configure consent screen + scopes (`openid`, `email`, `profile`)
   - Create OAuth client IDs for Web, iOS, and Android
   - Add Android SHA-1 fingerprints for debug + release
4. **Supabase Configuration**: Supabase Auth → Providers → Google
   - Enable Google
   - Add all client IDs (web first, then iOS/Android)
   - Add the client secret from Google
   - If using the RN Google Sign-In SDK, set **Skip Nonce Check** to avoid nonce mismatch errors
5. **Environment Variables**: Setup wizard adds to `.env`:
   ```bash
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```
   The client secret stays in the Supabase dashboard, not in the app.
6. **Native SDK**: Install `@react-native-google-signin/google-signin` and rebuild the dev client.

For complete provider setup details, follow the official Supabase guide:
https://supabase.com/docs/guides/auth/social-login/auth-google

### Apple Sign-In Setup

1. **Run setup wizard**: Run `yarn setup` from the project root
2. **Choose Apple Sign-In**: Select "Yes" when prompted to set up Apple Sign-In
3. **Apple Developer Console**: Configure Sign In with Apple:
   - Go to [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list)
   - Enable Sign In with Apple capability on your App ID
   - Create Services ID for OAuth
   - Generate private key and key ID
4. **Supabase Configuration**: Enter credentials in Supabase Auth → Providers → Apple
5. **Environment Variables**: Setup wizard adds to `.env`:
   ```bash
   EXPO_PUBLIC_APPLE_SERVICES_ID=com.example.app
   EXPO_PUBLIC_APPLE_TEAM_ID=ABC123DEF4
   EXPO_PUBLIC_APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
   EXPO_PUBLIC_APPLE_KEY_ID=ABC123DEF4
   ```

### Manual Setup

If you prefer to set up social login manually after project creation:

```bash
cd your-project
yarn setup-env
```

The interactive setup script will prompt for all social login credentials.

### Password Reset

```typescript
const { resetPassword } = useAuth()

const handleResetPassword = async () => {
  const { error } = await resetPassword('user@example.com')
  if (error) {
    console.error('Reset error:', error)
  } else {
    alert('Check your email for reset link')
  }
}
```

### Update Profile

```typescript
const { updateProfile } = useAuth()

const handleUpdateProfile = async () => {
  const { error } = await updateProfile({
    firstName: 'Jane',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  })
  if (error) {
    console.error('Update error:', error)
  }
}
```

### Auth State Listener

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth event:', event)
      console.log('Session:', session)
      
      if (event === 'SIGNED_IN') {
        // User signed in
      } else if (event === 'SIGNED_OUT') {
        // User signed out
      }
    }
  )
  
  return () => subscription.unsubscribe()
}, [])
```

---

## Database Operations

### Select Data

```typescript
// Get all rows
const { data, error } = await supabase
  .from('posts')
  .select('*')

// Get specific columns
const { data, error } = await supabase
  .from('posts')
  .select('id, title, author')

// Get single row
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 1)
  .single()

// With filters
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('author_id', userId)
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .limit(10)
```

### Insert Data

```typescript
// Insert single row
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'My Post',
    content: 'Hello world',
    author_id: userId,
  })

// Insert multiple rows
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' },
  ])
```

### Update Data

```typescript
// Update rows
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', 1)

// Update multiple rows
const { data, error } = await supabase
  .from('posts')
  .update({ published: true })
  .eq('author_id', userId)
```

### Delete Data

```typescript
// Delete rows
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', 1)

// Delete with filter
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('author_id', userId)
  .lt('created_at', '2023-01-01')
```

### Upsert Data

```typescript
// Insert or update
const { data, error } = await supabase
  .from('posts')
  .upsert({
    id: 1,
    title: 'Updated or New Post',
    content: 'Content',
  })
```

---

## Mock Service Features

The mock Supabase service provides comprehensive simulation:

### Authentication
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign in with Google OAuth
- ✅ Sign in with Apple OAuth
- ✅ Sign out
- ✅ Session management
- ✅ Password reset (simulated)
- ✅ User updates
- ✅ Auth state listeners

### Database
- ✅ Select with filters (eq, neq, gt, gte, lt, lte, like, ilike, in)
- ✅ Insert (single and multiple)
- ✅ Update with filters
- ✅ Delete with filters
- ✅ Upsert
- ✅ Ordering (ascending/descending)
- ✅ Limiting and pagination
- ✅ Single row queries

### Testing Utilities

```typescript
import { mockSupabaseHelpers } from './services/mocks/supabase'

// Clear all mock data
mockSupabaseHelpers.clearAll()

// Get all users
const users = mockSupabaseHelpers.getUsers()

// Get table data
const posts = mockSupabaseHelpers.getTableData('posts')

// Seed table with data
mockSupabaseHelpers.seedTable('posts', [
  { id: 1, title: 'Post 1', content: 'Content 1' },
  { id: 2, title: 'Post 2', content: 'Content 2' },
])

// Get current session
const session = mockSupabaseHelpers.getCurrentSession()
```

---

### Core Tables

For the complete schema, refer to `supabase/schema.sql`. Below is an overview of the core tables.

#### User Profiles

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    dark_mode_enabled BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### User Preferences

```sql
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    profile_visibility TEXT DEFAULT 'public',
    marketing_emails BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Push Tokens

```sql
CREATE TABLE public.push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    device_id TEXT,
    platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Best Practices

### Error Handling

```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')

if (error) {
  console.error('Database error:', error.message)
  // Handle error appropriately
  return
}

// Use data safely
console.log('Posts:', data)
```

### Type Safety

```typescript
interface Post {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
}

const { data, error } = await supabase
  .from('posts')
  .select('*')
  .returns<Post[]>()

// data is now typed as Post[] | null
```

### Row Level Security

Always enable RLS on tables:

```sql
alter table public.posts enable row level security;
```

Create policies to control access:

```sql
-- Only authenticated users can insert
create policy "Authenticated users can insert"
  on public.posts for insert
  to authenticated
  with check (true);
```

### Real-time Subscriptions

Shipnative includes ready-to-use hooks for common realtime patterns.

---

## Realtime Hooks

> **Note:** All realtime hooks use the backend abstraction layer (`services/backend`), making them provider-agnostic. They work with both Supabase and Convex backends.

### useRealtimeMessages (Chat)

Full-featured chat hook with typing indicators:

```typescript
import { useRealtimeMessages } from './hooks/useRealtimeMessages'

function ChatRoom({ channelId }: { channelId: string }) {
  const {
    messages,
    sendMessage,
    typingUsers,
    setTyping,
    isConnected,
    loading,
  } = useRealtimeMessages({
    channelId,
    maxMessages: 100,
    onNewMessage: (msg) => {
      // Play notification sound, update badge, etc.
      playNotificationSound()
    },
  })

  const handleSend = async (text: string) => {
    const { error } = await sendMessage(text)
    if (error) Alert.alert('Error', error.message)
  }

  // Show typing indicator while user is typing
  const handleInputChange = (text: string) => {
    setTyping(text.length > 0)
  }

  if (loading) return <LoadingSpinner />

  return (
    <View style={{ flex: 1 }}>
      {!isConnected && <ConnectionBanner />}

      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
      />

      {typingUsers.length > 0 && (
        <Text>{typingUsers.join(', ')} typing...</Text>
      )}

      <ChatInput
        onSend={handleSend}
        onChangeText={handleInputChange}
      />
    </View>
  )
}
```

**Features:**
- Real-time message sync (INSERT, UPDATE, DELETE)
- Typing indicators with auto-timeout
- Optimistic updates
- Connection status tracking
- Mock mode support for development
- Backend-agnostic (uses `services/backend` abstraction)

### useRealtimePresence (Online Users)

Track who's online with status indicators:

```typescript
import { useRealtimePresence } from './hooks/useRealtimePresence'

function OnlineUsers({ roomId }: { roomId: string }) {
  const {
    presentUsers,
    userCount,
    isConnected,
    updateStatus,
    isUserOnline,
  } = useRealtimePresence({
    channelName: `room:${roomId}`,
    initialStatus: 'online',
    customData: { currentScreen: 'chat' },
    onUserJoin: (user) => console.log(`${user.user_id} joined`),
    onUserLeave: (userId) => console.log(`${userId} left`),
  })

  return (
    <View>
      <Text>{userCount} online</Text>

      {presentUsers.map((user) => (
        <View key={user.user_id} style={styles.userRow}>
          <Avatar userId={user.user_id} />
          <StatusDot status={user.status} />
        </View>
      ))}

      {/* Status picker */}
      <Picker
        selectedValue={currentStatus}
        onValueChange={(status) => updateStatus(status)}
      >
        <Picker.Item label="Online" value="online" />
        <Picker.Item label="Away" value="away" />
        <Picker.Item label="Busy" value="busy" />
      </Picker>
    </View>
  )
}
```

**Features:**
- Track online/away/busy/offline status
- Custom presence data (current screen, activity, etc.)
- Join/leave callbacks
- Status updates broadcast to all users
- Backend-agnostic (uses `services/backend` abstraction)

### useRealtimeSubscription (Generic)

Subscribe to any table changes:

```typescript
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription'

// Watch for new orders
function OrderNotifications() {
  useRealtimeSubscription<Order>({
    table: 'orders',
    event: 'INSERT',
    onInsert: (order) => {
      toast.success(`New order #${order.id}!`)
      queryClient.invalidateQueries(['orders'])
    },
  })

  return null // Just listening, no UI
}

// Watch specific user's notifications
function NotificationListener({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useRealtimeSubscription<Notification>({
    table: 'notifications',
    filter: { column: 'user_id', value: userId },
    onInsert: (notification) => {
      setNotifications((prev) => [notification, ...prev])
      playNotificationSound()
    },
  })

  return <NotificationList items={notifications} />
}

// Activity feed helper
import { useActivityFeed } from './hooks/useRealtimeSubscription'

function ActivityFeed({ userId }: { userId: string }) {
  const [activities, setActivities] = useState([])

  useActivityFeed({
    userId,
    onNewActivity: (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 50))
    },
  })

  return <ActivityList items={activities} />
}
```

**Features:**
- Subscribe to INSERT, UPDATE, DELETE, or all events
- Filter by column values
- Connection management (connect, disconnect, reconnect)
- Works with any table
- Backend-agnostic (uses `services/backend` abstraction)

### Database Schema for Chat

Add this to your Supabase SQL editor for chat functionality:

```sql
-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read messages in their channels"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Index for fast channel queries
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
```

### Database Schema for Activity Feed

```sql
-- Activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'follow', 'mention', 'share', 'custom')),
    target_id TEXT,
    target_type TEXT,
    content TEXT,
    read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Users can only read their own activities
CREATE POLICY "Users can read own activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Index for fast user queries
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
```

### Realtime Configuration

Enable realtime in Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Under "Realtime", enable for your tables
3. Or run: `ALTER PUBLICATION supabase_realtime ADD TABLE your_table;`

### Low-Level Realtime API

For custom implementations:

```typescript
import { supabase } from './services/supabase'

// Subscribe to postgres changes
const channel = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
      filter: 'author_id=eq.123',
    },
    (payload) => {
      console.log('Change:', payload.eventType, payload.new)
    }
  )
  .subscribe()

// Broadcast messages (no database)
channel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200, userId: 'abc' },
})

// Listen for broadcasts
channel.on('broadcast', { event: 'cursor-move' }, (payload) => {
  console.log('Cursor:', payload.payload)
})

// Cleanup
channel.unsubscribe()
```

---

## Troubleshooting

### Mock mode in production

**Problem**: App using mock Supabase in production

**Solution**:
- Verify `.env` file exists
- Check `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set
- Restart Metro: `yarn app:start --clear`

### Authentication not persisting

**Problem**: User logged out on app restart

**Solution**:
- Check SecureStore permissions (iOS/Android)
- Verify `persistSession: true` in Supabase config
- Check for errors in console

### Database queries failing

**Problem**: Queries return errors

**Solution**:
- Check Row Level Security policies
- Verify user is authenticated
- Check table/column names are correct
- Review Supabase logs in dashboard

### CORS errors (web)

**Problem**: CORS errors when calling Supabase from web

**Solution**:
- Add your domain to Supabase → Authentication → URL Configuration
- Check API URL is correct
- Verify publishable key is correct

---

## Next Steps

- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Configure Row Level Security
- [ ] Add API keys to `.env`
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Set up real-time subscriptions (if needed)
- [ ] Configure email templates
- [ ] Set up storage buckets (if needed)
