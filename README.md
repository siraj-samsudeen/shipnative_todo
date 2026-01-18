# Shipnative Starter Kit

Docs are the source of truth: https://docs.shipnative.app
This README is a practical quickstart + conventions index.

## Prerequisites

**New to JavaScript?** Just install Volta and you're set:
```bash
curl https://get.volta.sh | bash   # macOS/Linux
volta install node@20.19.0 yarn@4.9.1
```

**Full requirements:**
| Tool | Required | Install |
|------|----------|---------|
| Node.js 20 | Yes | Volta (above) or [nodejs.org](https://nodejs.org) |
| Yarn | Yes | Included with Volta, or `corepack enable` |
| Git | Yes | macOS: `xcode-select --install` |
| Xcode | iOS only | [Mac App Store](https://apps.apple.com/app/xcode/id497799835) |
| Android Studio | Android only | [developer.android.com/studio](https://developer.android.com/studio) |

**Verify your setup:**
```bash
node -v   # Should show v20.x.x (NOT v22+)
yarn -v   # Should show 4.x.x
git --version
```

> **Why Node 20?** Some native dependencies fail on Node 22+. We pin to Node 20 LTS for stability.

## Quickstart

```bash
git clone <your-repo-url>
cd shipnative
yarn install
yarn setup        # Configure app name and services
yarn app:start    # Start the dev server
```

Then in a new terminal:
```bash
yarn app:ios      # or: yarn app:android
```

### Alternative: nvm users
```bash
nvm install       # Reads .nvmrc
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
