# AI Context - Single Source of Truth

> **⚠️ IMPORTANT**: This is the SINGLE SOURCE OF TRUTH for all AI assistants working on this project. All AI instruction files (CLAUDE.md, GEMINI.md, AGENTS.md, .cursorrules) reference this file.

**Last Updated**: 2025-12-05
**Version**: 3.1.0

---

## 📖 Modular Documentation Structure

This file contains **critical information only**. For detailed guides, see:

- **Styling Patterns**: `apps/app/vibe/STYLE_GUIDE.md` - Unistyles patterns, theme values
- **Architecture**: `apps/app/vibe/ARCHITECTURE.md` - Component structure, logic flow
- **App Features**: `apps/app/vibe/CONTEXT.md` - App functional requirements
- **Tech Stack Details**: `apps/app/vibe/TECH_STACK.md` - Library specifics
- **Development Workflow**: `vibe/DEVELOPMENT_WORKFLOW.md` - Workflow, mock mode
- **Services**: `vibe/SERVICES.md` - Service architecture
- **Mock Services**: `vibe/MOCK_SERVICES.md` - Mock mode guide

**Read this file first for critical decisions, then reference specific files as needed.**

---

## 🎯 Project Overview

**ShipNative** is a production-ready React Native (Expo) boilerplate optimized for AI-assisted development ("Vibecoding"). It includes authentication, payments, analytics, and a complete UI component system.

### Repository Structure

```
PROJECT_shipnativeapp/
├── shipnativeapp/              # Main boilerplate repository
│   ├── apps/
│   │   ├── app/                # React Native application (Expo) - FULL web support
│   │   │   ├── app/            # Screens, components, navigation
│   │   │   ├── vibe/           # AI context files (detailed)
│   │   │   └── theme/          # Unistyles theme configuration
│   │   └── web/                # Marketing site (Vite/React, separate from RN app)
│   ├── vibe/                   # Project-wide AI context
│   ├── docs/                   # Feature documentation
│   └── mintlify_docs/          # User-facing documentation
│
├── landing_page/               # Marketing site (Next.js, separate repo - legacy)
└── mintlify_docs/              # Documentation site (Mintlify, separate repo)
```

**Note**: Each top-level directory is a separate git repository.

---

## 🎨 Technology Stack (CRITICAL - DO NOT DEVIATE)

### ✅ ALWAYS USE

#### Core Framework
- **React Native** (Expo SDK 54)
- **TypeScript** (strict mode, no `any` types)
- **Functional components only** (no class components)

#### Styling
- **React Native Unistyles 3.0** - THE ONLY styling solution
  - Use `StyleSheet.create((theme) => ({ ... }))` pattern
  - Always access theme values: `theme.colors.*`, `theme.spacing.*`, etc.
  - Support variants for component states
  - Single source of truth: `app/theme/unistyles.ts` (relative to `apps/app/`)
  - **Docs**: https://unistyl.es

#### Navigation
- **React Navigation** - THE ONLY navigation solution
  - Type-safe navigation with `navigationTypes.ts`
  - Use `navigation.navigate()`, `navigation.goBack()`, etc.

#### State Management
- **Zustand** - For global state (auth, subscriptions, preferences)
- **React Query** - For server state (API calls, data fetching, caching)
- **React Hook Form + Zod** - For forms and validation

#### Backend Services
- **Supabase** - Authentication & database
- **RevenueCat** - Subscriptions (iOS, Android, Web)
- **PostHog** - Analytics & feature flags
- **Sentry** - Error tracking

### ❌ NEVER USE

- ❌ **NativeWind/Tailwind** - Removed, use Unistyles 3.0
- ❌ **Expo Router** - Use React Navigation instead
- ❌ **Redux/MobX/Context API** - Use Zustand for global state
- ❌ **Inline styles** - Use StyleSheet.create with theme
- ❌ **useEffect for data fetching** - Use React Query
- ❌ **Class components** - Functional only
- ❌ **Any types** - TypeScript strict mode

---

## 📱 Platform Support

- ✅ **iOS** - Fully supported
- ✅ **Android** - Fully supported
- ✅ **Web** - Fully supported via Expo Web

### Web Support Details

**React Native App (`apps/app`)**:
- ✅ Full web support via Expo Web and `react-native-web`
- ✅ Run: `cd apps/app && yarn web` or `yarn app:web` (from root)
- ✅ Build: `cd apps/app && yarn bundle:web` or `yarn app:web:build` (from root)
- ✅ All features work on web (auth, payments via RevenueCat Web, analytics, etc.)
- ✅ Unistyles 3.0 fully supports web
- ✅ Responsive design with web-specific optimizations

**Marketing Page (`apps/web`)**:
- Separate Vite/React app (not React Native)
- Run: `yarn web:dev` or `yarn marketing:dev` (from root)
- Build: `yarn web:build` or `yarn marketing:build` (from root)
- Uses Tailwind CSS (not Unistyles)

---

## 🎨 Styling Quick Reference

**CRITICAL**: Always use Unistyles 3.0 with theme function. Never hardcode values.

```typescript
// ✅ DO THIS
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
}))
```

**For detailed styling patterns, theme values, and examples**: See `apps/app/vibe/STYLE_GUIDE.md`

---

## 🏗️ Architecture Quick Reference

