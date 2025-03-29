import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user } = useAuth();

  // If user is already authenticated, redirect to main app
  if (user) {
    return <Redirect href="/(authenticated)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#0F172A',
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  );
} 