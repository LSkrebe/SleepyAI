import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDevice } from '../context/DeviceContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { deviceId } = useDevice();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!deviceId) return;

        const onboardingCompleted = await AsyncStorage.getItem(`onboarding_completed_${deviceId}`);
        setInitialRoute(onboardingCompleted ? '/(authenticated)' : '/(onboarding)');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [deviceId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  if (initialRoute) {
    return <Redirect href={initialRoute} />;
  }

  return null;
} 