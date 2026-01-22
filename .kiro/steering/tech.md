# Tech Stack

## Core Technologies

- **Framework**: React Native with Expo SDK 54
- **Runtime**: Node.js 20.19.0 (LTS) - avoid Node 22+ due to native dependency issues
- **Package Manager**: Yarn 4.9.1 (managed via Volta or corepack)
- **Language**: TypeScript 5.9+ (strict mode)
- **Build System**: Turbo (monorepo orchestration)

## UI & Styling

- **Styling**: React Native Unistyles 3.0 (theme-aware, no inline styles)
- **Navigation**: React Navigation 7 (type-safe via `navigationTypes.ts`)
- **Components**: Custom component library in `apps/app/app/components/`
- **Icons**: Built-in `Icon` component with asset management
- **Dark Mode**: Built-in support via semantic theme colors

## State Management

- **Global State**: Zustand
- **Server State**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod validation
- **Storage**: MMKV (fast key-value storage)

## Backend Integration

- **Supabase**: PostgreSQL + Auth + Realtime

Supports:
- Email/password authentication
- OAuth (Google, Apple)
- Real-time subscriptions
- Row Level Security (RLS)

## Services

- **Payments**: RevenueCat (iOS/Android subscriptions)
- **Analytics**: PostHog (events, feature flags)
- **Error Tracking**: Sentry
- **Notifications**: Expo Notifications
- **i18n**: react-i18next

## Development Tools

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Maestro (mobile flows)
- **Dev Tools**: Reactotron (debugging)

## Common Commands

### Setup & Installation
```bash
yarn install          # Install all dependencies
yarn setup            # Interactive configuration wizard
```

### Development
```bash
yarn app:start        # Start Expo dev server
yarn app:ios          # Run on iOS simulator
yarn app:android      # Run on Android emulator
yarn app:web          # Run in browser
```

### Marketing Site
```bash
yarn marketing:dev    # Start Vite dev server
yarn marketing:build  # Build for production
```

### Quality Checks
```bash
yarn lint             # Lint and auto-fix
yarn lint:check       # Lint without fixing
yarn typecheck        # TypeScript type checking
yarn test             # Run Jest tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Generate coverage report
```

### Building
```bash
# iOS
yarn build:ios:sim        # iOS simulator build
yarn build:ios:device     # iOS device build
yarn build:ios:preview    # Preview build
yarn build:ios:prod       # Production build

# Android
yarn build:android:sim    # Android emulator build
yarn build:android:device # Android device build
yarn build:android:preview # Preview build
yarn build:android:prod   # Production build
```

### Utilities
```bash
expo start -c         # Clear Expo cache
yarn depcruise        # Check dependency structure
yarn align-deps       # Align Expo dependencies
```

## Environment Variables

- **Mobile App**: `apps/app/.env` (uses `EXPO_PUBLIC_` prefix for client-side vars)
- **Marketing Site**: `apps/web/.env`
- **Templates**: `.env.example` files in each app directory

Run `yarn setup` to configure interactively.

## Platform Requirements

- **Node.js**: 20.19.0 (use Volta or nvm)
- **iOS Development**: Xcode (macOS only)
- **Android Development**: Android Studio
- **Git**: Required for version control
