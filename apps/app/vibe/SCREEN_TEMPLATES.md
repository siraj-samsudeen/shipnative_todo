# Screen Templates Guide

This guide describes the standard screen layout templates available in the app. **Always use the appropriate template** to ensure visual consistency across all screens.

## Available Templates

### 1. AuthScreenLayout

**Use for:** Login, Register, ForgotPassword, Welcome, and any authentication-related screens.

**Features:**
- Gradient background (theme-aware - different colors in dark mode)
- Modal card that slides up from bottom (mobile) or centered (web/tablet)
- Consistent title and subtitle styling
- Built-in close button and back button options
- Header icon support (emoji)
- Keyboard avoiding behavior
- Safe area handling
- Responsive web support

**Import:**
```typescript
import { AuthScreenLayout } from "@/components"
```

**Basic Usage:**
```typescript
export const MyAuthScreen = () => {
  const navigation = useNavigation()
  
  return (
    <AuthScreenLayout
      title="Screen Title"
      subtitle="Brief description of what this screen does"
      showCloseButton
      onClose={() => navigation.goBack()}
    >
      {/* Your form content here */}
      <View style={styles.inputContainer}>
        <TextField label="Email" {...props} />
      </View>
      
      <TouchableOpacity style={styles.primaryButton}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  )
}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Main heading text |
| `subtitle` | string | - | Description below title |
| `children` | ReactNode | - | Screen content |
| `showCloseButton` | boolean | false | Show X button in top right |
| `onClose` | () => void | - | Close button handler |
| `showBackButton` | boolean | false | Show ← button in top left |
| `onBack` | () => void | - | Back button handler |
| `headerIcon` | string | - | Emoji/icon above title |
| `scrollable` | boolean | true | Enable scrolling |
| `centerContent` | boolean | false | Center content vertically |
| `cardStyle` | ViewStyle | - | Additional card styling |

**Common Patterns:**

```typescript
// Login/Register - with close button
<AuthScreenLayout
  title="Welcome Back"
  subtitle="Sign in to continue"
  showCloseButton
  onClose={() => navigation.goBack()}
>

// ForgotPassword - with back button and icon
<AuthScreenLayout
  headerIcon="🔑"
  title="Forgot Password?"
  subtitle="Enter your email to reset"
  showBackButton
  onBack={() => navigation.goBack()}
>

// Welcome screen - centered content, no scroll
<AuthScreenLayout
  title="Get Started"
  subtitle="Create an account or sign in"
  showCloseButton
  onClose={handleClose}
  scrollable={false}
  centerContent
>

// Success state - just icon and message
<AuthScreenLayout
  headerIcon="✉️"
  title="Check Your Email"
  subtitle="We've sent you a reset link"
>
```

---

### 2. OnboardingScreenLayout

**Use for:** Multi-step onboarding flows, feature introductions, first-time user experiences.

**Features:**
- Full-screen gradient background (theme-aware)
- Large centered icon container
- Step indicator dots
- Consistent typography
- Safe area handling
- Responsive web support

**Import:**
```typescript
import { OnboardingScreenLayout } from "@/components"
```

**Basic Usage:**
```typescript
export const OnboardingScreen = () => {
  const [step, setStep] = useState(0)
  
  return (
    <OnboardingScreenLayout
      currentStep={step}
      totalSteps={3}
      headerIcon="👋"
      title="Welcome!"
      subtitle="Let's get you set up"
    >
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(step + 1)}>
        <Text>Continue</Text>
      </TouchableOpacity>
    </OnboardingScreenLayout>
  )
}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Main heading text |
| `subtitle` | string | - | Description below title |
| `headerIcon` | string | - | Large emoji in circle |
| `children` | ReactNode | - | Screen content (buttons, etc.) |
| `currentStep` | number | 0 | Current step (0-indexed) |
| `totalSteps` | number | 3 | Total number of steps |
| `showStepIndicator` | boolean | true | Show dot indicators |
| `footer` | ReactNode | - | Content above dots |

**Common Patterns:**

