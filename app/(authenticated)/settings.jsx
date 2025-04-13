import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { ChevronRight, Bell, Moon, Sun, Volume2, Thermometer, Lock, Battery as BatteryIcon, Download, Settings as SettingsIcon, Info, BellRing, Zap, Database, LogOut, Clock, ChevronDown, Brain, Activity } from 'lucide-react-native';
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

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Customize your sleep experience</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Sleep Tracking</Text>
            <Text style={styles.cardSubtitle}>Configure your sleep detection</Text>
          </View>
          <View style={styles.cardIconContainer}>
            <Moon size={24} color="#3B82F6" />
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Brain size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={styles.settingItemTitle}>Sleep Detection</Text>
              <Text style={styles.settingItemDescription}>Automatically detect when you're sleeping</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleSetting('sleepDetection')}
            style={[
              styles.toggleContainer,
              { backgroundColor: settings.sleepDetection ? 'rgba(59, 130, 246, 0.3)' : '#1E293B' }
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: settings.sleepDetection ? '#3B82F6' : '#64748B',
                  borderColor: settings.sleepDetection ? '#3B82F6' : '#334155',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSubtitle}>Manage your sleep reminders</Text>
          </View>
          <View style={styles.cardIconContainer}>
            <Bell size={24} color="#3B82F6" />
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Moon size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={styles.settingItemTitle}>Sleep Reminders</Text>
              <Text style={styles.settingItemDescription}>Get notified when it's time to sleep</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleSetting('sleepReminders')}
            style={[
              styles.toggleContainer,
              { backgroundColor: settings.sleepReminders ? 'rgba(59, 130, 246, 0.3)' : '#1E293B' }
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: settings.sleepReminders ? '#3B82F6' : '#64748B',
                  borderColor: settings.sleepReminders ? '#3B82F6' : '#334155',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Sun size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={styles.settingItemTitle}>Wake Up Reminders</Text>
              <Text style={styles.settingItemDescription}>Get notified when it's time to wake up</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleSetting('wakeUpReminders')}
            style={[
              styles.toggleContainer,
              { backgroundColor: settings.wakeUpReminders ? 'rgba(59, 130, 246, 0.3)' : '#1E293B' }
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  backgroundColor: settings.wakeUpReminders ? '#3B82F6' : '#64748B',
                  borderColor: settings.wakeUpReminders ? '#3B82F6' : '#334155',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.cardSubtitle}>Manage your account settings</Text>
          </View>
          <View style={styles.cardIconContainer}>
            <SettingsIcon size={24} color="#3B82F6" />
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingItemTitle, { color: '#EF4444' }]}>Logout</Text>
              <Text style={styles.settingItemDescription}>Sign out of your account</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    paddingBottom: 64,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
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
    width: 180,
    height: 180,
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
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
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
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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