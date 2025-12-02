# Analytics & Error Tracking Guide

This guide explains how to use the analytics (PostHog) and error tracking (Sentry) systems in your app.

## Quick Start

### Development Mode (No API Keys)

The app automatically uses mock services when API keys are missing in development:

```bash
# Just run the app - mock services will be used automatically
yarn app:ios
# or
yarn app:android
# or
yarn web:dev
```

You'll see console logs indicating mock mode:
```
🔧 Mock Services Status:
  PostHog: MOCK
  Sentry: MOCK
```

### Production Setup

#### 1. Set Up PostHog (Analytics)

1. Create a PostHog account at https://posthog.com
2. Create a new project
3. Get your API key:
   - Go to Project Settings → API Keys
   - Copy your Project API Key
4. (Optional) If self-hosting, get your host URL

5. Add to `.env`:
```bash
EXPO_PUBLIC_POSTHOG_API_KEY=your_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # or your self-hosted URL
```

#### 2. Set Up Sentry (Error Tracking)

1. Create a Sentry account at https://sentry.io
2. Create a new project (select React Native or React)
3. Get your DSN:
   - Go to Project Settings → Client Keys (DSN)
   - Copy your DSN

4. Add to `.env`:
```bash
EXPO_PUBLIC_SENTRY_DSN=your_dsn_here
```

## Usage

### Using the Hook (Recommended)

```typescript
import { useAnalytics } from './hooks/useAnalytics'

function MyComponent() {
  const { trackEvent, trackScreen, trackError, isFeatureEnabled } = useAnalytics()
  
  // Track screen view
  useEffect(() => {
    trackScreen('MyScreen', { source: 'navigation' })
  }, [])
  
  // Track button click
  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'submit',
      screen: 'MyScreen',
    })
  }
  
  // Track error
  const handleError = (error: Error) => {
    trackError(error, {
      tags: { component: 'MyComponent' },
      extra: { additionalInfo: 'some context' },
    })
  }
  
  // Check feature flag
  const showNewFeature = isFeatureEnabled('new-feature')
  
  return (
    <View>
      <Button onPress={handleClick} />
      {showNewFeature && <NewFeature />}
    </View>
  )
}
```

### Using Utility Functions

```typescript
import {
  trackEvent,
  trackScreen,
  trackError,
  identifyUser,
  clearUser,
  trackAuth,
  trackSubscription,
} from './utils/analytics'

// Track custom event
trackEvent('custom_event', { key: 'value' })

// Track screen
trackScreen('HomeScreen', { tab: 'feed' })

// Track error
try {
  // some code
} catch (error) {
  trackError(error as Error, {
    tags: { screen: 'HomeScreen' },
    level: 'error',
  })
}

// Identify user
identifyUser('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
})

// Clear user (on logout)
clearUser()

// Track authentication
trackAuth.signupCompleted('user-123', { method: 'email' })
trackAuth.loginCompleted('user-123', { method: 'google' })
trackAuth.logout()

// Track subscription
trackSubscription.started({ plan: 'pro_monthly' })
trackSubscription.completed({ plan: 'pro_monthly', price: 9.99 })
```

### Direct Service Access

```typescript
import { posthog } from './services/posthog'
import { sentry } from './services/sentry'

// PostHog
posthog.track('event_name', { property: 'value' })
posthog.identify('user-id', { email: 'user@example.com' })
posthog.screen('ScreenName')
posthog.isFeatureEnabled('feature-flag')

// Sentry
sentry.captureException(new Error('Something went wrong'))
sentry.captureMessage('Info message', 'info')
sentry.setUser({ id: 'user-123', email: 'user@example.com' })
sentry.addBreadcrumb({
  message: 'User clicked button',
  category: 'ui',
  level: 'info',
})
```

## Features

### Analytics (PostHog)

#### Event Tracking

```typescript
// Basic event
trackEvent('button_clicked')

// Event with properties
trackEvent('product_viewed', {
  product_id: '123',
  product_name: 'Widget',
  price: 29.99,
})

// Standard events
import { AnalyticsEvents } from './types/analytics'

trackEvent(AnalyticsEvents.SIGNUP_COMPLETED)
trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED)
```

#### Screen Tracking

```typescript
// Basic screen
trackScreen('HomeScreen')

// Screen with properties
trackScreen('ProductScreen', {
  product_id: '123',
  source: 'search',
})

// Standard screens
import { AnalyticsScreens } from './types/analytics'

trackScreen(AnalyticsScreens.PAYWALL)
trackScreen(AnalyticsScreens.PROFILE)
```

