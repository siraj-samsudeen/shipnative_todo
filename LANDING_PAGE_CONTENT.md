# ShipNative Landing Page Content

Complete feature list, developer experience journey, and marketing copy for shipnative.app

---

## Hero Section

### Headline
**Ship Your React Native App in Days, Not Months**

### Subheadline
The production-ready React Native boilerplate built for AI-assisted development. Authentication, payments, analytics, and more—all configured and ready to customize.

### CTA Buttons
- **Primary**: `git clone` → `yarn setup` (Copy to clipboard)
- **Secondary**: View Demo App

---

## Key Value Props

### 1. AI-First Architecture
Built specifically for AI coding assistants like Cursor and Claude. Comprehensive context files guide AI to write perfect code every time.

### 2. Zero to Production in Minutes
Everything you need is already configured: auth, payments, analytics, push notifications, and deep linking. Just add your API keys.

### 3. Mock Mode for Rapid Development
Develop without any API keys. All services have intelligent mocks that let you build UI and logic instantly.

### 4. Beautiful by Default
Modern gradient-based design system with dark mode, glassmorphism, and smooth animations. Looks premium out of the box.

---

## Complete Feature List

### 🔐 Authentication (Supabase)
- ✅ Email/password authentication
- ✅ Social auth ready (Google, Apple, GitHub)
- ✅ Email verification
- ✅ Password reset flow
- ✅ Secure session management
- ✅ Row Level Security (RLS)
- ✅ **Mock authentication** for development

**DX**: Pre-built login, register, forgot password, and profile screens. `useAuth()` hook for instant access.

### 💰 Monetization (RevenueCat)
- ✅ iOS in-app purchases (RevenueCat)
- ✅ Android in-app purchases (RevenueCat)
- ✅ Web payments (RevenueCat Web Billing)
- ✅ Subscription management
- ✅ Freemium/Pro tier logic
- ✅ Paywall screen
- ✅ **Mock payments** for testing

**DX**: `useSubscriptionStore()` provides a unified API across mobile and web. Pre-built paywall and subscription management screens.

### 📊 Analytics & Error Tracking
- ✅ PostHog analytics
- ✅ Event tracking
- ✅ Feature flags
- ✅ A/B testing
- ✅ Sentry error tracking
- ✅ Performance monitoring
- ✅ **Mock analytics** for development

**DX**: `trackEvent()` helper and automatic screen tracking. Errors automatically sent to Sentry in production.

### 🔔 Push Notifications
- ✅ Local notifications
- ✅ Remote notifications (FCM/APNs)
- ✅ Notification permissions flow
- ✅ Deep linking from notifications
- ✅ Notification history
- ✅ Badge management
- ✅ **Mock notifications** for testing

**DX**: `useNotificationStore()` for complete notification management. Pre-built permission request flow.

### 🔗 Deep Linking
- ✅ Custom URL scheme (`yourapp://`)
- ✅ Universal Links (iOS)
- ✅ App Links (Android)
- ✅ Deep link parsing
- ✅ Navigation integration
- ✅ Test commands included

**DX**: `deepLinking.handle()` utility and pre-configured routes for common flows (password reset, email verification).

### 🎨 Design System
- ✅ Modern gradient backgrounds
- ✅ Glassmorphism effects
- ✅ Dark mode support
- ✅ Design tokens (colors, spacing, typography)
- ✅ Pre-built components (14+)
- ✅ Unistyles 3.0
- ✅ Smooth animations

**DX**: Import `designTokens` and use consistent spacing, colors, and typography everywhere. Component showcase in dev dashboard.

### 📱 Pre-Built Screens
- ✅ Onboarding
- ✅ Login / Register
- ✅ Forgot Password
- ✅ Home / Starter
- ✅ Profile
- ✅ Paywall
- ✅ Subscription Management
- ✅ Settings
- ✅ Dev Dashboard

**DX**: All screens follow the same pattern. Copy and customize for your needs.

### 🛠 Developer Tools
- ✅ Component showcase
- ✅ Dev dashboard
- ✅ Mock mode toggle
- ✅ Theme preview
- ✅ Service status checks
- ✅ CLI generators
- ✅ TypeScript strict mode

**DX**: Press `Cmd+D` in dev mode to access dev dashboard with component examples and service status.

### 🗄 Backend Templates
- ✅ User profiles schema
- ✅ User settings schema
- ✅ File uploads schema
- ✅ Audit logs schema
- ✅ RLS policy templates
- ✅ Edge Function examples
- ✅ Migration scripts

**DX**: Copy-paste production-ready schemas. All include RLS policies and triggers.

### ⚡️ Code Generators
- ✅ Generate screens
- ✅ Generate components
- ✅ Generate Zustand stores
- ✅ Generate API endpoints
- ✅ Generate React Query hooks

**DX**: `yarn generate screen ProfileSettings` creates a fully-configured screen in seconds.

### 🌐 Platforms
- ✅ iOS (iPhone, iPad)
- ✅ Android (Phone, Tablet)
- ✅ Web (Expo Web)
- ✅ Shared codebase
- ✅ Platform-specific optimizations where needed

