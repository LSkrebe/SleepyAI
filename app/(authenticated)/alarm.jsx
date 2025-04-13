import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, TextInput } from 'react-native';
import { BellRing, ChevronDown, Clock, Sun, Moon, Sparkles, Zap, Target, Brain, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import sleepTrackingService from '../../services/sleepTrackingService';
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
  }), {}),
  recommendations: {}
};

export default function Alarm() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [recommendations, setRecommendations] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [recommendedBedTime, setRecommendedBedTime] = useState(null);
  const [recommendedWakeTime, setRecommendedWakeTime] = useState(null);
  const [isCurrentDayEnabled, setIsCurrentDayEnabled] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const { user } = useAuth();

  // Load settings when component mounts
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

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
          },
          recommendations: parsedSettings.recommendations || {}
        };
        
        setSettings(validatedSettings);
        // Set recommendations from saved settings
        setRecommendations(validatedSettings.recommendations);
        
        // Get current day's settings
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1;
        const currentDay = DAYS[adjustedDay];
        const daySettings = validatedSettings.days[currentDay.id];
        
        if (daySettings) {
          // Set the enabled state for the current day
          setIsCurrentDayEnabled(daySettings.enabled);
          
          if (daySettings.enabled) {
            setBedTime(daySettings.bedtime);
            setWakeTime(daySettings.wakeup);
          }
        }

        // Check if there are recommendations for the current day
        const currentDayRecommendation = validatedSettings.recommendations[currentDay.id];
        if (currentDayRecommendation) {
          setRecommendedBedTime(currentDayRecommendation.bedtime);
          setRecommendedWakeTime(currentDayRecommendation.wakeup);
          setShowRecommendation(true);
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

  // Save settings whenever they change
  useEffect(() => {
    if (user) {
      saveSettings();
    }
  }, [settings, user]);

  useEffect(() => {
    // Listen for sleep window updates from the service
    const handleSleepWindowUpdate = ({ bedTime, wakeTime, recommendedBedTime, recommendedWakeTime, currentDay }) => {
      // Update current display times
      setBedTime(bedTime);
      setWakeTime(wakeTime);

      // Store recommendations if they differ from current times
      if (recommendedBedTime && recommendedWakeTime) {
        setRecommendedBedTime(recommendedBedTime);
        setRecommendedWakeTime(recommendedWakeTime);
        setShowRecommendation(true);
      }
    };

    // Listen for sleep quality updates
    const handleSleepQualityUpdate = (data) => {
      if (data.recommendation) {
        const { bedtime, waketime } = data.recommendation;
        
        // Get current day's settings
        const today = new Date().getDay();
        const adjustedDay = today === 0 ? 6 : today - 1;
        const currentDay = DAYS[adjustedDay];
        const daySettings = settings.days[currentDay.id];
        
        // Check if recommendations match current times
        if (bedtime === daySettings.bedtime && waketime === daySettings.wakeup) {
          // Clear recommendations for this day
          setRecommendations(prev => {
            const newRecommendations = { ...prev };
            delete newRecommendations[currentDay.id];
            return newRecommendations;
          });
          setShowRecommendation(false);
    } else {
          // Store recommendations if they differ
          setRecommendations(prev => ({
            ...prev,
            [currentDay.id]: {
              bedtime,
              wakeup: waketime
            }
          }));
          
          // Update settings with new recommendations
          setSettings(prev => ({
            ...prev,
            recommendations: {
              ...prev.recommendations,
              [currentDay.id]: {
                bedtime,
                wakeup: waketime
              }
            }
          }));
          
          // Update local state
          setRecommendedBedTime(bedtime);
          setRecommendedWakeTime(waketime);
          setShowRecommendation(true);
        }
      }
    };

    sleepTrackingService.onSleepWindowUpdate(handleSleepWindowUpdate);
    sleepTrackingService.onSleepQualityUpdate(handleSleepQualityUpdate);

    return () => {
      // Cleanup listeners when component unmounts
      sleepTrackingService.offSleepWindowUpdate(handleSleepWindowUpdate);
      sleepTrackingService.offSleepQualityUpdate(handleSleepQualityUpdate);
    };
  }, [settings.days]);

  const openTimePicker = (setting) => {
    const time = setting === 'bedtime' ? bedTime : wakeTime;
    const [hours, minutes] = time.split(':');
    setCustomHours(hours);
    setCustomMinutes(minutes);
    setSelectedSetting(setting);
    setShowTimePicker(true);
  };

  const handleTimeSubmit = () => {
    const hours = parseInt(customHours);
    const minutes = parseInt(customMinutes);
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Get current day
      const today = new Date().getDay();
      const adjustedDay = today === 0 ? 6 : today - 1;
      const currentDay = DAYS[adjustedDay];
      
      // Update settings with new time
      setSettings(prev => {
        const newSettings = {
          ...prev,
          days: {
            ...prev.days,
            [currentDay.id]: {
              ...prev.days[currentDay.id],
              [selectedSetting]: formattedTime,
            }
          }
        };

        // Update sleep tracking service with new times
        const daySettings = newSettings.days[currentDay.id];
        sleepTrackingService.setSleepWindow(daySettings.bedtime, daySettings.wakeup);

        // Update local state
        if (selectedSetting === 'bedtime') {
          setBedTime(formattedTime);
        } else {
          setWakeTime(formattedTime);
        }

        return newSettings;
      });
      
      setShowTimePicker(false);
    }
  };

  const applyRecommendation = () => {
    // Get current day
    const today = new Date().getDay();
    const adjustedDay = today === 0 ? 6 : today - 1;
    const currentDay = DAYS[adjustedDay];
    
    // Update settings with recommended times
    setSettings(prev => {
      const newSettings = {
        ...prev,
        days: {
          ...prev.days,
          [currentDay.id]: {
            ...prev.days[currentDay.id],
            bedtime: recommendedBedTime,
            wakeup: recommendedWakeTime,
          }
        },
        recommendations: {
          ...prev.recommendations,
          [currentDay.id]: null // Clear recommendation after applying
        }
      };

      // Update sleep tracking service with new times
      const daySettings = newSettings.days[currentDay.id];
      sleepTrackingService.setSleepWindow(daySettings.bedtime, daySettings.wakeup);

      return newSettings;
    });
    
    // Update local state
    setBedTime(recommendedBedTime);
    setWakeTime(recommendedWakeTime);
    setShowRecommendation(false);
    
    // Explicitly save settings to ensure persistence
    saveSettings();
  };

  return (
      <ScrollView 
      style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Alarm</Text>
            <View style={styles.titleDecoration} />
            <Text style={styles.subtitle}>Wake up refreshed and energized</Text>
          </View>
          <View style={styles.headerBackground}>
            <View style={styles.headerGlow} />
          <View style={styles.headerParticles}>
            <View style={styles.particle} />
            <View style={styles.particle} />
            <View style={styles.particle} />
          </View>
          </View>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
          <View style={styles.timeHeaderContent}>
            <Text style={styles.timeLabel}>Wake Up Time</Text>
            <Text style={styles.timeSubtitle}>Set your morning alarm</Text>
          </View>
          <View style={styles.timeIconContainer}>
            <BellRing size={24} color="#3B82F6" />
          </View>
          </View>
          
        <View style={styles.timeDisplay}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>07:30</Text>
            <View style={styles.timeIndicator}>
              <Sun size={16} color="#F59E0B" />
              <Text style={styles.timeIndicatorText}>Morning</Text>
            </View>
          </View>
          <Text style={styles.daysText}>Mon, Tue, Wed, Thu, Fri</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton}>
            <ChevronDown size={20} color="#94A3B8" />
            <Text style={styles.editButtonText}>Edit Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.alarmButton}>
            <Text style={styles.alarmButtonText}>Set Alarm</Text>
          </TouchableOpacity>
        </View>
            </View>

      <View style={styles.sleepInfoCard}>
        <View style={styles.sleepInfoHeader}>
          <View style={styles.sleepInfoTitleContainer}>
            <Text style={styles.sleepInfoTitle}>Sleep Tracking</Text>
            <Text style={styles.sleepInfoSubtitle}>Your sleep patterns</Text>
          </View>
          <View style={styles.sleepInfoIconContainer}>
            <Brain size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.cyclesContainer}>
          <TouchableOpacity 
            style={styles.cycleItem}
            onPress={() => openTimePicker('bedtime')}
          >
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>{bedTime}</Text>
            </View>
            <Text style={styles.cycleLabel}>Bedtime</Text>
            {showRecommendation && recommendedBedTime && recommendedBedTime !== bedTime && (
              <Text style={styles.recommendationText}>Recommended: {recommendedBedTime}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.cycleDivider} />
          <TouchableOpacity 
            style={styles.cycleItem}
            onPress={() => openTimePicker('wakeup')}
          >
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>{wakeTime}</Text>
          </View>
            <Text style={styles.cycleLabel}>Wake up</Text>
            {showRecommendation && recommendedWakeTime && recommendedWakeTime !== wakeTime && (
              <Text style={styles.recommendationText}>Recommended: {recommendedWakeTime}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {showRecommendation && recommendedBedTime && recommendedWakeTime && 
         (recommendedBedTime !== bedTime || recommendedWakeTime !== wakeTime) && (
          <TouchableOpacity 
            style={styles.recommendationButton}
            onPress={applyRecommendation}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.recommendationButtonText}>Apply Recommendation</Text>
          </TouchableOpacity>
        )}
      </View>

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
  headerParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    opacity: 0.3,
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
    letterSpacing: 0.5,
  },
  timeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeHeaderContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  timeSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  timeDisplay: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  timeIndicatorText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  daysText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    gap: 8,
  },
  editButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  alarmButton: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  alarmButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  sleepInfoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  sleepInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepInfoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  sleepInfoTitleContainer: {
    flex: 1,
  },
  sleepInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  sleepInfoSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  cyclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cycleItem: {
    alignItems: 'center',
    flex: 1,
  },
  cycleValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cycleLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  cycleValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  recommendationText: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  recommendationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
}); 