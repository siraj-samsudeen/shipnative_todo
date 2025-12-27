# Push Notifications Guide

Complete guide for implementing and using push notifications in your Shipnative app.

## Overview

This boilerplate includes push notification support via `expo-notifications`, with:
- ✅ Local notifications (scheduled, on-device)
- ✅ Remote notifications (FCM for Android, APNs for iOS)
- ✅ Deep linking from notifications
- ✅ Mock mode for development
- ✅ Permission handling
- ✅ Notification badges and sounds

---

## Quick Start

### Development Mode (Mock Notifications)

Test notifications without setting up push services:

```bash
# Just run the app - mock notifications will work automatically
yarn app:ios
```

Mock mode provides:
- Instant local notifications
- Simulated push notifications
- Deep link testing
- No credentials required

### Production Setup

For real push notifications, you need:
- **iOS**: Apple Push Notification service (APNs) certificate (free with Apple Developer account)
- **Android**: Firebase Cloud Messaging (FCM) server key (free)

---

## Installation

Push notifications are already configured in this boilerplate. If starting fresh:

```bash
cd apps/app
yarn add expo-notifications
expo prebuild --clean
```

---

## Configuration

### iOS Setup (APNs)

1. **Enable Push Notifications in Apple Developer**:
   - Go to Certificates, Identifiers & Profiles
   - Select your App ID
   - Enable "Push Notifications" capability
   - Create APNs certificate (or let EAS handle it)

2. **Update app.json**:
   ```json
   {
     "ios": {
       "infoPlist": {
         "UIBackgroundModes": ["remote-notification"]
       }
     },
     "plugins": [
       [
         "expo-notifications",
         {
           "icon": "./assets/notification-icon.png",
           "color": "#000000",
           "sounds": ["./assets/notification-sound.wav"]
         }
       ]
     ]
   }
   ```

3. **Build with EAS** (handles certificates automatically):
   ```bash
   eas build --platform ios --profile production
   ```

### Android Setup (FCM)

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Add Android app with package name from `app.json`

2. **Download google-services.json**:
   - Place in `apps/app/`
   - EAS Build will use it automatically

3. **Get Server Key**:
   - Firebase Console → Project Settings → Cloud Messaging
   - Copy "Server key"
   - Add to `.env`:
     ```bash
     EXPO_PUBLIC_FCM_SERVER_KEY=your-fcm-server-key
     ```

4. **Update app.json**:
   ```json
   {
     "android": {
       "googleServicesFile": "./google-services.json",
       "permissions": [
         "RECEIVE_BOOT_COMPLETED",
         "VIBRATE"
       ]
     }
   }
   ```

---

## Usage

### Request Permission

```typescript
import { useNotificationStore } from '@/stores/notificationStore'

function MyComponent() {
  const { requestPermission, permissionStatus } = useNotificationStore()
  
  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      console.log('Notifications enabled!')
    } else {
      console.log('User denied permission')
    }
  }
  
  return (
    <View>
      <Text>Permission: {permissionStatus}</Text>
      <Button onPress={handleRequestPermission}>
        Enable Notifications
      </Button>
    </View>
  )
}
```

### Schedule Local Notification

```typescript
import { scheduleNotification } from '@/services/notifications'

// Schedule notification for 1 hour from now
await scheduleNotification({
  title: 'Reminder',
  body: 'Time to check your progress!',
  data: { screen: 'Profile' }, // For deep linking
  trigger: {
    seconds: 3600,
  },
})

// Schedule daily notification
await scheduleNotification({
  title: 'Daily Summary',
  body: 'Your daily stats are ready',
  trigger: {
    hour: 20,
    minute: 0,
    repeats: true,
  },
})
```

### Send Remote Notification

**From your backend** (Node.js example):

```typescript
import { Expo } from 'expo-server-sdk'

const expo = new Expo()

// Get push token from user's device (stored in notificationStore)
const pushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'

const messages = [{
  to: pushToken,
  sound: 'default',
  title: 'New Message',
  body: 'You have a new message from John',
  data: { 
    screen: 'Messages',
    messageId: '123'
  },
}]

const chunks = expo.chunkPushNotifications(messages)
for (const chunk of chunks) {
  const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
  console.log('Sent:', ticketChunk)
}
```

