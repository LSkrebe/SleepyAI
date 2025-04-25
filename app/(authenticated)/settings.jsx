import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { ChevronRight, Bell, Moon, Sun, Volume2, Thermometer, Lock, Battery as BatteryIcon, Download, Settings as SettingsIcon, Info, BellRing, Zap, Database, Clock, ChevronDown, Brain, Activity } from 'lucide-react-native';
import { useDevice } from '../../context/DeviceContext';
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
  const [showSleepDetectionConfirm, setShowSleepDetectionConfirm] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const { deviceId } = useDevice();

  useEffect(() => {
    loadSettings();
    
    // Set up listener for sleep detection updates from the service
    const handleSleepDetectionUpdate = ({ enabled }) => {
      setSettings(prev => ({
        ...prev,
        sleepDetection: enabled,
      }));
    };
    
    sleepTrackingService.onSleepDetectionUpdate(handleSleepDetectionUpdate);
    
    return () => {
      sleepTrackingService.offSleepDetectionUpdate(handleSleepDetectionUpdate);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(`userSettings_${deviceId}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Sync sleep detection setting with the service
        sleepTrackingService.setSleepDetectionEnabled(parsedSettings.sleepDetection);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(`userSettings_${deviceId}`, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleSetting = (key) => {
    if (key === 'sleepDetection' && settings.sleepDetection) {
      // Show confirmation modal when turning off sleep detection
      setShowSleepDetectionConfirm(true);
    } else {
      // For all other cases, toggle directly
      setSettings(prev => {
        const newSettings = {
          ...prev,
          [key]: !prev[key],
        };
        
        // Update sleep tracking service if sleep detection is toggled
        if (key === 'sleepDetection') {
          sleepTrackingService.setSleepDetectionEnabled(newSettings.sleepDetection);
        }
        
        return newSettings;
      });
    }
  };

  const confirmDisableSleepDetection = () => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        sleepDetection: false,
      };
      
      // Update sleep tracking service
      sleepTrackingService.setSleepDetectionEnabled(false);
      
      return newSettings;
    });
    setShowSleepDetectionConfirm(false);
  };

  const cancelDisableSleepDetection = () => {
    setShowSleepDetectionConfirm(false);
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
        
        <View style={[
          styles.settingItem,
          !settings.sleepDetection && styles.settingItemDisabled
        ]}>
          <View style={styles.settingItemLeft}>
            <View style={[
              styles.iconContainer,
              !settings.sleepDetection && styles.iconContainerDisabled
            ]}>
              <Brain size={20} color={settings.sleepDetection ? "#3B82F6" : "#64748B"} />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[
                styles.settingItemTitle,
                !settings.sleepDetection && styles.settingItemTitleDisabled
              ]}>Sleep Detection</Text>
              <Text style={[
                styles.settingItemDescription,
                !settings.sleepDetection && styles.settingItemDescriptionDisabled
              ]}>Automatically detect when you're sleeping</Text>
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
                  transform: [{ translateX: settings.sleepDetection ? 20 : 0 }],
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
        
        <View style={[
          styles.settingItem,
          !settings.sleepReminders && styles.settingItemDisabled
        ]}>
          <View style={styles.settingItemLeft}>
            <View style={[
              styles.iconContainer,
              !settings.sleepReminders && styles.iconContainerDisabled
            ]}>
              <Moon size={20} color={settings.sleepReminders ? "#3B82F6" : "#64748B"} />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[
                styles.settingItemTitle,
                !settings.sleepReminders && styles.settingItemTitleDisabled
              ]}>Sleep Reminders</Text>
              <Text style={[
                styles.settingItemDescription,
                !settings.sleepReminders && styles.settingItemDescriptionDisabled
              ]}>Get notified when it's time to sleep</Text>
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
                  transform: [{ translateX: settings.sleepReminders ? 20 : 0 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={[
          styles.settingItem,
          !settings.wakeUpReminders && styles.settingItemDisabled
        ]}>
          <View style={styles.settingItemLeft}>
            <View style={[
              styles.iconContainer,
              !settings.wakeUpReminders && styles.iconContainerDisabled
            ]}>
              <Sun size={20} color={settings.wakeUpReminders ? "#3B82F6" : "#64748B"} />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={[
                styles.settingItemTitle,
                !settings.wakeUpReminders && styles.settingItemTitleDisabled
              ]}>Wake-up Reminders</Text>
              <Text style={[
                styles.settingItemDescription,
                !settings.wakeUpReminders && styles.settingItemDescriptionDisabled
              ]}>Get notified when it's time to wake up</Text>
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
                  transform: [{ translateX: settings.wakeUpReminders ? 20 : 0 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.cardTitle}>Subscription</Text>
            <Text style={styles.cardSubtitle}>Manage your premium features</Text>
          </View>
          <View style={styles.cardIconContainer}>
            <Lock size={24} color="#3B82F6" />
          </View>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Zap size={20} color="#3B82F6" />
            </View>
            <View style={styles.settingItemContent}>
              <Text style={styles.settingItemTitle}>Premium Status</Text>
              <Text style={styles.settingItemDescription}>Review your subscription details</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.subscriptionButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <Text style={styles.subscriptionButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>

{/* Manage Subscription Modal */}
      <Modal
        visible={showSubscriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
          <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Lock size={24} color="#3B82F6" />
          </View>
          <Text style={styles.modalTitle}>Manage Subscription</Text>
          </View>

          <Text style={styles.modalText}>
          Here you can manage your premium subscription. You can view your current plan, billing details, and cancel your subscription if needed.
          </Text>

          {/* Add more content for your subscription management options here */}
          {/* For example, buttons to view plan, billing, or cancel */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowSubscriptionModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                //onPress={confirmDisableSleepDetection}
              >
                <Text style={styles.confirmButtonText}>End Subscription</Text>
              </TouchableOpacity>
          </View>
        </View>
        </View>
      </Modal>
      

      {/* Sleep Detection Confirmation Modal */}
      <Modal
        visible={showSleepDetectionConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDisableSleepDetection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Moon size={24} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Disable Sleep Detection?</Text>
            </View>
            
            <Text style={styles.modalText}>
              Disabling sleep detection will stop all sleep tracking. No new sleep data will be recorded, and your charts and statistics will not update.
            </Text>
            
            <Text style={[styles.modalText, styles.modalWarning]}>
              This feature is essential for the app's core functionality.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelDisableSleepDetection}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmDisableSleepDetection}
              >
                <Text style={styles.confirmButtonText}>Disable</Text>
              </TouchableOpacity>
            </View>
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
  settingItemDisabled: {
    opacity: 0.7,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
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
  iconContainerDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
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
  settingItemTitleDisabled: {
    color: '#94A3B8',
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  settingItemDescriptionDisabled: {
    color: '#64748B',
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
    transform: [{ translateX: 0 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalWarning: {
    color: '#EF4444',
    fontWeight: '600',  
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  subscriptionButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
}); 