**DX**: Build once, ship to mobile and web with consistent patterns.

### 📦 Monorepo Structure
- ✅ Turborepo for fast builds
- ✅ Shared packages
- ✅ React Native app
- ✅ Landing page (web)
- ✅ Yarn workspaces

**DX**: `yarn app:ios`, `yarn app:android`, `yarn web:dev` from root.

### 🧪 Testing Ready
- ✅ Jest configured
- ✅ React Native Testing Library
- ✅ Maestro E2E tests
- ✅ Component test examples
- ✅ Mock service tests

**DX**: `yarn test` runs all tests. Examples included for every pattern.

### 🚀 Deployment
- ✅ EAS Build configuration
- ✅ iOS App Store ready
- ✅ Google Play ready
- ✅ Web static export & preview
- ✅ OTA updates
- ✅ CI/CD examples

**DX**: `yarn ship:ios`, `yarn ship:android`, `yarn web:build`, `yarn web:preview`.

### 📚 Documentation
- ✅ README with quick start
- ✅ SUPABASE.md - Auth & database
- ✅ MONETIZATION.md - Payments
- ✅ ANALYTICS.md - Tracking & errors
- ✅ NOTIFICATIONS.md - Push notifications
- ✅ DEPLOYMENT.md - Ship to stores
- ✅ TROUBLESHOOTING.md - Common issues
- ✅ BACKEND.md - Database schemas
- ✅ CLI_GENERATORS.md - Code generation
- ✅ DESIGN_SYSTEM.md - UI patterns
- ✅ vibe/ folder - AI context

**DX**: Every feature is documented with examples. AI assistants read these to write perfect code.

---

## Tech Stack

### Core
- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform
- **TypeScript** - Type safety
- **Unistyles** - Supercharged StyleSheet for React Native

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state & caching
- **MMKV** - Fast persistent storage

### Backend & Services
- **Supabase** - Authentication & database
- **RevenueCat** - In-app purchases (mobile + web billing)
- **PostHog** - Analytics & feature flags
- **Sentry** - Error tracking
- **Firebase** - Push notifications (FCM)

### Navigation & UI
- **React Navigation** - Native navigation
- **Expo Router** - File-based routing
- **React Hook Form + Zod** - Form validation
- **React Native Reanimated** - Smooth animations

### Development
- **Turborepo** - Monorepo build system
- **Jest** - Unit testing
- **Maestro** - E2E testing
- **EAS Build** - Cloud builds

---

## Developer Experience Journey

### Day 1: Setup (5 minutes)

```bash
# Clone and setup
git clone https://github.com/shipnativeapp/shipnative.git
cd shipnative
yarn install
yarn setup  # Interactive setup wizard

# Interactive setup walks you through:
# - App name and bundle ID
# - Supabase credentials
# - RevenueCat API keys
# - PostHog analytics
# - Sentry error tracking
# - Firebase (push notifications)

# Or skip everything - mock mode works without any keys!

cd my-app
yarn ios
```

**Result**: App running on simulator with working auth, payments, and analytics (all in mock mode).

### Day 1-2: Customize UI

```bash
# Generate your first screen
yarn generate screen Dashboard

# Generate components
yarn generate component StatsCard
yarn generate component ActivityFeed

# Check component showcase
# Press Cmd+D → Component Showcase
# See all 14+ components with examples
```

**Result**: Custom screens and components following the design system.

### Day 2-3: Add Database

```bash
# Copy schema from BACKEND.md
# Create migration
supabase migration new add_user_data

# Add your tables (profiles, settings, uploads, etc.)
# All include RLS policies and triggers

# Push to Supabase
supabase db push
```

**Result**: Production-ready database with security policies.

### Day 3-4: Build Features

```bash
# Generate API endpoints
yarn generate api user-profile
yarn generate api user-posts

# Generate stores
yarn generate store posts
yarn generate store comments

# Use AI to build features
# "I am ready to vibe. Read .cursorrules and vibe/ folder.
#  Add a posts feed with infinite scroll and pull-to-refresh."
```

**Result**: AI writes perfect code using your patterns and schemas.

### Day 5: Test & Polish

```bash
# Run tests
yarn test

# Test on real device
yarn app:ios --device

# Test payments in sandbox
# Test push notifications
# Test deep linking
```

**Result**: Fully tested app ready for beta.

### Day 6-7: Deploy

```bash
# Build for iOS
yarn ship:ios

# Build for Android
yarn ship:android

# Build/preview for Web
yarn web:build
yarn web:preview

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Result**: App live in App Store, Play Store, and ready-to-host static web build.

### Ongoing: Iterate Fast

```bash
# Add new feature
yarn generate screen NewFeature

# Ask AI to implement
# "Add real-time chat to NewFeature screen"

# Test in mock mode
# Deploy OTA update
eas update --branch production

