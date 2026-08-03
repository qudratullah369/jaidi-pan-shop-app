import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { CartProvider } from './src/hooks/useCart';
import { colors } from './src/utils/colors';
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from './src/services/notificationService';

const VALID_SCREENS = new Set(['Home', 'Menu', 'Cart', 'Rewards', 'Contact']);

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    registerForPushNotifications().catch(() => {});

    const cleanup = setupNotificationListeners(undefined, (response) => {
      const data = response.notification.request.content.data as {
        screen?: string;
      };
      const screen = data?.screen;
      if (screen && VALID_SCREENS.has(screen) && navigationRef.current) {
        try {
          navigationRef.current.navigate(screen);
        } catch {
          // ignore invalid navigation state
        }
      }
    });

    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CartProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="light" backgroundColor={colors.red} />
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
