import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DeviceProvider, useDevice } from '../context/DeviceContext';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { deviceId } = useDevice();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(`onboarding_completed_${deviceId}`);
        const inOnboardingGroup = segments[0] === '(onboarding)';
        
        if (onboardingCompleted === 'true' && inOnboardingGroup) {
          // If onboarding is completed but user is in onboarding group, redirect to authenticated
          router.replace('/(authenticated)');
        } else if (onboardingCompleted !== 'true' && !inOnboardingGroup) {
          // If onboarding is not completed and user is not in onboarding group, redirect to onboarding
          router.replace('/(onboarding)');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    if (deviceId) {
      checkOnboarding();
    }
  }, [deviceId, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const groqKey = Constants.expoConfig.extra.EXPO_PUBLIC_GROQ_API_KEY;

  if (!groqKey) {
    console.warn('Missing required environment variables');
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <DeviceProvider>
        <RootLayoutNav />
      </DeviceProvider>
    </>
  );
} 