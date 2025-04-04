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

// Get settings storage key based on user ID
const getSettingsStorageKey = (userId) => `@sleepyai_settings_${userId}`;

const DEFAULT_SETTINGS = {
  sleepDetection: true,
  sleepReminders: true,
  wakeUpReminders: true,
  days: DAYS.reduce((acc, day) => ({
    ...acc,
    [day.id]: {
      bedtime: '22:00',
      wakeup: '07:00',
      enabled: true
    }
  }), {})
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
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [expandedDays, setExpandedDays] = useState({});

  const { logout, user } = useAuth();

  // Load settings when component mounts
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // Save settings whenever they change
  useEffect(() => {
    if (user) {
      saveSettings();
    }
  }, [settings, user]);

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const storageKey = getSettingsStorageKey(user.uid);
      const savedSettings = await AsyncStorage.getItem(storageKey);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Validate and merge with default settings
        const validatedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
          days: {
            ...DEFAULT_SETTINGS.days,
            ...(parsedSettings.days || {})
          }
        };
        
        setSettings(validatedSettings);
        
        // Update sleep tracking service with current day's times
        const today = new Date().getDay();
        // Convert Sunday (0) to 6, Monday (1) to 0, etc.
        const adjustedDay = today === 0 ? 6 : today - 1;
        const currentDay = DAYS[adjustedDay];
        const daySettings = validatedSettings.days[currentDay.id];
        
        if (daySettings) {
          console.log(`Loading sleep window for ${currentDay.label} (Day ${today}) - Bed: ${daySettings.bedtime}, Wake: ${daySettings.wakeup}`);
          // Set the enabled state for the current day
          sleepTrackingService.setCurrentDayEnabled(daySettings.enabled);
          
          if (daySettings.enabled) {
            sleepTrackingService.setSleepWindow(daySettings.bedtime, daySettings.wakeup);
            
            // Start tracking if sleep detection was enabled and current time is within window
            if (validatedSettings.sleepDetection) {
              const now = new Date();
              const currentTime = now.getHours() * 60 + now.getMinutes();
              const [bedHours, bedMinutes] = daySettings.bedtime.split(':').map(Number);
              const [wakeHours, wakeMinutes] = daySettings.wakeup.split(':').map(Number);
              
              const bedTimeInMinutes = bedHours * 60 + bedMinutes;
              const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

              const isWithinWindow = bedTimeInMinutes > wakeTimeInMinutes
                ? currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes
                : currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;

              if (isWithinWindow) {
                sleepTrackingService.startTracking();
              } else {
                sleepTrackingService.stopTracking();
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // If there's an error, use default settings
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = async () => {
    try {
      const storageKey = getSettingsStorageKey(user.uid);
      await AsyncStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    // Set up battery monitoring
    const setupBatteryMonitoring = async () => {
      // Get initial battery state
      const batteryState = await Battery.getBatteryStateAsync();
      sleepTrackingService.setPhoneCharging(batteryState === Battery.BatteryState.CHARGING);

      // Subscribe to battery state changes
      const subscription = Battery.addBatteryStateListener(({ batteryState }) => {
        sleepTrackingService.setPhoneCharging(batteryState === Battery.BatteryState.CHARGING);
      });

      return () => {
        subscription.remove();
      };
    };

    setupBatteryMonitoring();
  }, []);

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

      if (key === 'sleepDetection') {
        console.log(`Sleep detection ${newSettings.sleepDetection ? 'enabled' : 'disabled'}`);
        if (newSettings.sleepDetection) {
          // Check if we should start tracking based on current time and settings
          const today = new Date().getDay();
          const adjustedDay = today === 0 ? 6 : today - 1;
          const currentDay = DAYS[adjustedDay];
          const daySettings = newSettings.days[currentDay.id];
          
          if (daySettings.enabled) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [bedHours, bedMinutes] = daySettings.bedtime.split(':').map(Number);
            const [wakeHours, wakeMinutes] = daySettings.wakeup.split(':').map(Number);
            
            const bedTimeInMinutes = bedHours * 60 + bedMinutes;
            const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

            const isWithinWindow = bedTimeInMinutes > wakeTimeInMinutes
              ? currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes
              : currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;

            if (isWithinWindow) {
              sleepTrackingService.startTracking();
            } else {
              sleepTrackingService.stopTracking();
            }
          }
        } else {
          sleepTrackingService.stopTracking();
        }
      }

      return newSettings;
    });
  };

  const toggleDayExpanded = (dayId) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const toggleDayEnabled = (dayId) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        days: {
          ...prev.days,
          [dayId]: {
            ...prev.days[dayId],
            enabled: !prev.days[dayId].enabled
          }
        }
      };

      // If this is the current day, update the sleep tracking service immediately
      const today = new Date().getDay();
      const adjustedDay = today === 0 ? 6 : today - 1;
      const currentDay = DAYS[adjustedDay];
      
      if (dayId === currentDay.id) {
        const daySettings = newSettings.days[dayId];
        console.log(`Tracking ${daySettings.enabled ? 'enabled' : 'disabled'} for ${currentDay.label}`);
        sleepTrackingService.setCurrentDayEnabled(daySettings.enabled);
        
        // Check if we should start/stop tracking based on current time and settings
        if (daySettings.enabled && newSettings.sleepDetection) {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [bedHours, bedMinutes] = daySettings.bedtime.split(':').map(Number);
          const [wakeHours, wakeMinutes] = daySettings.wakeup.split(':').map(Number);
          
          const bedTimeInMinutes = bedHours * 60 + bedMinutes;
          const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

          const isWithinWindow = bedTimeInMinutes > wakeTimeInMinutes
            ? currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes
            : currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;

          if (isWithinWindow) {
            sleepTrackingService.startTracking();
          } else {
            sleepTrackingService.stopTracking();
          }
        } else {
          sleepTrackingService.stopTracking();
        }
      }

      return newSettings;
    });
  };

  const openTimePicker = (dayId, setting) => {
    const time = settings.days[dayId][setting];
    const [hours, minutes] = time.split(':');
    setCustomHours(hours);
    setCustomMinutes(minutes);
    setSelectedDay(dayId);
    setSelectedSetting(setting);
    setShowTimePicker(true);
  };

  const handleTimeSubmit = () => {
    const hours = parseInt(customHours);
    const minutes = parseInt(customMinutes);
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setSettings(prev => {
        const newSettings = {
          ...prev,
          days: {
            ...prev.days,
            [selectedDay]: {
              ...prev.days[selectedDay],
              [selectedSetting]: formattedTime,
            }
          }
        };

        // Update sleep tracking service with new times if it's the current day
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1;
        const currentDay = DAYS[adjustedDay];
        
        if (selectedDay === currentDay.id) {
          const daySettings = newSettings.days[selectedDay];
          sleepTrackingService.setSleepWindow(daySettings.bedtime, daySettings.wakeup);

          // Check if we should start/stop tracking based on current time and settings
          if (daySettings.enabled && newSettings.sleepDetection) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [bedHours, bedMinutes] = daySettings.bedtime.split(':').map(Number);
            const [wakeHours, wakeMinutes] = daySettings.wakeup.split(':').map(Number);
            
            const bedTimeInMinutes = bedHours * 60 + bedMinutes;
            const wakeTimeInMinutes = wakeHours * 60 + wakeMinutes;

            const isWithinWindow = bedTimeInMinutes > wakeTimeInMinutes
              ? currentTime >= bedTimeInMinutes || currentTime <= wakeTimeInMinutes
              : currentTime >= bedTimeInMinutes && currentTime <= wakeTimeInMinutes;

            if (isWithinWindow) {
              sleepTrackingService.startTracking();
            } else {
              sleepTrackingService.stopTracking();
            }
          }
        }

        return newSettings;
      });
      setShowTimePicker(false);
    }
  };

  const renderDaySettings = (day) => {
    const isExpanded = expandedDays[day.id];
    const daySettings = settings.days[day.id];
    const today = new Date().getDay();
    const isCurrentDay = DAYS[today].id === day.id;

    return (
      <View key={day.id} style={styles.dayContainer}>
        <TouchableOpacity 
          style={styles.dayHeader}
          onPress={() => toggleDayExpanded(day.id)}
        >
          <View style={styles.dayHeaderLeft}>
            <View style={styles.iconContainer}>
              <Clock size={20} color="#3B82F6" />
            </View>
            <View style={styles.dayHeaderContent}>
              <Text style={styles.dayTitle}>{day.label}</Text>
              <Text style={styles.daySubtitle}>
                {daySettings.enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          <View style={styles.dayHeaderRight}>
            <CustomToggle 
              value={daySettings.enabled} 
              onValueChange={() => toggleDayEnabled(day.id)} 
            />
            <ChevronDown 
              size={20} 
              color="#64748B" 
              style={[
                styles.chevronIcon,
                isExpanded && styles.chevronIconExpanded
              ]} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.dayContent}>
            <TouchableOpacity 
              style={styles.timeSetting}
              onPress={() => openTimePicker(day.id, 'bedtime')}
            >
              <View style={styles.timeSettingLeft}>
                <Moon size={20} color="#3B82F6" />
                <Text style={styles.timeSettingLabel}>Bedtime</Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{daySettings.bedtime}</Text>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.timeSetting}
              onPress={() => openTimePicker(day.id, 'wakeup')}
            >
              <View style={styles.timeSettingLeft}>
                <Sun size={20} color="#3B82F6" />
                <Text style={styles.timeSettingLabel}>Wake-up Time</Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{daySettings.wakeup}</Text>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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

      {renderSection('Daily Schedule', (
        DAYS.map(renderDaySettings)
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

      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSetting === 'bedtime' ? 'Set Bedtime' : 'Set Wake-up Time'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputWrapper}>
                <TextInput
                  style={styles.timeInput}
                  value={customHours}
                  onChangeText={setCustomHours}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="#64748B"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSubmitButton}
              onPress={handleTimeSubmit}
            >
              <Text style={styles.modalSubmitButtonText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    fontWeight: '500',
    color: '#E2E8F0',
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: screenWidth - 32,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  modalClose: {
    fontSize: 16,
    color: '#64748B',
  },
  timeInputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: 'center',
    fontSize: 24,
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeSeparator: {
    fontSize: 24,
    color: '#E2E8F0',
    marginHorizontal: 4,
  },
  modalSubmitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dayContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayHeaderContent: {
    marginLeft: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  daySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  dayContent: {
    padding: 16,
    paddingTop: 0,
  },
  timeSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeSettingLabel: {
    fontSize: 16,
    color: '#E2E8F0',
  },
}); 