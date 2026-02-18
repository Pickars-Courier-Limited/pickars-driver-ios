import React, { useCallback, useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import PushNotificationIOS, { PushNotification } from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import PagesNavigator from './src/PagesNavigator';
import { LocationProvider } from './src/Context/LocationContext';
import { TokenProvider } from './src/Context/TokenProvider';
import { SocketProvider } from './src/Context/useSocket';
import { ToastProvider } from './src/Context/useToast';
import store, { AppDispatch } from './src/Redux/Store';
import { ServerStatusProvider } from './src/Context/useServerStatus';
import { navigate } from './src/Navigation/navigationRef';
import { BaseUrl } from './src/Redux/baseurl';
import { InternetProvider } from './src/Context/InternetContext';
import { getUserProfile } from './src/Redux/User/userSlice';

// Key for AsyncStorage to prevent duplicate push notification registrations
const NORMAL_PUSH_TOKEN_KEY = 'normalPushTokenRegistered';

const AppContent = () => {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  /** ✅ Handle push notification click → Navigate */
  useEffect(() => {
    const onNotification = (notification: PushNotification) => {
      console.log('📩 Notification Received:', notification);

      const data = notification.getData();
      if (data?.screen) {
        navigate(data.screen, data.params || {});
      }

      notification.finish(PushNotificationIOS.FetchResult.NoData);
    };

    PushNotificationIOS.addEventListener('notification', onNotification);
    return () => PushNotificationIOS.removeEventListener('notification', onNotification);
  }, []);

  /** ✅ Fetch userId from getUserProfile API */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await dispatch(getUserProfile()).unwrap();
        console.log('✅ User Profile:', response);

        if (response?._id) {
          setUserId(response._id);
        } else {
          console.warn('⚠️ No userId found in profile response');
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [dispatch]);


  const registerDeviceToken = useCallback(async () => {
    if (!userId || !deviceToken) return;

    try {
      // Check if the token has already been registered
      const isRegistered = await AsyncStorage.getItem(NORMAL_PUSH_TOKEN_KEY);
      if (isRegistered) {
        console.log('✅ Device token already registered. Skipping API call.');
        return;
      }

      await axios.post(`${BaseUrl}/api/v1/notification/push-notifications/driver-register-device-token`, {
        userId,
        deviceToken,
        platform: 'iOS',
      });
      console.log('✅ Device token registered successfully');
      // Store a flag in AsyncStorage to indicate successful registration
      await AsyncStorage.setItem(NORMAL_PUSH_TOKEN_KEY, 'true');
    } catch (error: any) {
      console.error('❌ Error registering device token:', error.response?.data || error.message);
    }
  }, [userId, deviceToken]);


  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    PushNotificationIOS.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
    });

    const onRegister = (token: string) => {
      console.log('✅ iOS Device Token:', token);
      setDeviceToken(token);
    };

    PushNotificationIOS.addEventListener('register', onRegister);
    return () => PushNotificationIOS.removeEventListener('register', onRegister);
  }, []);

  /** ✅ Register device token when both userId and deviceToken are ready */
  useEffect(() => {
    if (userId && deviceToken) {
      registerDeviceToken();
    }
  }, [userId, deviceToken, registerDeviceToken]);

  if (Platform.OS !== 'ios') return null;

  return (
    <SocketProvider>
      <LocationProvider>
        <TokenProvider>
          <ToastProvider>
            <InternetProvider>
              <ServerStatusProvider>
                <PagesNavigator />
              </ServerStatusProvider>
            </InternetProvider>
          </ToastProvider>
        </TokenProvider>
      </LocationProvider>
    </SocketProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
