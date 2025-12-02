# App Context

## What This Is
Production-ready React Native (Expo) starter kit with auth, subscriptions, analytics, and UI components. Optimized for AI-assisted development ("Vibecoding").

## Current Features

### Authentication (Supabase)
- Email/password + social (Google, Apple)
- Email verification, password reset
- Session management + profile sync

### Subscriptions (RevenueCat)
- Freemium model (Free/Pro tiers)
- In-app purchases (iOS/Android)
- Trial periods, restore purchases

### Analytics (PostHog)
- Event tracking, feature flags, A/B testing

### UI/UX
- Unified design system via Unistyles 3.0 (theme-aware colors, typography, spacing)
- Screen layout templates for consistency (AuthScreenLayout, OnboardingScreenLayout)
- Modern dashboard with stats and quick actions
- 3-step onboarding (Intro → Goal → Notifications)
- Component showcase for UI testing
- Dark mode (automatic via Unistyles adaptiveThemes), accessible components, smooth animations

## Screens
- Onboarding (3 steps), Login, Register, Forgot Password
- Home/Dashboard, Profile, Settings
- Component Showcase (UI Kit)
- Paywall, Subscription Management

## Tech Stack
- React Native (Expo SDK 54)
- **Unistyles 3.0** (theme-aware styling)
- Zustand (state) + React Query (data fetching)
- TypeScript strict mode
- React Navigation

## Architecture
```
/app
  /app           # Screen files
  /components    # Reusable UI
    /layouts     # Screen layout templates (AuthScreenLayout, OnboardingScreenLayout)
  /config        # Env, features, constants
  /hooks         # Custom hooks, React Query hooks
  /services      # Supabase, RevenueCat, PostHog, Sentry
    /api         # API client with interceptors
  /stores        # Zustand stores
    /middleware  # Logger, error handler
    /selectors   # Memoized selectors
  /utils         # Helpers
  /theme         # Unistyles config (unistyles.ts), design tokens
  /vibe          # AI context docs
```

## Key Patterns

### Service Layer
- Service factory with dependency injection
- Network monitor for connectivity tracking
- API client with interceptors, retry logic, error handling

### State Management
- Zustand for global state (auth, subs, prefs)
- React Query for server state (caching, offline support)
- Selectors for derived state

### Infrastructure
- Centralized error handling and classification
- Structured logging with sensitive data redaction
- Type-safe env vars and feature flags

## Development Modes

### Production Mode
All services connected to real APIs

### Mock Mode
Runs without API keys - mock auth, payments, analytics
Perfect for UI development and testing

### Dev Dashboard
Component showroom, auth playground, theme switcher, service status panel

## User Flows

### New User
1. Onboarding → Register (email/social)
2. Home dashboard with quick actions
3. Explore components or upgrade to Pro

### Returning User
1. Login → Home screen with greeting
2. Continue using app

## Pro vs Free

**Free**: Basic functionality, limited usage
**Pro**: Unlimited usage, no ads, premium features, priority support

## AI Guidelines

When adding features:
1. Check `/components` to reuse existing UI
2. **Use screen layout templates** for auth/onboarding screens (see `vibe/SCREEN_TEMPLATES.md`)
3. Follow patterns from existing screens
4. Use Zustand stores for global state (not local)
5. Use React Query for API calls
6. **Style with Unistyles 3.0** - always use theme values, no hardcoded colors/spacing
7. Use generators in `/scripts/generate`
8. Update this file for major features

### Adding a New Screen

**For Auth Screens (Login, Register, etc.):**
```typescript
import { AuthScreenLayout } from "@/components"

export const MyScreen = () => (
  <AuthScreenLayout title="Title" subtitle="Description" showCloseButton onClose={...}>
    {/* Form content */}
  </AuthScreenLayout>
)
```

**For Onboarding Screens:**
```typescript
import { OnboardingScreenLayout } from "@/components"

export const MyOnboarding = () => (
  <OnboardingScreenLayout currentStep={0} totalSteps={3} headerIcon="👋" title="Welcome!">
    {/* Content */}
  </OnboardingScreenLayout>
)
```

Then add navigation in `/app/navigators/` and update this file.

### Styling Guidelines
```typescript
// ✅ DO: Use Unistyles with theme
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
}))

// ❌ DON'T: Hardcode values
<View style={{ backgroundColor: '#E0F2FE', padding: 16 }}>
```

### Adding a New Feature
1. Determine state needs (Zustand vs local)
2. Create API hooks with React Query if needed
3. Build UI with existing components + screen templates
4. Add analytics tracking
5. Update this file

### Modifying Subscription Logic
1. Check `/stores/subscriptionStore.ts`
2. Update RevenueCat config if needed
3. Update paywall UI in `/screens/PaywallScreen.tsx`
4. Test in mock mode first

## Important Notes
- Test in mock mode first (no API keys needed)
- Use dev dashboard to test different states
- **Always use screen templates** (`vibe/SCREEN_TEMPLATES.md`)
- Follow `vibe/STYLE_GUIDE.md` for code conventions
- See `vibe/TECH_STACK.md` for architectural decisions
