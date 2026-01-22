# Product Overview

Shipnative is a production-ready React Native starter kit for building cross-platform mobile applications (iOS, Android, Web) with Expo.

## Core Features

- **Authentication**: Email, Google, Apple sign-in via Supabase or Convex
- **Payments**: RevenueCat integration for iOS/Android subscriptions
- **Analytics**: PostHog for event tracking and feature flags
- **UI/UX**: Theme-aware styling with dark mode support
- **Push Notifications**: Expo Notifications ready
- **Internationalization**: Multi-language support via i18n

## Target Platforms

- iOS (native + simulator)
- Android (native + emulator)
- Web (via Expo Web)
- Marketing site (separate Vite/React app)

## Backend Options

Choose one during setup:
- **Supabase**: PostgreSQL with RLS, OAuth, magic links
- **Convex**: TypeScript-first reactive database with built-in auth

## Security Principles

- Secure storage for auth tokens (keychain/secure storage only)
- HTTPS required in production
- Public env vars use `EXPO_PUBLIC_` prefix
- No sensitive keys in client bundle
