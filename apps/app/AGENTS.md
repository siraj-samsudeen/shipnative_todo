# AGENTS.md (React Native App)

This file provide localized context for working on the React Native application in `apps/app`.

## 🏗️ App Architecture
- **Screens**: `app/screens/`
- **Components**: `app/components/` (Check here before creating new ones!)
- **State**: `app/stores/` (Zustand)
- **Data**: `app/hooks/queries/` (React Query)
- **Theme**: `app/theme/unistyles.ts` (Single Source of Truth)

## 🎨 Styling Quick Start (Unistyles 3.0)
Always use the theme function. Never hardcode colors or spacing.
```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
}))
```
*See [STYLE_GUIDE.md](./vibe/STYLE_GUIDE.md) for detailed patterns.*

## 📱 Navigation (React Navigation)
- Type-safe navigation is defined in `navigationTypes.ts`.
- Use `useNavigation` hook for transitions.

## 🌍 Internationalization (i18n)
- **NEVER** hardcode text. Use the `tx` prop or `translate()` function.
- Source of truth: `app/i18n/en.ts`.

## 🧪 Development
- **Start App**: `yarn dev`
- **Mock Mode**: Works automatically without API keys. See [MOCK_SERVICES.md](../../vibe/MOCK_SERVICES.md).

---
*Refer to root [AGENTS.md](../../AGENTS.md) for monorepo guidelines.*
