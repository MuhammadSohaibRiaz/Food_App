import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store';
import Navigation from './navigation';
import { ThemeProvider } from './ThemeContext';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/notificationHandler';
import { supabase } from './supabase';
import { View, ActivityIndicator } from 'react-native';
import { themeColors } from './theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const responseListener = useRef(null);

  useEffect(() => {
    registerForPushNotificationsAsync().catch(error => console.log('Failed to get push token', error));

    responseListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Error checking session:', error);
      setSession(data.session);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={themeColors.bgColor(1)} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <Navigation session={session} />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

