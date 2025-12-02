# ShipNative Starter Kit

React Native (Expo) boilerplate with authentication, subscriptions, analytics, and UI components. Optimized for AI-assisted development.

## Features

- React Native (Expo SDK 54) - iOS, Android, and Web (Expo Web)
- Unistyles - Supercharged StyleSheet for React Native
- Supabase - Auth & database (email, Google, Apple)
- User Profiles - Edit personal info with database persistence
- RevenueCat - iOS, Android & Web subscriptions (Purchases SDK + Web Billing)
- PostHog - Analytics & feature flags
- Push Notifications - Local & remote with mock mode
- Deep Linking - Universal links & custom URL scheme
- Dark Mode - Light & dark themes
- Dev Dashboard - Component showroom & testing tools
- Mock Mode - Develop without API keys (including profiles)
- TypeScript - Fully typed
- Default Database Schema - Production-ready SQL schema included

## Quick Start

### Option 1: Clone Repository (Recommended)

```bash
git clone https://github.com/shipnativeapp/shipnative.git
cd shipnativeapp
yarn install
yarn setup  # Interactive setup wizard
yarn dev
```

### Option 2: Quick Start (Mock Mode)

```bash
git clone https://github.com/shipnativeapp/shipnative.git
cd shipnativeapp
yarn install
yarn dev  # Runs with mock services
```

### Web (Expo Web)

```bash
yarn web:dev      # Run the web build locally
```

## AI-Assisted Development

### Starter Prompt

```
Read .cursorrules and vibe/ folder. Build [App Description]. Start with database schema changes.
```

### Documentation Structure

**Two vibe folders with different purposes:**

`apps/app/vibe/` - App-specific AI context:
- `CONTEXT.md` - App features, architecture, current state
- `TECH_STACK.md` - Technologies to use/avoid
- `STYLE_GUIDE.md` - Code patterns and conventions
- `ARCHITECTURE.md` - App architecture details
- `SCREEN_TEMPLATES.md` - Screen implementation patterns

`vibe/` (root) - Project-wide context:
- `SERVICES.md` - Service architecture overview
- `MOCK_SERVICES.md` - Mock mode documentation

`.cursorrules` instructs AI to:
- Read both vibe/ folders before coding
- Reuse existing components
- Follow established patterns
- Support dark mode
- Add accessibility labels

## Development

### Dev Dashboard

Press `Cmd+D` (iOS) or `Cmd+M` (Android) for:
- Component Showroom - Browse all components
- Auth Playground - Toggle user states (Logged Out/Free/Pro)
- Theme Toggle - Test light/dark modes
- Service Status - See mock mode status

### Mock Mode

Develop without API keys. Auto-fallback to mock data when:
- Supabase keys missing → Mock auth
- RevenueCat keys missing → Mock payments
- PostHog keys missing → Mock analytics
- Sentry DSN missing → Mock error tracking
- Firebase/APNs not configured → Mock push notifications

## Project Structure

```
/apps/app
  /app              # Application code
    /screens        # Screen components
    /components     # Reusable UI
    /navigators     # React Navigation setup
    /stores         # Zustand stores (global state)
    /hooks          # Custom hooks
    /services       # Supabase, RevenueCat, PostHog, Sentry
    /utils          # Helpers
    /theme          # Unistyles design tokens
  /vibe             # AI context docs (app-specific)
/vibe               # AI context docs (project-wide)
```

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Styling**: Unistyles 3.0
- **State**: Zustand + React Query
- **Navigation**: React Navigation
- **Auth**: Supabase
- **Payments**: RevenueCat
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Native Testing Library + Maestro

## Documentation

**AI Context Files:**
- `apps/app/vibe/CONTEXT.md` - App features & architecture
- `apps/app/vibe/TECH_STACK.md` - Technology decisions
- `apps/app/vibe/STYLE_GUIDE.md` - Code patterns
- `apps/app/vibe/ARCHITECTURE.md` - App architecture
- `apps/app/vibe/SCREEN_TEMPLATES.md` - Screen patterns
- `vibe/SERVICES.md` - Service architecture
- `vibe/MOCK_SERVICES.md` - Mock mode guide

**Setup & Configuration:**
- `docs/BACKEND.md` - Database setup + schema
- `docs/SUPABASE.md` - Authentication & database
- `docs/MONETIZATION.md` - Payments & subscriptions
- `docs/ANALYTICS.md` - Analytics & error tracking
- `docs/NOTIFICATIONS.md` - Push notifications
- `docs/DEPLOYMENT.md` - App store deployment
- `docs/TROUBLESHOOTING.md` - Common issues

## Deployment

```bash
# iOS
yarn ship:ios

# Android
yarn ship:android

# Web (Expo Web)
yarn web:dev      # local dev server
yarn web:build    # static export to dist
yarn web:preview  # serve dist locally
```

Uses EAS Build for cloud builds (no Xcode/Android Studio required).

## Testing

```bash
yarn test           # Unit tests
yarn test:maestro   # E2E tests
yarn compile        # Type checking
```

## Contributing

When adding features:
1. Follow patterns in existing code
2. Update `apps/app/vibe/CONTEXT.md` for major changes
3. Use Unistyles 3.0 for styling (not hardcoded values)
4. Support dark mode via theme colors
5. Add accessibility labels
6. Write tests

## License

See [LICENSE.md](LICENSE.md) for details.