#### User Identification

```typescript
// Identify user
identifyUser('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro',
})

// Update user properties
import { posthog } from './services/posthog'

posthog.setUserProperties({
  subscription_status: 'active',
  last_login: new Date().toISOString(),
})

// Clear user (logout)
clearUser()
```

#### Feature Flags

```typescript
// Check if feature is enabled
if (isFeatureEnabled('new-feature')) {
  // Show new feature
}

// Get feature flag value
const variant = getFeatureFlag('test-variant') // 'control' | 'variant-a' | 'variant-b'

// Listen for feature flag changes
posthog.onFeatureFlags?.((flags) => {
  console.log('Feature flags updated:', flags)
})
```

#### Groups (B2B)

```typescript
// Assign user to a group
posthog.group('company', 'company-123', {
  name: 'Acme Corp',
  plan: 'enterprise',
})
```

---

### Error Tracking (Sentry)

#### Exception Tracking

```typescript
try {
  // risky code
} catch (error) {
  trackError(error as Error, {
    tags: {
      component: 'PaymentForm',
      action: 'submit',
    },
    extra: {
      paymentMethod: 'credit_card',
      amount: 99.99,
    },
    level: 'error',
  })
}
```

#### Message Logging

```typescript
import { trackMessage } from './utils/analytics'

// Info message
trackMessage('User completed onboarding', 'info')

// Warning
trackMessage('API rate limit approaching', 'warning')

// Error
trackMessage('Failed to load data', 'error', {
  tags: { endpoint: '/api/data' },
})
```

#### Breadcrumbs

```typescript
import { addBreadcrumb } from './utils/analytics'
import { BreadcrumbCategories } from './types/errorTracking'

// Navigation breadcrumb
addBreadcrumb({
  category: BreadcrumbCategories.NAVIGATION,
  message: 'Navigated to Settings',
  type: 'navigation',
})

// API call breadcrumb
addBreadcrumb({
  category: BreadcrumbCategories.API,
  message: 'API call to /users',
  type: 'http',
  data: {
    url: '/users',
    method: 'GET',
    status_code: 200,
  },
})

// User action breadcrumb
addBreadcrumb({
  category: BreadcrumbCategories.USER_ACTION,
  message: 'User clicked subscribe button',
  type: 'user',
})
```

#### User Context

```typescript
// Set user context for errors
sentry.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'johndoe',
})

// Clear user context
sentry.setUser(null)
```

#### Tags and Context

```typescript
// Set tags (for filtering in Sentry)
sentry.setTag('environment', 'production')
sentry.setTag('version', '1.2.3')

// Set multiple tags
sentry.setTags({
  platform: 'ios',
  locale: 'en-US',
})

// Set extra context
sentry.setExtra('user_preferences', { theme: 'dark' })

// Set multiple extras
sentry.setExtras({
  device_info: { model: 'iPhone 14', os: 'iOS 17' },
  app_state: { screen: 'Home', tab: 'Feed' },
})
```

#### Performance Monitoring

```typescript
// Start a transaction
const transaction = sentry.startTransaction?.('load_products', 'http')

try {
  // Your code
  const products = await fetchProducts()
  
  transaction?.setStatus?.('ok')
} catch (error) {
  transaction?.setStatus?.('error')
  throw error
} finally {
  transaction?.finish?.()
}
```

---

## Standard Events

### Authentication

```typescript
import { trackAuth } from './utils/analytics'

// Signup flow
trackAuth.signupStarted({ method: 'email' })
trackAuth.signupCompleted('user-123', { method: 'email' })

// Login flow
trackAuth.loginStarted({ method: 'google' })
trackAuth.loginCompleted('user-123', { method: 'google' })

// Logout
trackAuth.logout()
```

### Subscription

```typescript
import { trackSubscription } from './utils/analytics'

trackSubscription.started({ plan: 'pro_monthly' })
trackSubscription.completed({ plan: 'pro_monthly', price: 9.99 })
trackSubscription.cancelled({ plan: 'pro_monthly', reason: 'too_expensive' })
trackSubscription.restored({ plan: 'pro_annual' })
```

### Onboarding

```typescript
import { trackOnboarding } from './utils/analytics'

trackOnboarding.started()
trackOnboarding.completed()
trackOnboarding.skipped()
```

