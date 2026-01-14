# Shipnative Starter Kit

Docs are the source of truth: https://docs.shipnative.app  
This README is a practical quickstart + conventions index.

## Quickstart
1) Install Node 20 LTS (recommended: Volta)
2) `corepack enable`
3) `yarn install`
4) `yarn setup` (recommended to wire API keys before coding)
5) `yarn app:start`

Node version: 20.x (see `.nvmrc`). Volta users get it automatically.

### Node Version (Required)
We pin Node 20 LTS because some native deps (e.g., `esbuild`) fail on newer Node versions.

**Fastest setup (Volta):**
```bash
curl https://get.volta.sh | bash
volta install node@20.19.0 yarn@4.9.1
```

**nvm alternative:**
```bash
nvm install
nvm use
```

## Repo Layout
- `apps/app` — React Native (Expo) application (iOS/Android/Web)
- `apps/web` — Marketing site (Vite/React)
- `packages` — Shared packages (if present)
- `vibe/` — Detailed specs and engineering guides

## Commands
App:
- `yarn app:start` — start Expo dev client
- `yarn app:ios` — run iOS
- `yarn app:android` — run Android
- `yarn app:web` — run Expo web

Marketing site:
- `yarn marketing:dev`
- `yarn marketing:build`

Tooling:
- `yarn lint:check`
- `yarn typecheck`
- `yarn test`

## Environment
Runtime env lives in `apps/app/.env` (Expo uses `EXPO_PUBLIC_` vars).
- `yarn setup` creates `.env` and configures your chosen backend
- Required in production: Backend URL + key (Supabase or Convex)
- Optional services: PostHog, RevenueCat, Sentry, OAuth providers

The app validates env at startup and will fail fast in production if required keys are missing.

**Note:** After running `yarn setup`, the unused backend code is automatically removed—you'll only see code for the backend you chose.

## Deep Links
Examples:
- `shipnative://reset-password?code=...`
- `shipnative://verify-email?code=...`
- `shipnative://auth/callback?code=...`

## Troubleshooting
- Missing keys? The app falls back to mock services in development.
- Stuck in odd state? Clear Expo cache: `expo start -c`
- iOS build issues? Reinstall pods inside `apps/app/ios` as needed.

## Conventions (App)
- Styling: React Native Unistyles 3.0 (no inline styles)
- Navigation: React Navigation (no Expo Router)
- State: Zustand (global), React Query (server)
- Forms: React Hook Form + Zod
- TypeScript: strict, no explicit `any`

## Accessibility Checklist (Baseline)
- Interactive elements have labels or visible text
- Touch targets are at least 44x44
- Text contrast meets WCAG AA
- Focus order is logical for keyboard navigation (web)

## CI
CI runs lint, typecheck, tests, and web builds on push/PR.
