import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Moon, Brain, Thermometer, Droplets, Volume2, Sun, Timer, BellRing, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAlarm } from '../../context/AlarmContext';
import { useDevice } from '../../context/DeviceContext';
import { router } from 'expo-router';
import sleepTrackingService from '../../services/sleepTrackingService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32; // Adjusted to match stats page

export default function Journal() {
  const { alarmTime, isAlarmActive } = useAlarm();
  const { deviceId } = useDevice();
  const [sleepQuality, setSleepQuality] = useState(85);
  const [sleepDuration, setSleepDuration] = useState('7:30');
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(45);
  const [noise, setNoise] = useState(30);
  const [light, setLight] = useState(1);
  const [sleepCycles, setSleepCycles] = useState(4);
  const [cycleDuration, setCycleDuration] = useState(90);
  const [sleepQualityData, setSleepQualityData] = useState({
    labels: ['22', '23', '0', '1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [0, 45, 20, 85, 70, 90, 40, 70, 30, 0],
    }],
  });
  const [sleepData, setSleepData] = useState([]);
  const [latestSleepDate, setLatestSleepDate] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const slideUpAnim2 = useRef(new Animated.Value(100)).current;
  const slideUpAnim3 = useRef(new Animated.Value(100)).current;
  const slideUpAnim4 = useRef(new Animated.Value(100)).current;
  const slideUpAnim5 = useRef(new Animated.Value(100)).current;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Today\'s Sleep';
    
    const sleepDate = new Date(dateString);
    const now = new Date();
    
    // Compare dates without time
    const sleepDateOnly = new Date(sleepDate.getFullYear(), sleepDate.getMonth(), sleepDate.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get the difference in days
    const diffTime = nowDateOnly - sleepDateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today\'s Sleep';
    } else if (diffDays === 1) {
      return 'Yesterday\'s Sleep';
    } else {
      return 'Latest Sleep';
    }
  };

  // Format date subtitle
  const formatDateSubtitle = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load saved sleep data and chart data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const records = await sleepTrackingService.getSleepRecords();
        
        if (records && records.length > 0) {
          // Get the latest record (first in the array)
          const latest = records[0];
          
          setLatestSleepDate(latest.date);
          setSleepQuality(latest.quality);
          setSleepDuration(`${Math.floor(latest.duration / 60)}:${(latest.duration % 60).toString().padStart(2, '0')}`);
          setSleepCycles(latest.cycles);
          setCycleDuration(latest.cycleDuration);
          setTemperature(latest.environmental.temperature);
          setHumidity(latest.environmental.humidity);
          setNoise(latest.environmental.noise);
          setLight(latest.environmental.light);

          // Update chart data
          if (latest.qualityScores) {
            const labels = Object.keys(latest.qualityScores).map(time => {
              const [hours] = time.split(':');
              return hours;
            });
            const data = Object.values(latest.qualityScores);
            setSleepQualityData({
              labels,
              datasets: [{ data }]
            });
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();

    // Listen for sleep records updates
    const handleSleepRecordsUpdate = (records) => {
      loadSavedData(); // Reload data when records are updated
    };

    sleepTrackingService.onSleepRecordsUpdate(handleSleepRecordsUpdate);
    return () => {
      sleepTrackingService.offSleepRecordsUpdate(handleSleepRecordsUpdate);
    };
  }, []);

  // Listen for sleep quality updates
  useEffect(() => {
    const handleSleepQualityUpdate = (data) => {
      // Update sleep quality scores
      setSleepQuality(data.quality);
      
      // Update sleep duration
      if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
        const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
        const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
        
        let actualSleepDuration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle overnight case
        if (actualSleepDuration < 0) {
          actualSleepDuration += 24 * 60; // Add 24 hours worth of minutes
        }
        
        const hours = Math.floor(actualSleepDuration / 60);
        const minutes = actualSleepDuration % 60;
        setSleepDuration(`${hours}:${minutes.toString().padStart(2, '0')}`);
      }

      // Update sleep cycles
      if (data.cycles) {
        setSleepCycles(data.cycles.count);
        // Calculate average duration by dividing actual sleep duration by number of cycles
        if (data.actualSleep && data.actualSleep.start && data.actualSleep.end) {
          const [startHours, startMinutes] = data.actualSleep.start.split(':').map(Number);
          const [endHours, endMinutes] = data.actualSleep.end.split(':').map(Number);
          
          let actualSleepDuration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
          
          // Handle overnight case
          if (actualSleepDuration < 0) {
            actualSleepDuration += 24 * 60; // Add 24 hours worth of minutes
          }
          
          setCycleDuration(Math.round(actualSleepDuration / data.cycles.count));
        }
      }

      // Update environmental metrics
      if (data.environmental) {
        setTemperature(data.environmental.temperature);
        setHumidity(data.environmental.humidity);
        setNoise(data.environmental.noise);
        setLight(data.environmental.light);
      }

      // Update chart data
      if (data.scores) {
        const labels = Object.keys(data.scores).map(time => {
          const [hours] = time.split(':');
          return hours;
        });
        const values = Object.values(data.scores);
        setSleepQualityData({
          labels,
          datasets: [{ data: values }]
        });
      }
    };

    sleepTrackingService.onSleepQualityUpdate(handleSleepQualityUpdate);
    return () => {
      sleepTrackingService.offSleepQualityUpdate(handleSleepQualityUpdate);
    };
  }, []);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim2, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim3, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim4, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim5, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const chartConfig = {
    backgroundColor: '#0F172A',
    backgroundGradientFrom: '#0F172A',
    backgroundGradientTo: '#0F172A',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: Math.min(12, screenWidth / 35),
      fill: '#94A3B8',
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#E2E8F0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#334155',
    },
    paddingLeft: -30,
    paddingRight: 15,
  };

  const getTimeUntilAlarm = () => {
    const [hours, minutes] = alarmTime.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date(now);
    alarmTime.setHours(hours, minutes, 0, 0);

    // If the alarm time is in the past, set it for tomorrow
    if (alarmTime < now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const diff = alarmTime - now;
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}m`;
    }
    return `${minutesUntil}m`;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>SleepyAI</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.appSubtitle}>Your personal sleep companion</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.todayCard, { transform: [{ translateY: slideUpAnim }], marginTop: 12 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.todayHeaderContent}>
            <Text style={styles.todayTitle}>
              {latestSleepDate ? formatDate(latestSleepDate) : 'Today\'s Sleep'}
            </Text>
            <Text style={styles.todaySubtitle}>
              {latestSleepDate ? formatDateSubtitle(latestSleepDate) : new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.todayIconContainer}>
            <Moon size={24} color="#3B82F6" />
          </View>
        </View>

        <View style={styles.todayContent}>
          <View style={styles.chartContainer}>
            <LineChart
              data={sleepQualityData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, styles.metricItemDuration]}>
              <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(132, 204, 22, 0.1)' }]}>
                <Timer size={24} color="#84CC16" />
              </View>
              <View style={styles.metricContent}>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{sleepDuration}</Text>
                </View>
                <Text style={styles.metricLabel}>Sleep Duration</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemQuality]}>
              <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                <Brain size={24} color="#06B6D4" />
              </View>
              <View style={styles.metricContent}>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{sleepQuality}%</Text>
                </View>
                <Text style={styles.metricLabel}>Sleep Quality</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cyclesCard, { transform: [{ translateY: slideUpAnim2 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.insightsHeaderContent}>
            <Text style={[styles.cardTitle, styles.cyclesTitle]}>Sleep Cycles</Text>
            <Text style={styles.insightsSubtitle}>Your sleep stages</Text>
          </View>
          <View style={styles.todayIconContainer}>
            <Timer size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.cyclesContainer}>
          <View style={styles.cycleItem}>
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>{sleepCycles}</Text>
              <Text style={styles.cycleUnit}>cycles</Text>
            </View>
            <Text style={styles.cycleLabel}>Total Cycles</Text>
          </View>
          <View style={styles.cycleDivider} />
          <View style={styles.cycleItem}>
            <View style={styles.cycleValueContainer}>
              <Text style={styles.cycleValue}>{cycleDuration}</Text>
              <Text style={styles.cycleUnit}>min</Text>
            </View>
            <Text style={styles.cycleLabel}>Avg Duration</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.environmentCard, { transform: [{ translateY: slideUpAnim3 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.environmentHeaderContent}>
            <Text style={[styles.cardTitle, styles.environmentTitle]}>Sleep Environment</Text>
            <Text style={styles.environmentSubtitle}>Your environment metrics</Text>
          </View>
          <View style={styles.environmentIconContainer}>
            <Activity size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricItem, styles.metricItemTemperature]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
              <Thermometer size={24} color="#EC4899" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{temperature}°C</Text>
              <Text style={styles.metricLabel}>Temperature</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemHumidity]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(14, 165, 233, 0.1)' }]}>
              <Droplets size={24} color="#0EA5E9" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{humidity}%</Text>
              <Text style={styles.metricLabel}>Humidity</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemNoise]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Volume2 size={24} color="#6366F1" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{noise} dB</Text>
              <Text style={styles.metricLabel}>Noise Level</Text>
            </View>
          </View>
          <View style={[styles.metricItem, styles.metricItemLight]}>
            <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Sun size={24} color="#F59E0B" />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{light} lux</Text>
              <Text style={styles.metricLabel}>Light Level</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.alarmCard, { transform: [{ translateY: slideUpAnim4 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.insightsHeaderContent}>
            <Text style={[styles.cardTitle, styles.alarmTitle]}>Next Alarm</Text>
            <Text style={styles.insightsSubtitle}>Wake-up time</Text>
          </View>
          <View style={styles.todayIconContainer}>
            <BellRing size={24} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.alarmContent}>
          <View style={styles.alarmTimeContainer}>
            <Text style={styles.alarmTime}>{alarmTime}</Text>
            <View style={styles.alarmStatusContainer}>
              <View style={[styles.alarmStatusDot, { backgroundColor: isAlarmActive ? '#3B82F6' : '#94A3B8' }]} />
              <Text style={styles.alarmStatus}>
                {isAlarmActive ? 'Alarm is set' : 'No alarm set'}
              </Text>
            </View>
          </View>
          {isAlarmActive && (
            <View style={styles.alarmCountdown}>
              <Text style={styles.timeUntilAlarm}>
                {getTimeUntilAlarm()}
              </Text>
              <Text style={styles.countdownLabel}>until alarm</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.alarmEditButton}
            onPress={() => router.push('/alarm')}
          >
            <Text style={styles.alarmEditText}>Edit Alarm</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  appTitleContainer: {
    position: 'relative',
    zIndex: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(226, 232, 240, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  appSubtitle: {
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
  todayCard: {
    marginTop: 0,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  todayContent: {
    flexDirection: 'column',
    gap: 16,
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  statUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  chartContainer: {
    marginVertical: 8,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
    overflow: 'hidden'
  },
  chart: {
    marginVertical: 4,
    marginLeft: -20,
    borderRadius: 8,
    alignSelf: 'center',
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
  cycleUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  cyclesCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  cyclesTitle: {
    fontSize: 20,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  insightsContainer: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  alarmCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  alarmContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  alarmTime: {
    fontSize: 40,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  alarmStatus: {
    fontSize: 14,
    color: '#94A3B8',
  },
  alarmEditButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  alarmEditText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  todayHeaderContent: {
    flex: 1,
  },
  todayTitleContainer: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  todayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  environmentCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  environmentHeaderContent: {
    flex: 1,
  },
  environmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  environmentSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  environmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  metricIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricContent: {
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  metricUnit: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricItemDuration: {
    backgroundColor: 'rgba(132, 204, 22, 0.1)',
    borderColor: 'rgba(132, 204, 22, 0.2)',
  },
  metricItemQuality: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  alarmTimeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
  },
  alarmStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alarmCountdown: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  timeUntilAlarm: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3B82F6',
    textShadowColor: 'rgba(59, 130, 246, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countdownLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  alarmIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  insightsCard: {
    borderColor: 'rgba(51, 65, 85, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  insightsHeaderContent: {
    flex: 1,
  },
  insightsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  alarmSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricItemTemperature: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  metricItemHumidity: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  metricItemNoise: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  metricItemLight: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  insightIconContainerTimer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  insightIconContainerThermometer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  insightIconContainerSun: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
}); 