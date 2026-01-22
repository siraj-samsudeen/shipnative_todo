# Project Structure

## Monorepo Layout

```
shipnative/
├── apps/
│   ├── app/          # React Native mobile app (Expo)
│   └── web/          # Marketing site (Vite + React)
├── vibe/             # Engineering documentation
├── supabase/         # Supabase config and functions
├── scripts/          # Build and setup scripts
└── patches/          # Package patches (patch-package)
```

## Mobile App Structure (`apps/app/`)

### Core Directories

```
apps/app/
├── app/                    # Application source code
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigators/         # Navigation configuration
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── services/           # API clients and integrations
│   ├── utils/              # Helper functions
│   ├── theme/              # Unistyles theme config
│   ├── types/              # TypeScript type definitions
│   ├── i18n/               # Internationalization
│   ├── config/             # App configuration
│   ├── context/            # React context providers
│   ├── providers/          # App-level providers
│   ├── schemas/            # Zod validation schemas
│   └── widgets/            # iOS/Android widgets
├── assets/                 # Images, icons, fonts
├── ios/                    # iOS native code
├── android/                # Android native code
├── test/                   # Test setup and utilities
└── vibe/                   # App-specific documentation
```

### Key File Locations

| Need | Location |
|------|----------|
| Screens | `apps/app/app/screens/` |
| Components | `apps/app/app/components/` |
| Hooks (import from) | `apps/app/app/hooks/index.ts` |
| Zustand Stores | `apps/app/app/stores/` |
| Services | `apps/app/app/services/` |
| Types | `apps/app/app/types/` |
| Theme | `apps/app/app/theme/unistyles.ts` |
| Navigation Types | `apps/app/app/navigators/navigationTypes.ts` |
| Translations | `apps/app/app/i18n/` |
| Charts | `apps/app/app/components/Charts/` |
| Integration Tests | `apps/app/app/__tests__/integration/` |
| Logger | `apps/app/app/utils/Logger.ts` |

### Backend-Specific Code

- **Convex Hooks**: `apps/app/app/hooks/convex/`
- **Supabase Hooks**: `apps/app/app/hooks/supabase/`
- **Backend Providers**: `apps/app/app/providers/`

Note: After running `yarn setup`, unused backend code is automatically removed.

## Component Organization

### UI Components (`apps/app/app/components/`)

- **Form Inputs**: `TextField`, `DatePicker`, `FilePicker`, `Toggle`, `Switch`, `Checkbox`, `Radio`
- **Data Visualization**: `LineChart`, `BarChart`, `PieChart`, `Progress`
- **Layout**: `Card`, `Container`, `Screen`, `Tabs`, `Modal`, `Divider`, `Header`
- **Feedback**: `Toast`, `Spinner`, `Skeleton`, `EmptyState`
- **Business**: `PricingCard`, `SubscriptionStatus`

All components support translation keys (`tx` props) for i18n.

## Services Layer (`apps/app/app/services/`)

- **API**: REST/GraphQL clients
- **Backend**: Supabase or Convex integration
- **Mocks**: Mock services for development
- **Integrations**: RevenueCat, PostHog, Sentry, Notifications

## Documentation (`vibe/`)

Detailed engineering guides:
- `ARCHITECTURE.md` - App architecture patterns
- `STYLE_GUIDE.md` - Styling conventions
- `SCREEN_TEMPLATES.md` - Screen component patterns
- `SERVICES.md` - Service layer patterns
- `BACKEND.md` - Backend integration overview
- `SUPABASE.md` - Supabase-specific guide
- `CONVEX.md` - Convex-specific guide
- `MONETIZATION.md` - RevenueCat payments
- `SUBSCRIPTION_ADVANCED.md` - Advanced subscription features
- `TESTING.md` - Testing strategies
- `DEPLOYMENT.md` - CI/CD and deployment

## Configuration Files

- `apps/app/.env` - Mobile app environment variables
- `apps/app/app.json` - Expo app configuration
- `apps/app/app.config.ts` - Dynamic Expo config
- `apps/app/eas.json` - EAS Build configuration
- `apps/app/tsconfig.json` - TypeScript config
- `apps/app/jest.config.js` - Jest test config
- `apps/app/metro.config.js` - Metro bundler config

## Asset Organization

```
apps/app/assets/
├── icons/          # UI icons (PNG @1x, @2x, @3x)
├── images/         # App images and logos
│   └── AppIcons/   # App icon variants
```

Use the built-in `Icon` component for icons and `AutoImage` for images.

## Testing Structure

```
apps/app/
├── app/__tests__/          # Component/feature tests
│   ├── integration/        # Integration tests
│   ├── performance/        # Performance benchmarks
│   └── platform/           # Platform-specific tests
├── test/                   # Test setup and utilities
└── .maestro/               # E2E test flows
    ├── flows/              # Test scenarios
    └── shared/             # Reusable test steps
```

## Naming Conventions

- **Components**: PascalCase (e.g., `TextField.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.ts`)
- **Services**: camelCase (e.g., `supabase.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `AppUser`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)

## Import Aliases

Use `@/` for absolute imports from `apps/app/app/`:

```typescript
import { useAuth } from '@/hooks'
import { Button } from '@/components'
import { colors } from '@/theme'
```
