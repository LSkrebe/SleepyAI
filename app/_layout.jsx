import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import Constants from 'expo-constants';

export default function RootLayout() {
  // Access environment variables through Constants.expoConfig.extra
  const groqKey = Constants.expoConfig.extra.EXPO_PUBLIC_GROQ_API_KEY;

  if (!groqKey) {
    console.warn('Missing required environment variables');
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </>
  );
} 