# Users get update instantly!
```

**Result**: Ship features in hours, not days.

---

## What Makes ShipNative Different?

### vs. Starting from Scratch
- ⏱ **Save 2-3 months** of boilerplate setup
- 🔒 **Security built-in** (RLS, auth, validation)
- 🎨 **Beautiful design** from day one
- 🌐 **Mobile + Web ready** without extra work

### vs. Other Boilerplates
- 🤖 **AI-optimized** - Built for Cursor/Claude
- 🧪 **Mock mode** - Develop without API keys
- 🔄 **Universal patterns** - Not app-specific
- 📚 **Complete docs** - Every feature explained
- ⚡️ **CLI generators** - 10x faster development

### vs. Expo Templates
- 💰 **Monetization ready** - RevenueCat for mobile + web billing
- 📊 **Analytics ready** - PostHog + Sentry
- 🔔 **Notifications ready** - FCM/APNs configured
- 🗄 **Backend ready** - Supabase with schemas
- 🚀 **Production ready** - Not just a starter

---

## Pricing

### Free (Open Source)
- ✅ Full source code
- ✅ All features
- ✅ Unlimited apps
- ✅ Community support
- ✅ MIT License

### Pro (Coming Soon)
- ✅ Everything in Free
- ✅ Premium templates
- ✅ Video course
- ✅ Priority support
- ✅ Advanced examples
- 💰 $199 one-time

### Enterprise (Coming Soon)
- ✅ Everything in Pro
- ✅ Custom setup
- ✅ White-label
- ✅ Team license
- ✅ Dedicated support
- 💰 $999 one-time

---

## Social Proof

### Built For
- 🚀 Indie hackers shipping fast
- 👨‍💻 Agencies building client apps
- 🏢 Startups validating ideas
- 🎓 Developers learning React Native

### Perfect For
- SaaS mobile apps
- Consumer apps with subscriptions
- Social apps with real-time features
- E-commerce mobile apps
- Productivity apps
- Fitness & health apps

---

## FAQ

**Q: Do I need API keys to start?**
A: No! Mock mode lets you develop without any credentials. Add keys when you're ready for production.

**Q: Can I use this for client projects?**
A: Yes! MIT license means you can use it for unlimited commercial projects.

**Q: Does it work with Expo Go?**
A: Development builds work best. Use `expo prebuild` for full native features.

**Q: How do I customize the design?**
A: Edit `designTokens.ts` to change colors, spacing, and typography. All components update automatically.

**Q: Is this production-ready?**
A: Yes! Includes security (RLS), error tracking (Sentry), analytics (PostHog), and deployment configs.

**Q: Can I add my own features?**
A: Absolutely! Use CLI generators and AI to add features following the established patterns.

**Q: What if I get stuck?**
A: Check TROUBLESHOOTING.md, ask AI (it knows the codebase), or join our Discord community.

---

## Get Started

```bash
git clone https://github.com/shipnativeapp/shipnative.git
cd shipnative
yarn install
yarn setup
cd apps/app
yarn ios
```

**Start shipping today.** 🚀

---

## Links

- **GitHub**: github.com/shipnativeapp/shipnative
- **Documentation**: shipnative.app/docs
- **Discord**: discord.gg/shipnative
- **Twitter**: @shipnative
- **Email**: hello@shipnative.app

---

## Testimonials (Placeholder)

> "Saved me 3 months of setup. Shipped my app in 2 weeks."
> — Indie Hacker

> "The AI-first approach is genius. Cursor writes perfect code every time."
> — Agency Developer

> "Best React Native boilerplate I've used. Everything just works."
> — Startup Founder

---

## Call to Action

### Primary CTA
**Ready to ship your app?**

```bash
git clone https://github.com/shipnativeapp/shipnative.git
cd shipnative && yarn install && yarn setup
```

### Secondary CTA
- View Live Demo
- Read Documentation
- Join Discord Community
- Watch Video Tutorial

---

## Feature Comparison Table

| Feature | ShipNative | Expo Template | From Scratch |
|---------|-----------|---------------|--------------|
| Authentication | ✅ Supabase | ❌ | ⏱ 2 weeks |
| Payments | ✅ RevenueCat (mobile + web billing) | ❌ | ⏱ 3 weeks |
| Analytics | ✅ PostHog | ❌ | ⏱ 1 week |
| Push Notifications | ✅ FCM/APNs | ❌ | ⏱ 2 weeks |
| Deep Linking | ✅ Configured | ❌ | ⏱ 1 week |
| Database Schemas | ✅ Production-ready | ❌ | ⏱ 2 weeks |
| Mock Mode | ✅ All services | ❌ | ❌ |
| AI-Optimized | ✅ vibe/ folder | ❌ | ❌ |
| CLI Generators | ✅ 4 generators | ❌ | ❌ |
| Design System | ✅ Modern | ❌ | ⏱ 2 weeks |
| Dark Mode | ✅ Built-in | ❌ | ⏱ 1 week |
| Documentation | ✅ 11 guides | ⚠️ Basic | ❌ |
| **Time to Production** | **1 week** | **8 weeks** | **12+ weeks** |

---

**ShipNative: The fastest way from idea to App Store.** 🚀
