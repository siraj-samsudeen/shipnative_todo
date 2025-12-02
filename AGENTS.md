# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Yarn workspaces + Turbo (`apps/*`).
- `apps/app`: Expo Router mobile app. Key folders: `app/` screens, `components/`, `stores/` (Zustand), `hooks/` (React Query), `services/` (Supabase, RevenueCat, PostHog, Sentry), `utils/`, `theme/`, `vibe/` (AI context docs).
- `apps/web`: placeholder for future web build; keep changes isolated until web is supported.
- `docs/` and root Markdown files capture platform notes (deployment, notifications, monetization, etc.); update these when behavior changes.

## Build, Test, and Development Commands
From the repo root:
- `yarn dev` (or `yarn app:dev`): start Expo dev client in `apps/app`.
- `yarn app:ios` / `yarn app:android`: run native targets via Turbo.
- `yarn lint`: run workspace ESLint; `yarn format`: Prettier on `ts/tsx/md`.
- `yarn build`: Turbo build pipeline (used mainly for package/CLI artifacts).

Within `apps/app`:
```bash
yarn test          # Jest + React Native Testing Library
yarn test:watch    # Watch mode
yarn test:maestro  # Maestro flows in .maestro/flows
yarn compile       # Type-check only
yarn build:ios:prod | yarn build:android:prod  # Local EAS builds
```

## Styling with Unistyles 3.0

### Single Source of Truth
All styling is configured in `/app/theme/unistyles.ts`:
- Light and dark themes with semantic colors
- Typography (fonts, sizes, line heights)
- Spacing (8px grid system)
- Border radius scale
- Shadow presets

### Basic Usage
```typescript
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

// Access theme in component
const { theme } = useUnistyles()

// Define styles with theme
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  text: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.foreground,
  },
}))
```

### Variants for Component States
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

// In component
styles.useVariants({ variant: 'filled', size: 'md' })
```

### Dark Mode
- Automatic via `adaptiveThemes: true` in Unistyles config
- Both themes defined in `/app/theme/unistyles.ts`
- Components automatically respond to system theme changes

## Coding Style & Naming Conventions
- TypeScript-first, functional components only; avoid `any` and mutations.
- Formatting is enforced by Prettier (2-space indent) and ESLint (`eslint-config-expo`, `eslint-config-prettier`).
- Follow `apps/app/vibe/STYLE_GUIDE.md`: components `PascalCase`, hooks `useCamelCase`, stores `camelCaseStore`, types `name.types.ts`, no kebab-case.
- Keep import order: React/React Native → third-party → stores/hooks → components → utils → styles.
- **Use Unistyles with theme** for all styling - no inline styles or magic numbers.

## Core Components
All components use Unistyles with theme support and variants:

- **Text** - Typography with presets (heading, subheading, caption)
- **Button** - Variants: filled, outlined, ghost, secondary, danger
- **TextField** - Input with label, helper, status states
- **Card** - Content container with presets
- **Avatar** - User images with fallback initials
- **Badge** - Status indicators and labels
- **Divider** - Content separator with optional label
- **Spinner** - Loading indicators
- **IconButton** - Icon-only buttons
- **Container** - Screen wrapper with safe areas

## Testing Guidelines
- Place unit/integration specs alongside code or in `apps/app/test`; use `*.test.ts` or `*.test.tsx`.
- Mock external services (Supabase, RevenueCat, PostHog, Sentry) as in existing tests; keep tests deterministic.
- Add Maestro flows when altering navigation or critical happy paths; include device IDs via `MAESTRO_APP_ID` when needed.
- Run `yarn compile` before reviews to catch type regressions.

## Commit & Pull Request Guidelines
- Git history favors conventional prefixes (`feat:`, `fix:`, `refactor:`); write imperative, scoped summaries (avoid noise commits like `aaa`).
- PRs should include: brief summary, linked issue/task, commands run, and screenshots/screen recordings for UI changes (light/dark, iOS/Android).
- Update relevant docs (`vibe/CONTEXT.md`, feature-specific guides in root/docs) when behavior or config changes. Never commit secrets; rely on mock mode if keys are missing (`apps/app/scripts/setup-env.js` can scaffold env files).
