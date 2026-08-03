import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import Constants from 'expo-constants';

const TOKEN_KEY = 'jaidi-fcm-token';

// Show notifications while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission and return Expo push token (or null).
 * Works with Expo Go (limited) and production builds (full FCM via EAS).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Jaidi] Push notifications require a physical device');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Jaidi] Notification permission not granted');
    return null;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Jaidi Pan Shop',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8372A',
    });
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData.data;

    await AsyncStorage.setItem(TOKEN_KEY, token);
    await saveTokenToFirestore(token);

    console.log('[Jaidi] Push token registered:', token.slice(0, 20) + '…');
    return token;
  } catch (err) {
    console.warn('[Jaidi] Failed to get push token', err);
    return null;
  }
}

/**
 * Save device token to Firestore so Admin / Cloud Function can target it.
 */
async function saveTokenToFirestore(token: string, phone?: string) {
  if (!isFirebaseConfigured || !db) {
    // DEMO: keep local only
    await AsyncStorage.setItem(
      'jaidi-device-tokens',
      JSON.stringify([
        {
          token,
          phone: phone || null,
          platform: Platform.OS,
          updatedAt: new Date().toISOString(),
        },
      ])
    );
    return;
  }

  try {
    // Use token as doc id (sanitized) so the same device updates in place
    const safeId = token.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
    await setDoc(
      doc(db, 'deviceTokens', safeId),
      {
        fcmToken: token,
        phone: phone || null,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Jaidi] Could not save token to Firestore', err);
  }
}

/**
 * Optionally link the current device token to a phone number
 * (e.g. after loyalty login).
 */
export async function linkTokenToPhone(phone: string) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    await saveTokenToFirestore(token, phone);
  }
}

/**
 * Attach listeners for foreground notifications and taps.
 * Returns a cleanup function.
 */
export function setupNotificationListeners(
  onReceive?: (n: Notifications.Notification) => void,
  onRespond?: (r: Notifications.NotificationResponse) => void
) {
  const sub1 = Notifications.addNotificationReceivedListener((notification) => {
    onReceive?.(notification);
  });

  const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
    onRespond?.(response);
  });

  return () => {
    sub1.remove();
    sub2.remove();
  };
}