```typescript
// Welcome step with single CTA
<OnboardingScreenLayout
  currentStep={0}
  totalSteps={3}
  headerIcon="👋"
  title="Welcome Aboard!"
  subtitle="We're excited to help you build your next great app."
>
  <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
    <Text>Let's Go</Text>
  </TouchableOpacity>
</OnboardingScreenLayout>

// Selection step with options
<OnboardingScreenLayout
  currentStep={1}
  totalSteps={3}
  headerIcon="🎯"
  title="Your Goal"
  subtitle="What's your main focus today?"
>
  <View style={styles.optionsContainer}>
    {options.map((option) => (
      <TouchableOpacity key={option} style={styles.optionButton}>
        <Text>{option}</Text>
        <Ionicons name="chevron-forward" />
      </TouchableOpacity>
    ))}
  </View>
</OnboardingScreenLayout>

// Permission request step
<OnboardingScreenLayout
  currentStep={2}
  totalSteps={3}
  headerIcon="🔔"
  title="Stay Updated"
  subtitle="Enable notifications for updates"
>
  <View style={styles.previewCard}>
    {/* Preview content */}
  </View>
  <TouchableOpacity style={styles.primaryButton}>
    <Text>Enable Notifications</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.secondaryButton}>
    <Text>Maybe Later</Text>
  </TouchableOpacity>
</OnboardingScreenLayout>
```

---

## Standard Styles for Template Content

When adding content inside templates, use these consistent styles:

```typescript
const styles = StyleSheet.create((theme) => ({
  // Input containers
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  // Primary button (filled, dark)
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.typography.sizes.lg,
  },
  
  // Secondary button (light background)
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  secondaryButtonText: {
    color: theme.colors.secondaryForeground,
    fontSize: theme.typography.sizes.lg,
  },
  
  // Ghost/text button
  linkButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  
  // Error container
  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  errorText: {
    textAlign: "center",
  },
  
  // Divider
  divider: {
    marginVertical: theme.spacing.lg,
  },
  
  // Social buttons row
  socialRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  
  // Option buttons (for onboarding)
  optionsContainer: {
    gap: theme.spacing.md,
    width: "100%",
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
}))
```

---

## When to Use Which Template

| Screen Type | Template | Key Props |
|-------------|----------|-----------|
| Login | AuthScreenLayout | `showCloseButton`, form fields |
| Register | AuthScreenLayout | `showCloseButton`, form fields |
| Forgot Password | AuthScreenLayout | `showBackButton`, `headerIcon` |
| Welcome/Get Started | AuthScreenLayout | `centerContent`, `scrollable={false}` |
| Reset Success | AuthScreenLayout | `headerIcon`, success message |
| Onboarding Steps | OnboardingScreenLayout | `currentStep`, `totalSteps` |
| Feature Introduction | OnboardingScreenLayout | `headerIcon`, description |
| Permission Request | OnboardingScreenLayout | `headerIcon`, preview + buttons |

---

## Do's and Don'ts

### ✅ DO:
- Always use a template for auth/onboarding screens
- Use theme values for all colors, spacing, typography
- Follow the standard button and input styles
- Use `theme.colors.primary` for main action buttons
- Use `theme.colors.secondary` for secondary buttons
- Include error handling with consistent error container

### ❌ DON'T:
- Use hardcoded colors (e.g., `"#E0F2FE"`) - use theme values
- Create custom layout wrappers for auth screens
- Use `designTokens` directly - use the theme from Unistyles
- Mix different button styles on the same screen type
- Forget to handle keyboard avoiding on form screens
- Skip safe area handling

---

## Creating New Screen Types

If you need a layout that doesn't fit these templates, consider:

1. **Can it fit in AuthScreenLayout?** - Most modal-style screens can
2. **Can it fit in OnboardingScreenLayout?** - Most full-screen flows can
3. **Do you need a new template?** - Only create if fundamentally different

If creating a new template:
1. Place in `/app/components/layouts/`
2. Export from `/app/components/layouts/index.ts`
3. Follow the same patterns (theme usage, safe area, responsive)
4. Document in this file
5. Update STYLE_GUIDE.md