---

## Testing

### Mock Mode (No API Keys)

1. Run app without API keys
2. Trigger events and errors
3. Check console logs:
   - `📊 [MockPostHog] Event: button_clicked`
   - `🐛 [MockSentry] Exception: Error message`

### Real Services

#### PostHog

1. Add API key to `.env`
2. Run app
3. Trigger events
4. Check PostHog dashboard:
   - Events → See your events
   - Persons → See identified users
   - Feature Flags → Test flags

#### Sentry

1. Add DSN to `.env`
2. Run app
3. Trigger test error:
```typescript
throw new Error('Test error')
```
4. Check Sentry dashboard:
   - Issues → See captured errors
   - Breadcrumbs → See user actions
   - User context → See user info

---

## Best Practices

### Event Naming

✅ **Good**:
- `button_clicked`
- `product_viewed`
- `checkout_completed`

❌ **Bad**:
- `ButtonClicked` (use snake_case)
- `click` (too generic)
- `user clicked the submit button on the checkout page` (too verbose)

### Properties

✅ **Good**:
```typescript
trackEvent('product_viewed', {
  product_id: '123',
  product_name: 'Widget',
  category: 'electronics',
  price: 29.99,
})
```

❌ **Bad**:
```typescript
trackEvent('product_viewed', {
  data: { /* nested object */ },  // Avoid deep nesting
  timestamp: Date.now(),  // PostHog adds this automatically
})
```

### Error Context

✅ **Good**:
```typescript
trackError(error, {
  tags: {
    component: 'PaymentForm',
    action: 'submit',
  },
  extra: {
    paymentMethod: 'credit_card',
    amount: 99.99,
  },
})
```

❌ **Bad**:
```typescript
trackError(error)  // No context
```

### Privacy

- **Don't track PII** without consent
- **Anonymize sensitive data** (credit cards, passwords)
- **Respect user preferences** (opt-out)

```typescript
// Good: Anonymized
trackEvent('payment_completed', {
  amount: 99.99,
  method: 'credit_card',
  // NO: card_number, cvv, etc.
})

// Respect opt-out
if (userHasOptedOut) {
  posthog.optOut()
  // Events won't be sent
}
```

---

## Troubleshooting

### Events not showing in PostHog

**Problem**: Events tracked but not appearing in dashboard

**Solution**:
- Check API key is correct
- Verify network connectivity
- Check PostHog project is active
- Wait a few minutes (events may be delayed)
- Check browser console for errors

### Errors not showing in Sentry

**Problem**: Errors captured but not in dashboard

**Solution**:
- Check DSN is correct
- Verify error isn't filtered by `beforeSend`
- Check Sentry project quota
- Verify error level isn't filtered
- Check browser console for Sentry errors

### Mock mode in production

**Problem**: App using mock services in production

**Solution**:
- Verify `.env` file exists
- Check environment variables are prefixed with `EXPO_PUBLIC_`
- Restart Metro bundler: `yarn app:start --clear`
- Check build configuration

---

## Advanced Usage

### Custom Analytics Service

```typescript
import type { AnalyticsService } from './types/analytics'

class CustomAnalytics implements AnalyticsService {
  // Implement all methods
  track(event: string, properties?: EventProperties) {
    // Your implementation
  }
  // ... other methods
}
```

### Custom Error Tracking

```typescript
import type { ErrorTrackingService } from './types/errorTracking'

class CustomErrorTracking implements ErrorTrackingService {
  // Implement all methods
  captureException(error: Error, context?: ErrorContext) {
    // Your implementation
  }
  // ... other methods
}
```

### Testing Utilities

```typescript
import { mockSentry } from './services/mocks/sentry'
import { MockPostHog } from './services/mocks/posthog'

// In tests
const mockPostHog = new MockPostHog({ apiKey: 'test' })

// Track events
mockPostHog.track('test_event')

// Get tracked events
const events = mockPostHog.getEvents()
expect(events).toHaveLength(1)

// Clear events
mockPostHog.clearEvents()
```

---

## Next Steps

- [ ] Set up PostHog account and get API key
- [ ] Set up Sentry account and get DSN
- [ ] Add API keys to `.env`
- [ ] Test analytics on all platforms
- [ ] Set up feature flags in PostHog
- [ ] Configure error alerts in Sentry
- [ ] Review privacy compliance
- [ ] Document custom events for your app
