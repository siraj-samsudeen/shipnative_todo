# AGENTS.md

## Setup
```bash
yarn install          # Install dependencies
yarn setup            # Interactive wizard (configures .env, app.json)
yarn app:start        # Start Expo dev server
yarn app:ios          # Run on iOS simulator
yarn app:android      # Run on Android emulator
yarn app:web          # Run in browser
```

## Tech Stack

### ALWAYS USE
- **Styling**: Unistyles 3.0 with `StyleSheet.create((theme) => ({...}))`
- **Navigation**: React Navigation (type-safe via `navigationTypes.ts`)
- **State**: Zustand (global) + React Query (server)
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase, RevenueCat, PostHog, Sentry

### NEVER USE
- NativeWind/Tailwind (use Unistyles)
- Expo Router (use React Navigation)
- Redux/MobX/Context API (use Zustand)
- Inline styles or hardcoded values (use theme)
- useEffect for data fetching (use React Query)

## Directory Map

| Need | Location |
|------|----------|
| Screens | `apps/app/app/screens/` |
| Components | `apps/app/app/components/` |
| Stores (Zustand) | `apps/app/app/stores/` |
| Services | `apps/app/app/services/` |
| Theme config | `apps/app/app/theme/unistyles.ts` |
| Navigation types | `apps/app/app/navigators/navigationTypes.ts` |

## Detailed Docs (in `vibe/`)

| Topic | File |
|-------|------|
| Styling patterns | `apps/app/vibe/STYLE_GUIDE.md` |
| App architecture | `apps/app/vibe/ARCHITECTURE.md` |
| Screen templates | `apps/app/vibe/SCREEN_TEMPLATES.md` |
| Services & mocks | `vibe/SERVICES.md`, `vibe/MOCK_SERVICES.md` |
| Auth & database | `vibe/SUPABASE.md` |
| Payments | `vibe/MONETIZATION.md` |

## Platform Support
- iOS, Android, Web (via Expo Web)
- `apps/web/` is a separate marketing site using Tailwind (not Unistyles)

## Rules
- Check `apps/app/app/components/` before creating new components
- Use theme values (`theme.colors.*`, `theme.spacing.*`) - never hardcode
- All components must support dark mode via semantic theme colors
- New feature docs go in `vibe/` or `docs/`, NOT root directory
