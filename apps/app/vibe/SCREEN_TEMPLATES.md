# Screen Templates Guide

## Quick Decision

| Screen Type | Use |
|------------|-----|
| Auth (Login, Register, etc.) | `<AuthScreenLayout>` |
| Onboarding flows | `<OnboardingScreenLayout>` |
| Standard app screen | `<Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>` |
| Form screen | `<Container keyboardAvoiding safeAreaEdges={["top", "bottom"]}>` |
| Custom gradient screen | Manual (like HomeScreen/ProfileScreen) |

## Current Screen Status

| Screen | Pattern |
|--------|---------|
| DataDemoScreen | `<Screen>` ✅ |
| ComponentShowcaseScreen | `<Container>` ✅ |
| HomeScreen | Manual + gradient (intentional) |
| ProfileScreen | Manual + gradient (intentional) |

## Layout Components

### AuthScreenLayout

For Login, Register, ForgotPassword, Welcome screens.

```typescript
<AuthScreenLayout
  titleTx="loginScreen:title"
  subtitleTx="loginScreen:subtitle"
  showCloseButton
  onClose={() => navigation.goBack()}
>
  {/* Form fields, buttons */}
</AuthScreenLayout>
```

**Key props:** `title/titleTx`, `subtitle/subtitleTx`, `showCloseButton`, `onClose`, `showBackButton`, `onBack`, `headerIcon`, `scrollable`, `centerContent`

### OnboardingScreenLayout

For multi-step onboarding flows.

```typescript
<OnboardingScreenLayout
  currentStep={0}
  totalSteps={3}
  headerIcon="👋"
  title="Welcome!"
  subtitle="Let's get you set up"
>
  <Button text="Continue" onPress={handleNext} />
</OnboardingScreenLayout>
```

**Key props:** `currentStep`, `totalSteps`, `headerIcon`, `title`, `subtitle`

### Screen Component

For most app screens. Presets: `scroll`, `fixed`, `auto`. Has pull-to-refresh support.

```typescript
<Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
  <View>{/* Your content */}</View>
</Screen>

// With pull-to-refresh
<Screen
  preset="scroll"
  safeAreaEdges={["top", "bottom"]}
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
>
  <View>{/* Refreshable content */}</View>
</Screen>
```

**Key props:** `preset`, `safeAreaEdges`, `refreshing`, `onRefresh`, `backgroundColor`

### Container Component

For simple screens and forms. Has keyboard avoidance.

```typescript
<Container
  preset="scroll"
  safeAreaEdges={["top", "bottom"]}
  keyboardAvoiding
>
  <TextField label="Name" />
  <Button text="Submit" />
</Container>
```

**Key props:** `preset`, `safeAreaEdges`, `keyboardAvoiding`, `centerContent`, `maxContentWidth`


## Common Patterns

**DO:**
- Use `Screen` for standard scrollable screens
- Use `Container` for forms with keyboard handling
- Use `AuthScreenLayout` for all auth screens
- Let components handle safe areas (don't do it manually)

**DON'T:**
- Mix patterns (some screens using `Screen`, others using manual layouts)
- Handle safe areas manually when components do it
- Copy HomeScreen's manual layout (only use for custom gradients)
