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
| Charts | `apps/app/app/components/Charts/` |
| Hooks | `apps/app/app/hooks/` |
| Stores (Zustand) | `apps/app/app/stores/` |
| Services | `apps/app/app/services/` |
| Types | `apps/app/app/types/` |
| Theme config | `apps/app/app/theme/unistyles.ts` |
| Navigation types | `apps/app/app/navigators/navigationTypes.ts` |
| Integration tests | `apps/app/app/__tests__/integration/` |
| Logger utility | `apps/app/app/utils/Logger.ts` |

## UI Components

### Form Inputs
- `TextField` - Text input with validation
- `DatePicker` - Date/time selection with calendar
- `FilePicker` - Image and document uploads
- `Toggle`, `Switch`, `Checkbox`, `Radio` - Toggle controls

### Data Visualization
- `LineChart` - Multi-series line charts
- `BarChart` - Vertical/horizontal bar charts
- `PieChart` - Pie and donut charts
- `Progress` - Linear and circular progress

### Layout
- `Card`, `Container`, `Screen`, `Tabs`
- `Modal`, `Divider`, `Header`

### Feedback
- `Toast`, `Spinner`, `Skeleton`, `EmptyState`

## Detailed Docs (in `vibe/`)

| Topic | File |
|-------|------|
| Styling patterns | `apps/app/vibe/STYLE_GUIDE.md` |
| App architecture | `apps/app/vibe/ARCHITECTURE.md` |
| Screen templates | `apps/app/vibe/SCREEN_TEMPLATES.md` |
| Services & mocks | `vibe/SERVICES.md`, `vibe/MOCK_SERVICES.md` |
| Auth & database | `vibe/SUPABASE.md` |
| Realtime (chat, presence) | `vibe/SUPABASE.md` (Realtime Hooks section) |
| Payments | `vibe/MONETIZATION.md` |
| CI/CD workflows | `.github/workflows/` |

## Platform Support
- iOS, Android, Web (via Expo Web)
- `apps/web/` is a separate marketing site using Tailwind (not Unistyles)

## Rules
- Check `apps/app/app/components/` before creating new components
- Use theme values (`theme.colors.*`, `theme.spacing.*`) - never hardcode
- All components must support dark mode via semantic theme colors
- New feature docs go in `vibe/` or `docs/`, NOT root directory
