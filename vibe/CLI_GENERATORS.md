# CLI Generators

Speed up development with built-in code generators for screens, components, stores, and API endpoints.

## Quick Reference

```bash
# Generate a new screen
yarn generate screen ProfileSettings

# Generate a new component
yarn generate component UserCard

# Generate a new Zustand store
yarn generate store notifications

# Generate an API endpoint
yarn generate api user-profile
```

---

## Screen Generator

### Usage

```bash
yarn generate screen <ScreenName>
```

### Example

```bash
yarn generate screen ProfileSettings
```

### Generates

`apps/app/app/screens/ProfileSettingsScreen.tsx`:

```typescript
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/Text'
import { designTokens, gradients } from '@/theme/designTokens'

export const ProfileSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient {...gradients.primary} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text preset="heading">Profile Settings</Text>
            {/* Add your content here */}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.xl,
  },
})
```

### Options

```bash
# Generate with navigation type
yarn generate screen ProfileSettings --type modal

# Generate with specific preset
yarn generate screen ProfileSettings --preset fixed
```

---

## Component Generator

### Usage

```bash
yarn generate component <ComponentName>
```

### Example

```bash
yarn generate component UserCard
```

### Generates

`apps/app/app/components/UserCard.tsx`:

```typescript
import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from './Text'
import { designTokens } from '@/theme/designTokens'

export interface UserCardProps {
  name: string
  avatar?: string
  onPress?: () => void
}

export const UserCard = ({ name, avatar, onPress }: UserCardProps) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
    >
      <Text preset="subheading">{name}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
})
```

### Options

```bash
# Generate with TypeScript interface
yarn generate component UserCard --with-types

# Generate with test file
yarn generate component UserCard --with-test
```

---

## Store Generator

### Usage

```bash
yarn generate store <storeName>
```

### Example

```bash
yarn generate store notifications
```

### Generates

`apps/app/app/stores/notificationsStore.ts`:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'

export interface NotificationsState {
  // State
  items: any[]
  loading: boolean
  
  // Actions
  fetchItems: () => Promise<void>
  addItem: (item: any) => void
  removeItem: (id: string) => void
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchItems: async () => {
        set({ loading: true })
        try {
          // Fetch items from API
          const items = []
          set({ items, loading: false })
        } catch (error) {
          console.error('Error fetching items:', error)
          set({ loading: false })
        }
      },

      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      clearAll: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    },
  ),
)
```

### Options

```bash
# Generate without persistence
yarn generate store notifications --no-persist

# Generate with React Query integration
yarn generate store notifications --with-query
```

---

## API Generator

### Usage

```bash
yarn generate api <endpointName>
```

### Example

```bash
yarn generate api user-profile
```

### Generates

`apps/app/app/services/api/userProfile.ts`:

```typescript
import { supabase } from '../supabase'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
}

export const userProfileApi = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return false
    }

    return true
  },

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting profile:', error)
      return false
    }

    return true
  },
}
```

### With React Query Hook

`apps/app/app/hooks/useUserProfile.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userProfileApi, UserProfile } from '@/services/api/userProfile'

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userProfileApi.getProfile(userId),
    enabled: !!userId,
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      userProfileApi.updateProfile(userId, updates),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
    },
  })
}
```

### Options

```bash
# Generate with React Query hooks
yarn generate api user-profile --with-hooks

# Generate with TypeScript types only
yarn generate api user-profile --types-only
```

---

## Implementation

To add these generators to your project, create a `scripts/generate.js` file:

```javascript
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const [,, type, name, ...options] = process.argv

if (!type || !name) {
  console.log('Usage: yarn generate <type> <name> [options]')
  console.log('\nTypes:')
  console.log('  screen    - Generate a new screen')
  console.log('  component - Generate a new component')
  console.log('  store     - Generate a Zustand store')
  console.log('  api       - Generate an API endpoint')
  process.exit(1)
}

const generators = {
  screen: generateScreen,
  component: generateComponent,
  store: generateStore,
  api: generateApi,
}

const generator = generators[type]
if (!generator) {
  console.error(`Unknown type: ${type}`)
  process.exit(1)
}

generator(name, options)

function generateScreen(name, options) {
  const fileName = `${name}Screen.tsx`
  const filePath = path.join(__dirname, '../apps/app/app/screens', fileName)
  
  const template = `import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/Text'
import { designTokens, gradients } from '@/theme/designTokens'

export const ${name}Screen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient {...gradients.primary} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text preset="heading">${name}</Text>
            {/* Add your content here */}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.xl,
  },
})
`

  fs.writeFileSync(filePath, template)
  console.log(`✅ Created ${fileName}`)
}

function generateComponent(name, options) {
  const fileName = `${name}.tsx`
  const filePath = path.join(__dirname, '../apps/app/app/components', fileName)
  
  const template = `import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from './Text'
import { designTokens } from '@/theme/designTokens'

export interface ${name}Props {
  // Add your props here
}

export const ${name} = (props: ${name}Props) => {
  return (
    <View style={styles.container}>
      <Text>${name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
})
`

  fs.writeFileSync(filePath, template)
  console.log(`✅ Created ${fileName}`)
}

function generateStore(name, options) {
  const fileName = `${name}Store.ts`
  const filePath = path.join(__dirname, '../apps/app/app/stores', fileName)
  
  const storeName = name.charAt(0).toUpperCase() + name.slice(1)
  
  const template = `import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'

export interface ${storeName}State {
  // State
  items: any[]
  loading: boolean
  
  // Actions
  fetchItems: () => Promise<void>
  addItem: (item: any) => void
  removeItem: (id: string) => void
}

export const use${storeName}Store = create<${storeName}State>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchItems: async () => {
        set({ loading: true })
        try {
          // Fetch items
          const items = []
          set({ items, loading: false })
        } catch (error) {
          console.error('Error:', error)
          set({ loading: false })
        }
      },

      addItem: (item) => {
        set((state) => ({ items: [...state.items, item] }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
    }),
    {
      name: '${name}-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    },
  ),
)
`

  fs.writeFileSync(filePath, template)
  console.log(`✅ Created ${fileName}`)
}

function generateApi(name, options) {
  const fileName = `${name}.ts`
  const filePath = path.join(__dirname, '../apps/app/app/services/api', fileName)
  
  const apiName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  
  const template = `import { supabase } from '../supabase'

export const ${name}Api = {
  async get(id: string) {
    const { data, error } = await supabase
      .from('${name}')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error:', error)
      return null
    }

    return data
  },

  async create(item: any) {
    const { data, error } = await supabase
      .from('${name}')
      .insert(item)
      .select()
      .single()

    if (error) {
      console.error('Error:', error)
      return null
    }

    return data
  },

  async update(id: string, updates: any) {
    const { error } = await supabase
      .from('${name}')
      .update(updates)
      .eq('id', id)

    return !error
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('${name}')
      .delete()
      .eq('id', id)

    return !error
  },
}
`

  fs.writeFileSync(filePath, template)
  console.log(`✅ Created ${fileName}`)
}
```

Add to `package.json`:

```json
{
  "scripts": {
    "generate": "node scripts/generate.js"
  }
}
```

---

## Next Steps

1. Copy `scripts/generate.js` to your project
2. Add the script to `package.json`
3. Run `yarn generate <type> <name>` to create files
4. Customize the templates to match your needs

For more information, see:
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Component patterns
- [vibe/STYLE_GUIDE.md](./apps/app/vibe/STYLE_GUIDE.md) - Code style
- [BACKEND.md](./BACKEND.md) - Database patterns
