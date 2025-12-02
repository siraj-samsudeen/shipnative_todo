# Welcome to ShipNative.app!

> The ultimate React Native boilerplate for building production-ready mobile apps fast

ShipNative.app is a comprehensive React Native starter kit that includes authentication, payments, analytics, and everything you need to ship your mobile app quickly.

**Built with Expo and modern React Native tools. Based on Ignite boilerplate foundation.**

## Features

- 🔐 **Authentication**: Supabase Auth with email, Google, Apple sign-in
- 💰 **Payments**: RevenueCat for iOS & Android subscriptions
- 📊 **Analytics**: PostHog for events, screens, and feature flags
- 🎨 **Beautiful UI**: Unistyles 3.0 for theme-aware styling
- 🌙 **Dark Mode**: Built-in dark mode support
- 📱 **Push Notifications**: Expo Notifications ready
- 🔄 **State Management**: Zustand + React Query
- 🧪 **Type-Safe**: TypeScript with strict mode

## Security Defaults

- Supabase sessions stay in the device keychain/secure storage only; in-app persistence keeps onboarding status but never stores access tokens.
- API calls require HTTPS in production; local HTTP is allowed for development only.
- Public environment variables are namespaced with `EXPO_PUBLIC_`; keep private keys out of the client bundle.

## Getting Started

```bash
yarn
yarn start
```

To build for your device or simulator:

```bash
yarn build:ios:sim     # iOS simulator
yarn build:ios:device  # iOS device
yarn build:android     # Android device
```

### `./assets` directory

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```tree
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

ShipNative comes with a built-in `Icon` component for easy icon usage throughout your app.

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

ShipNative includes the `AutoImage` component for automatic image sizing and optimization.

How to use your `icon` or `image` assets:

```typescript
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('assets/images/my_image.png')} />
  );
};
```

## Running Maestro end-to-end tests

Follow the Maestro setup instructions in the documentation.

## Documentation

- [Setup Guide](../../SETUP.md) - Initial setup and configuration
- [Supabase Guide](../../docs/SUPABASE.md) - Authentication and database
- [Monetization Guide](../../docs/MONETIZATION.md) - RevenueCat payments
- [Analytics Guide](../../docs/ANALYTICS.md) - PostHog integration
- [Deployment Guide](../../docs/DEPLOYMENT.md) - Publishing to App Store and Google Play

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Styling**: Unistyles 3.0
- **Navigation**: Expo Router
- **State**: Zustand + React Query
- **Auth**: Supabase
- **Payments**: RevenueCat
- **Analytics**: PostHog
- **Errors**: Sentry

## License

This is a commercial product. See [LICENSE.md](../../LICENSE.md) for details.

**Attribution**: This boilerplate is built on top of the Ignite boilerplate by Infinite Red as a foundation, with significant customizations and additions.