**Component Structure**: Imports → Types → Component (Hooks → State → Handlers → Render) → Styles

**State Management**:
- Global state → Zustand
- Server state → React Query
- Local state → useState

**For detailed architecture patterns**: See `apps/app/vibe/ARCHITECTURE.md`

---

## 🔄 Development Workflow Quick Reference

**Before coding**: Read context files, check existing code, follow patterns.

**Mock Mode**: All services work without API keys automatically.

**For detailed workflow and common mistakes**: See `vibe/DEVELOPMENT_WORKFLOW.md`

---

## 📚 Key Files Reference

### Context Files (Read First)
- `apps/app/vibe/CONTEXT.md` - App features (screens, flows)
- `apps/app/vibe/TECH_STACK.md` - Technology specific decisions
- `apps/app/vibe/STYLE_GUIDE.md` - Code patterns
- `apps/app/vibe/SCREEN_TEMPLATES.md` - Screen layout templates
- `vibe/SERVICES.md` - Service architecture
- `vibe/MOCK_SERVICES.md` - Mock mode guide

### Detailed Guides (Reference as Needed)
- `apps/app/vibe/STYLE_GUIDE.md` - Detailed styling patterns
- `apps/app/vibe/ARCHITECTURE.md` - Component structure and flow
- `vibe/DEVELOPMENT_WORKFLOW.md` - Development workflow

### Documentation
- `README.md` - Main overview
- `SUPABASE.md` - Auth & database guide
- `MONETIZATION.md` - Payments guide
- `ANALYTICS.md` - Analytics guide
- `DEPLOYMENT.md` - Deployment guide
- `TROUBLESHOOTING.md` - Common issues

---

## 📚 Documentation System

We use a **Layered Context** approach to maximize AI efficiency:

1.  **AGENTS.md (Discovery Layer)**: Nested in directories. Controls agent behavior, enforces constraints (Always/Never), and provides a map to deeper documentation.
2.  **vibe/ (Specification Layer)**: Detailed implementation guides, architectural reference, and feature manuals.

### Documentation Tipping Point
- **Move to AGENTS.md**: If it's a critical constraint or navigation aid that agents must see immediately.
- **Keep in vibe/**: If it's a detailed "how-to", reference list, or conceptual explanation.

### 📁 Allowed Root-Level Documentation Files

**ONLY these .md files are allowed in the root directory (`shipnativeapp/`):**

| File | Purpose |
|------|---------|
| `README.md` | Main overview, quick start, features list |
| `CHANGELOG.md` | Version history and user-facing changes |
| `ROADMAP.md` | Future features and plans |
| `LICENSE.md` | License information |
| `SUPABASE.md`, `MONETIZATION.md`, etc. | Core feature guides |
| `AI_CONTEXT.md` | AI instruction file (single source of truth) |
| `AGENTS.md` | Primary entry point for AI agents (standard) |
| `CLAUDE.md`, `GEMINI.md` | Agent-specific pointers to AGENTS.md |
| `LANDING_PAGE_CONTENT.md` | Landing page content reference |

### ❌ DO NOT Create Random Files in Root

**CRITICAL**: Do NOT create any other .md files in the root directory.
Feature docs go in `docs/` folder (e.g. `docs/OFFLINE.md`).

### 📂 Documentation Location System

**Where to document different types of changes:**

| Change Type | Location |
|-------------|----------|
| **New major feature** | Create `docs/[FEATURE_NAME].md` (NOT root) |
| **Feature changes** | Update existing `docs/[FEATURE].md` or root feature doc |
| **App architecture** | Update `apps/app/vibe/CONTEXT.md` |
| **Service changes** | Update `vibe/SERVICES.md` |
| **Tech stack** | Update `apps/app/vibe/TECH_STACK.md` |
| **Code patterns** | Update `apps/app/vibe/STYLE_GUIDE.md` |
| **User-facing docs** | Update `mintlify_docs/docs/core-features/[feature].mdx` |

### ✅ Documentation Update Rules

1. **New major feature** → Create `docs/[FEATURE_NAME].md`
2. **Feature changes** → Update existing `docs/[FEATURE].md` file
3. **App Structure** → Update `apps/app/vibe/CONTEXT.md`
4. **Service changes** → Update `vibe/SERVICES.md`
5. **Tech changes** → Update `apps/app/vibe/TECH_STACK.md`
6. **Pattern changes** → Update `apps/app/vibe/STYLE_GUIDE.md`
7. **User-facing changes** → Update `mintlify_docs/docs/`
8. **Breaking changes** → Update `docs/TROUBLESHOOTING.md`
9. **Update `README.md`** if feature highlights change.

---

## 🔗 Quick Reference Map

**Critical Info** (this file):
- Technology stack (ALWAYS USE / NEVER USE)
- Platform support
- Documentation system

**Detailed Apps Structure**:
- `apps/app/vibe/CONTEXT.md` - Features & Structure
- `apps/app/vibe/STYLE_GUIDE.md` - Styling & Patterns
- `apps/app/vibe/ARCHITECTURE.md` - Logic Flow
- `apps/app/vibe/TECH_STACK.md` - Tech Details

**Services**:
- `vibe/SERVICES.md` - Service architecture
- `vibe/MOCK_SERVICES.md` - Mock mode guide

---

**This file is the single source of truth. All AI instruction files reference this file. Read this file first.**

