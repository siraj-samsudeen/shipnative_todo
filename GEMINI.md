# Project Instructions

## Overview
React Native starter kit with Expo, Supabase Auth, PostHog Analytics, RevenueCat payments, and React Native Unistyles 3.0 styling.

**Attribution**: Built on Ignite boilerplate foundation with significant customizations.

## Tech Stack
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation
- **State**: Zustand + React Query
- **Auth**: Supabase
- **Analytics**: PostHog
- **Payments**: RevenueCat + Lemon Squeezy
- **Push Notifications**: expo-notifications
- **Styling**: React Native Unistyles 3.0

## Commands
```bash
yarn dev              # Start development server
yarn app:ios          # Run iOS
yarn app:android      # Run Android
yarn test             # Run tests
node apps/app/scripts/setup-env.js  # Generate .env
```

## Styling with Unistyles 3.0

**CRITICAL: Always use theme values from Unistyles**

### Basic Usage
```typescript
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

const { theme } = useUnistyles()

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.foreground,
  }
}))
```

### Variants
```typescript
const styles = StyleSheet.create((theme) => ({
  button: {
    variants: {
      variant: {
        filled: { backgroundColor: theme.colors.primary },
        outlined: { borderWidth: 1, borderColor: theme.colors.border },
      },
      size: {
        sm: { height: 36 },
        md: { height: 44 },
        lg: { height: 56 },
      },
    },
  },
}))

styles.useVariants({ variant: 'filled', size: 'md' })
```

### Theme Values
```typescript
// Colors (semantic)
theme.colors.primary       // Primary action
theme.colors.background    // Main background
theme.colors.foreground    // Main text
theme.colors.card          // Card backgrounds
theme.colors.error         // Error states

// Spacing (8px grid)
theme.spacing.md           // 16px
theme.spacing.lg           // 24px

// Typography
theme.typography.sizes.base       // 16px
theme.typography.fonts.bold       // Bold font

// Radius
theme.radius.lg            // 16px

// Shadows
theme.shadows.md           // Medium elevation
```

**Complete theme**: `/app/theme/unistyles.ts`

## Code Style

- Functional components only
- TypeScript strict mode
- `StyleSheet.create()` with theme function
- Always use theme values (never hardcode)
- `SafeAreaView` from react-native-safe-area-context
- `LinearGradient` for screen backgrounds

### Screen Template
```typescript
import { View, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export const MyScreen = () => {
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.gradientStart,
          theme.colors.gradientMiddle,
          theme.colors.gradientEnd,
        ]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + theme.spacing.lg },
          ]}
        >
          {/* Content */}
        </ScrollView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
}))
```

## Architecture
- **Screens**: `apps/app/app/screens`
- **Components**: `apps/app/app/components`
- **Services**: `apps/app/app/services`
- **Stores**: `apps/app/app/stores` (Zustand)
- **Navigation**: `apps/app/app/navigators`
- **Theme**: `apps/app/app/theme/unistyles.ts`

## Core Components

All components use Unistyles with theme support:

- **Text** - Typography with presets (heading, subheading, caption)
- **Button** - Variants: filled, outlined, ghost, secondary, danger
- **TextField** - Input with label, helper, status states
- **Card** - Content container with presets
- **Avatar** - User images with fallback initials
- **Badge** - Status indicators and labels
- **Divider** - Content separator
- **Spinner** - Loading indicators
- **IconButton** - Icon-only buttons
- **Container** - Screen wrapper with safe areas

## AI Guidelines

### Before Writing Code
1. Check `/app/theme/unistyles.ts` for theme values
2. Use theme values - never hardcode
3. Use existing screens as templates
4. Use existing components from `/components`

### Adding a Screen
1. Use screen template above
2. Import theme via `useUnistyles()`
3. Use `StyleSheet.create((theme) => ...)`
4. Add to AppNavigator.tsx and navigationTypes.ts

### Adding a Component
1. Define props interface with variants
2. Use `StyleSheet.create((theme) => ...)`
3. Use `variants` for component states
4. Call `styles.useVariants()` in component
5. Export from `/components/index.ts`

### Design Rules
- Clean, modern UI
- Gradient backgrounds for screens
- Rounded cards (theme.radius.xl)
- Primary color buttons (theme.colors.primary)
- Consistent spacing from theme
- Dark mode support via semantic colors

## Documentation Updates

**When modifying features, update:**
- `README.md` - Features list
- `vibe/CONTEXT.md` - Major features
- `vibe/TECH_STACK.md` - Technology changes
- `vibe/STYLE_GUIDE.md` - New code patterns

## Common Mistakes

❌ `color: "#000000"` → ✅ `color: theme.colors.foreground`
❌ `marginTop: 24` → ✅ `marginTop: theme.spacing.lg`
❌ `style={{ flex: 1, padding: 16 }}` → ✅ `style={styles.container}`
❌ `StyleSheet.create({ ... })` → ✅ `StyleSheet.create((theme) => ({ ... }))`

## Resources
- Theme: `apps/app/app/theme/unistyles.ts`
- Components: `apps/app/app/components/`
- Screens: `apps/app/app/screens/`
- Unistyles Docs: https://unistyl.es
