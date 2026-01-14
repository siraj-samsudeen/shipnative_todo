# Native Widgets

Beautiful, customizable home screen widgets for iOS and Android. Works seamlessly with both Supabase and Convex backends.

## Features

- **6 Stunning Themes**: Aurora, Sunset, Ocean, Forest, Midnight, and Minimal
- **Dual Backend Support**: Automatic detection of Supabase or Convex
- **Two Widget Types**: Quick Stats and Stats Dashboard
- **Modern Design**: Gradient backgrounds, glassmorphism effects, trend indicators
- **Customizable**: Easy theme switching and color customization

## Quick Start

1. Enable widgets in `.env`:
   ```
   EXPO_PUBLIC_ENABLE_WIDGETS=true
   ```

2. Set your App Group (iOS):
   ```
   APP_GROUP_IDENTIFIER=group.com.yourcompany.yourapp
   APPLE_TEAM_ID=XXXXXXXXXX
   ```

3. Rebuild:
   ```bash
   yarn prebuild:clean
   yarn ios  # or yarn android
   ```

4. Add widget to home screen (long-press → tap + → search for your app)

## Structure

```
widgets/
├── ios/
│   ├── WidgetThemes.swift      # Shared theme definitions
│   ├── ExampleWidget.swift     # Quick Stats widget
│   ├── StatsWidget.swift       # Stats Dashboard widget
│   ├── WidgetBundle.swift      # Widget registration
│   └── Module.swift            # Expo module
├── android/
│   ├── src/main/java/package_name/
│   │   ├── ExampleWidget.kt    # Quick Stats widget
│   │   └── StatsWidget.kt      # Stats Dashboard widget
│   └── res/
│       ├── layout/             # Widget XML layouts
│       ├── drawable/           # Background gradients & icons
│       └── xml/                # Widget configurations
├── README.md
└── SECURITY.md
```

## Themes

### iOS (SwiftUI)

Themes are defined in `WidgetThemes.swift`. Each theme provides:

- `gradient`: Background LinearGradient
- `primaryTextColor`: Main text color
- `secondaryTextColor`: Subtitle/caption color
- `accentColor`: Highlights and icons
- `cardBackgroundColor`: Card/container fills

Available themes:
- **Aurora** (default): Deep purple → teal gradient with cyan accents
- **Sunset**: Warm orange → pink with golden highlights
- **Ocean**: Deep blue → cyan for calm, professional look
- **Forest**: Dark green → mint for natural feel
- **Midnight**: Dark mode with electric blue accents
- **Minimal**: Clean white with royal blue accents

### Android (XML)

Theme backgrounds are in `res/drawable/`:
- `widget_background_aurora.xml`
- `widget_background_sunset.xml`
- `widget_background_ocean.xml`
- `widget_background_forest.xml`
- `widget_background_midnight.xml`
- `widget_background_minimal.xml`

## Customization

### Changing the Default Theme

**iOS**: Modify the default value in `ExampleWidget.swift` and `StatsWidget.swift`:
```swift
let themeString = userDefaults.string(forKey: widgetThemeKey) ?? "aurora"
// Change "aurora" to your preferred theme
```

**Android**: Change the `android:background` attribute in layouts:
```xml
android:background="@drawable/widget_background_sunset"
```

### Creating Custom Themes

**iOS**: Add a new case to `WidgetTheme` enum in `WidgetThemes.swift`:
```swift
case myTheme

var gradient: LinearGradient {
    case .myTheme:
        return LinearGradient(
            colors: [
                Color(red: 0.1, green: 0.2, blue: 0.3),
                Color(red: 0.2, green: 0.3, blue: 0.4)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
}
```

**Android**: Create `widget_background_mytheme.xml`:
```xml
<shape android:shape="rectangle">
    <gradient
        android:type="linear"
        android:angle="135"
        android:startColor="#1A3348"
        android:endColor="#334D66" />
    <corners android:radius="24dp" />
</shape>
```

### Customizing Colors

**iOS Text Colors**:
```swift
// In WidgetThemes.swift
var primaryTextColor: Color {
    case .myTheme:
        return Color(red: 0.95, green: 0.95, blue: 0.95)
}
```

**Android Text Colors**: Update `android:textColor` in layout XML files.

## Backend Integration

### Supabase

Widgets fetch from these tables:

**Example Widget** (`widget_entries`):
```sql
create table widget_entries (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  count integer,
  updated_at timestamp default now()
);
```

**Stats Widget** (`user_stats`):
```sql
create table user_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  icon text,
  color text,
  trend text,
  sort_order integer default 0
);
```

### Convex

Widgets use HTTP endpoints:

- `GET /api/widgets/data` - Returns `{ title, subtitle, count }`
- `GET /api/widgets/stats` - Returns `[{ label, value, icon, color, trend }]`

The backend is automatically detected based on which credentials are stored in shared storage.

## Storing Credentials

From your React Native app, sync credentials using the widget store:

```typescript
import { useWidgetStore } from '@/stores/widgetStore';

// When user logs in
const { syncWidgetCredentials } = useWidgetStore();
await syncWidgetCredentials();
```

This stores the appropriate credentials in:
- **iOS**: App Groups (UserDefaults)
- **Android**: SharedPreferences

## Widget Sizes

Both widgets support:
- **Small** (2×2): Compact view with essential info
- **Medium** (4×2): Extended view with more details

## Troubleshooting

**Widget not appearing**:
1. Verify `EXPO_PUBLIC_ENABLE_WIDGETS=true` in `.env`
2. Run `yarn prebuild:clean` to regenerate native code
3. Rebuild the app completely

**Data not loading**:
1. Check backend credentials are synced via widget store
2. Verify RLS policies allow widget access
3. Check network connectivity

**iOS App Group issues**:
1. Verify `APP_GROUP_IDENTIFIER` matches between app and widget
2. Ensure your Apple Team ID is set correctly
3. Check App Groups capability is enabled in Xcode

**Android SharedPreferences**:
1. Verify the preferences name matches: `widget_prefs`
2. Check that credentials are stored with correct keys

## Security

See `SECURITY.md` for:
- Token management best practices
- RLS policy recommendations
- Data validation patterns
- Rate limiting strategies

## Adding New Widgets

### iOS

1. Create new Swift file in `ios/`
2. Define entry struct conforming to `TimelineEntry`
3. Implement `TimelineProvider`
4. Create SwiftUI view
5. Register in `WidgetBundle.swift`

### Android

1. Create new Kotlin file in `src/main/java/package_name/`
2. Extend `AppWidgetProvider`
3. Create layout XML in `res/layout/`
4. Create widget info XML in `res/xml/`
5. Register in `AndroidManifest.xml`
