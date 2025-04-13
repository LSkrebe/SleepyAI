import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { ChevronRight, Bell, Moon, Sun, Volume2, Thermometer, Lock, Battery as BatteryIcon, Download, Settings as SettingsIcon, Info, BellRing, Zap, Database, LogOut, Clock, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import sleepTrackingService from '../../services/sleepTrackingService';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const DEFAULT_SETTINGS = {
  sleepDetection: true,
  sleepReminders: true,
  wakeUpReminders: true,
};

const CustomToggle = ({ value, onValueChange }) => {
  const toggleAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(toggleAnimation, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [value]);

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  return (
    <TouchableOpacity
      onPress={onValueChange}
      style={[
        styles.toggleContainer,
        { backgroundColor: value ? 'rgba(59, 130, 246, 0.3)' : '#1E293B' }
      ]}
    >
      <Animated.View
        style={[
          styles.toggleThumb,
          {
            transform: [{ translateX }],
            backgroundColor: value ? '#3B82F6' : '#64748B',
            borderColor: value ? '#3B82F6' : '#334155',
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customHours, setCustomHours] = useState('00');
  const [customMinutes, setCustomMinutes] = useState('00');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const { logout, user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: !prev[key],
      };
      return newSettings;
    });
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Customize your sleep experience</Text>
        </View>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
      </View>

      {renderSection('Sleep Tracking', (
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Moon size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={styles.settingItemTitle}>Sleep Detection</Text>
              <Text style={styles.settingItemDescription}>Automatically detect when you're sleeping</Text>
            </View>
          </View>
          <CustomToggle 
            value={settings.sleepDetection} 
            onValueChange={() => toggleSetting('sleepDetection')} 
          />
        </View>
      ))}

      {renderSection('Notifications', (
        <>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Sleep Reminders</Text>
                <Text style={styles.settingItemDescription}>Get notified when it's time to sleep</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.sleepReminders} 
              onValueChange={() => toggleSetting('sleepReminders')} 
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemTitle}>Wake Up Reminders</Text>
                <Text style={styles.settingItemDescription}>Get notified when it's time to wake up</Text>
              </View>
            </View>
            <CustomToggle 
              value={settings.wakeUpReminders} 
              onValueChange={() => toggleSetting('wakeUpReminders')} 
            />
          </View>
        </>
      ))}

      {renderSection('Account', (
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingItemTitle, { color: '#EF4444' }]}>Logout</Text>
              <Text style={styles.settingItemDescription}>Sign out of your account</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#EF4444" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    paddingBottom: 50,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'visible',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },
  titleContainer: {
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  titleDecoration: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  toggleContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
}); 