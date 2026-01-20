# Upgrading Shipnative

> **Reference**: This documents the technical process for upgrading to new Shipnative releases. For the user-facing guide, see [Upgrading Docs](https://docs.shipnative.app/getting-started/upgrading).

## Version Tracking

- **Current version**: Check `package.json` → `version` field
- **Latest release**: Check [CHANGELOG.md](../CHANGELOG.md) or GitHub releases
- **Migration notes**: Included in CHANGELOG for breaking changes

## Upgrade Process

### 1. Setup Upstream Remote

```bash
# Add if not already present
git remote add upstream https://github.com/shipnativeapp/shipnative.git

# Verify
git remote -v
```

### 2. Fetch and Merge

```bash
# Always work on a branch
git checkout -b upgrade/$(date +%Y%m%d)

# Fetch latest
git fetch upstream

# Merge without auto-commit
git merge upstream/main --no-commit
```

### 3. Resolve Conflicts

Common conflict areas:

| File | Resolution Strategy |
|------|---------------------|
| `app.json` | Keep your app name/slug/bundleId, accept SDK updates |
| `package.json` | Accept upstream deps, keep custom additions |
| `.env.example` | Merge - add new vars, keep your existing structure |
| `apps/app/screens/*` | Manual - integrate upstream changes into your customizations |
| `apps/app/components/*` | Manual - review each conflict |

### 4. Post-Merge Steps

```bash
# Install new/updated dependencies
yarn install

# If native code changed, clean rebuild
cd apps/app
yarn prebuild:clean
yarn ios  # or yarn android

# Run Supabase migrations (if applicable)
supabase db push

# Run Convex schema (if applicable)
npx convex dev
```

### 5. Test and Commit

```bash
# Test core flows
yarn app:start

# When satisfied
git commit -m "Upgrade to Shipnative $(date +%Y%m%d)"
```

## Breaking Change Patterns

### Environment Variable Changes

Check for:
- New required variables in `.env.example`
- Renamed variables (old names may not work)
- Removed variables (clean up your `.env`)

```bash
# Compare your env with example
diff apps/app/.env apps/app/.env.example
```

### Schema Changes

**Supabase**: New migrations in `supabase/migrations/`
```bash
supabase db push
```

**Convex**: Schema changes in `convex/schema.ts`
```bash
npx convex dev  # Applies schema automatically
```

### Native Dependency Changes

If these change, you need a clean rebuild:
- `app.json` plugins
- `package.json` native packages (react-native-*, expo-*)
- Any `ios/` or `android/` config

```bash
cd apps/app
yarn prebuild:clean
yarn ios
```

## Cherry-Picking Specific Changes

When you only want specific updates:

```bash
# View upstream commits
git log upstream/main --oneline -20

# Cherry-pick specific commits
git cherry-pick <commit-hash>

# If conflicts, resolve then:
git cherry-pick --continue
```

## Troubleshooting

### Merge Conflict in yarn.lock

Don't manually resolve - regenerate it:

```bash
# Accept either version
git checkout --theirs yarn.lock  # or --ours

# Regenerate
yarn install
git add yarn.lock
```

### Native Build Fails After Upgrade

```bash
cd apps/app

# Clean everything
yarn prebuild:clean
rm -rf node_modules
cd ../..
yarn install
cd apps/app
yarn ios
```

### TypeScript Errors After Upgrade

New types or changed interfaces:

```bash
# Check for type errors
yarn typecheck

# Common fixes:
# - Update imports for moved files
# - Add new required props to components
# - Update hook return type usage
```

## Skipping Upgrades

It's fine to skip upgrades if:
- Your app is stable and working
- The changes don't affect you
- You're close to a release

Check CHANGELOG periodically for:
- Security fixes (apply ASAP)
- Bug fixes relevant to you
- Features you want

## Future: Automated Upgrades

We're exploring:
- Patch-based upgrade system (like React Native Upgrade Helper)
- CLI tool for applying updates
- Semantic version tracking

For now, the manual merge process gives full control over what enters your codebase.