### Handle Notification Tap

```typescript
import { useDeepLinking } from '@/hooks/useDeepLinking'
import { useNotificationStore } from '@/stores/notificationStore'

function App() {
  const { handleNotificationResponse } = useNotificationStore()
  
  useEffect(() => {
    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      
      // Navigate to screen specified in notification
      if (data.screen) {
        router.push(`/${data.screen}`)
      }
    })
  }, [])
  
  return <AppNavigator />
}
```

---

## API Reference

### Notification Store

```typescript
import { useNotificationStore } from '@/stores/notificationStore'

const {
  // State
  permissionStatus,    // 'granted' | 'denied' | 'undetermined'
  isPushEnabled,       // User preference toggle
  pushToken,           // Expo push token
  notifications,       // Array of received notifications
  unreadCount,         // Number of unread notifications
  
  // Actions
  togglePush,          // Toggle notifications on/off
  requestPermission,   // Request notification permission
  registerForPushNotifications, // Get push token
  scheduleNotification, // Schedule local notification
  cancelNotification,  // Cancel scheduled notification
  cancelAllNotifications, // Cancel all notifications
  setBadgeCount,       // Set app badge number
  clearBadge,          // Clear app badge
  markAsRead,          // Mark notification as read
} = useNotificationStore()
```

### Notification Service

```typescript
import {
  requestPermission,
  registerForPushNotifications,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '@/services/notifications'

// Request permission
const { status } = await requestPermission()

// Get push token
const token = await registerForPushNotifications()

// Schedule notification
const notificationId = await scheduleNotification({
  title: 'Hello',
  body: 'World',
  trigger: { seconds: 60 },
})

// Cancel notification
await cancelNotification(notificationId)

// Listen for notifications
addNotificationReceivedListener(notification => {
  console.log('Received:', notification)
})
```

---

## Notification Categories

Define notification categories for actions:

```typescript
import * as Notifications from 'expo-notifications'

// Set notification categories
Notifications.setNotificationCategoryAsync('message', [
  {
    identifier: 'reply',
    buttonTitle: 'Reply',
    options: {
      opensAppToForeground: true,
    },
  },
  {
    identifier: 'mark-as-read',
    buttonTitle: 'Mark as Read',
    options: {
      opensAppToForeground: false,
    },
  },
])

// Send notification with category
await scheduleNotification({
  title: 'New Message',
  body: 'John sent you a message',
  categoryIdentifier: 'message',
  trigger: null, // Immediate
})

// Handle action
Notifications.addNotificationResponseReceivedListener(response => {
  if (response.actionIdentifier === 'reply') {
    // Open reply screen
  } else if (response.actionIdentifier === 'mark-as-read') {
    // Mark as read without opening app
  }
})
```

---

## Deep Linking

Notifications can deep link to specific screens:

```typescript
// Schedule notification with deep link
await scheduleNotification({
  title: 'Subscription Expiring',
  body: 'Your pro subscription expires in 3 days',
  data: {
    screen: 'Paywall',
    autoOpen: true,
  },
  trigger: { seconds: 60 },
})

// Handle in app
Notifications.addNotificationResponseReceivedListener(response => {
  const { screen, ...params } = response.notification.request.content.data
  
  if (screen) {
    router.push({
      pathname: `/${screen}`,
      params,
    })
  }
})
```

---

## Best Practices

### 1. Request Permission at the Right Time

❌ **Don't** request permission on app launch:
```typescript
// BAD: Too aggressive
useEffect(() => {
  requestPermission() // User hasn't seen value yet
}, [])
```

✅ **Do** request when user sees value:
```typescript
// GOOD: After showing benefit
const handleEnableReminders = async () => {
  // Explain benefit first
  Alert.alert(
    'Enable Reminders',
    'Get notified when it\'s time to check your progress',
    [
      { text: 'Not Now', style: 'cancel' },
      { 
        text: 'Enable',
        onPress: async () => {
          await requestPermission()
        }
      }
    ]
  )
}
```

### 2. Don't Spam Users

```typescript
// Set reasonable limits
const MAX_NOTIFICATIONS_PER_DAY = 3

// Check before sending
if (notificationCount < MAX_NOTIFICATIONS_PER_DAY) {
  await scheduleNotification({...})
}
```

