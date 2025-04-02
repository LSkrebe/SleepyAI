import React from 'react';
import { Tabs } from 'expo-router';
import { Activity, Moon, User, BellRing } from 'lucide-react-native';
import { AlarmProvider } from '../../context/AlarmContext';

export default function AuthenticatedLayout() {
  return (
    <AlarmProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6', // blue-500
          tabBarInactiveTintColor: '#9CA3AF', // gray-400
          tabBarStyle: {
            backgroundColor: '#1E293B',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShown: false, // Hide the header for all tabs
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Moon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alarm"
          options={{
            title: 'Alarm',
            tabBarIcon: ({ color, size }) => <BellRing size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </AlarmProvider>
  );
} 