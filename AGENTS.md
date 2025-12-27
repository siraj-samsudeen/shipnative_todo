# AGENTS.md

> **⚠️ CRITICAL**: [AI_CONTEXT.md](./AI_CONTEXT.md) is the **SINGLE SOURCE OF TRUTH** for this project. Read it first for tech stack, patterns, and documentation rules.

## Project Overview
**ShipNative** is a production-ready React Native (Expo) boilerplate optimized for "Vibecoding". It's a monorepo consisting of three interconnected repositories.

## Setup Commands
- **Install All Deps**: `yarn install`
- **Start RN App**: `yarn app:start`
- **Start Marketing Site**: `yarn marketing:dev`
- **Run Tests**: `yarn test`

## 🛠️ High-Level Tech Stack (ALWAYS USE)
- **Styling**: React Native Unistyles 3.0 (NOT Tailwind/NativeWind)
- **Navigation**: React Navigation (NOT Expo Router)
- **State**: Zustand (Global), React Query (Server)
- **Forms**: React Hook Form + Zod

## 📂 Context Mapping
This project uses nested `AGENTS.md` files for folder-specific context. 
> **IMPORTANT**: Always check the directory you are working in (and its parents) for an `AGENTS.md` file. The closest file takes precedence.

- **Root**: Global layout and monorepo management.
- **`apps/app/`**: [App-Specific AGENTS.md](./apps/app/AGENTS.md) (Styling, Screen Templates, etc.)
- **`landing_page/`**: [Landing Page AGENTS.md](../landing_page/AGENTS.md)
- **`mintlify_docs/`**: [Docs AGENTS.md](../mintlify_docs/AGENTS.md)
- **`vibe/`**: Platform-specific detailed specifications (Engineering guides, Service architecture, etc.).

## 📝 Documentation Principle: Discovery vs. Specification
- **AGENTS.md (Discovery)**: The closest file to your cursor. Contains high-level rules, anti-patterns, and maps to deeper context. Keep it lean (under 100 lines).
- **docs/ & vibe/ (Specification)**: Detailed technical specifications, architectural deep dives, and complex setup guides.

### ⚖️ The "Tipping Point"
Add to `AGENTS.md` ONLY if:
1. It is a **constraint** (Always/Never).
2. It is a **directory map** (Where is X?).
3. It fixes a **recurring agent mistake**.
*Everything else belongs in `docs/` or `vibe/` to save tokens.*

## 📝 Maintenance Rules
- **New Feature**: Create `vibe/[FEATURE_NAME].md`.
- **Major App Changes**: Update `apps/app/vibe/CONTEXT.md`.
- **Instruction Drift**: If an agent makes a mistake, update the local `AGENTS.md` with a specific rule.
- **NEVER** create random `.md` files in the root directory.

---
*Refer to [AI_CONTEXT.md](./AI_CONTEXT.md) for full architecture and workflow details.*