### 3. Provide Opt-Out

```typescript
// In settings
<Toggle
  label="Push Notifications"
  value={notificationsEnabled}
  onChange={async (enabled) => {
    if (!enabled) {
      await cancelAllNotifications()
    }
    setNotificationsEnabled(enabled)
  }}
/>
```

### 4. Handle Permission Denial

```typescript
const { status } = await requestPermission()

if (status === 'denied') {
  // Guide user to settings
  Alert.alert(
    'Notifications Disabled',
    'To enable notifications, go to Settings > Notifications',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      }
    ]
  )
}
```

### 5. Test Thoroughly

- Test on both iOS and Android
- Test in background, foreground, and killed states
- Test with different permission states
- Test deep linking from notifications
- Test notification categories and actions

---

## Testing

### Mock Mode Testing

1. Ensure no FCM/APNs credentials configured
2. Run app: `yarn app:ios`
3. Check console for "Mock Notifications: ENABLED"
4. Schedule a test notification:
   ```typescript
   await scheduleNotification({
     title: 'Test',
     body: 'This is a test',
     trigger: { seconds: 5 },
   })
   ```
5. Wait 5 seconds - notification should appear

### Production Testing (iOS)

1. Build with EAS: `eas build --platform ios --profile development:device`
2. Install on physical device (push won't work on simulator)
3. Run app and request permission
4. Send test notification from backend
5. Verify notification appears

### Production Testing (Android)

1. Build with EAS: `eas build --platform android --profile development`
2. Install APK on device or emulator
3. Run app and request permission
4. Send test notification from Firebase Console or backend
5. Verify notification appears

---

## Troubleshooting

### Notifications Not Appearing

**Check permission**:
```typescript
const { status } = await Notifications.getPermissionsAsync()
console.log('Permission:', status)
```

**Check push token**:
```typescript
const token = await Notifications.getExpoPushTokenAsync()
console.log('Push token:', token)
```

**Check notification channel (Android)**:
```typescript
const channel = await Notifications.getNotificationChannelAsync('default')
console.log('Channel:', channel)
```

### Push Token Not Generated

**iOS**: Requires physical device (won't work on simulator)

**Android**: Check `google-services.json` is in project root

**Both**: Ensure permissions granted and app built with push capabilities

### Deep Links Not Working

**Check data payload**:
```typescript
Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Data:', response.notification.request.content.data)
})
```

**Verify router paths** match notification data

---

## Analytics

Track notification events:

```typescript
import { trackEvent } from '@/utils/analytics'

// Permission requested
trackEvent('notification_permission_requested')

// Permission granted/denied
trackEvent('notification_permission_result', {
  granted: status === 'granted'
})

// Notification sent
trackEvent('notification_sent', {
  type: 'local',
  title: notification.title,
})

// Notification opened
trackEvent('notification_opened', {
  screen: data.screen,
})
```

---

## Advanced Usage

### Notification Sounds

Add custom sound to `assets/sounds/notification.wav`:

```typescript
await scheduleNotification({
  title: 'Custom Sound',
  body: 'This notification has a custom sound',
  sound: 'notification.wav',
  trigger: null,
})
```

### Rich Notifications (Images)

```typescript
await scheduleNotification({
  title: 'New Photo',
  body: 'Check out this amazing photo!',
  attachments: [
    {
      url: 'https://example.com/image.jpg',
    },
  ],
  trigger: null,
})
```

### Notification Badges

```typescript
import { setBadgeCount } from '@/services/notifications'

// Set badge
await setBadgeCount(5) // Shows "5" on app icon

// Clear badge
await setBadgeCount(0)
```

---

## Next Steps

- [ ] Configure APNs certificate (iOS)
- [ ] Set up Firebase Cloud Messaging (Android)
- [ ] Implement backend push notification service
- [ ] Design notification permission flow
- [ ] Set up notification tracking in analytics
- [ ] Test on physical devices
- [ ] Create notification scheduling strategy
- [ ] Implement notification preferences in settings

---

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [Push Notification Best Practices](https://documentation.onesignal.com/docs/push-notification-guide)
