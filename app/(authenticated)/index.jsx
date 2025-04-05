import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Moon, Brain, Thermometer, Droplets, Volume2, Sun, Timer, BellRing, Activity } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAlarm } from '../../context/AlarmContext';
import { router } from 'expo-router';
import sleepTrackingService from '../../services/sleepTrackingService';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32; // Adjusted to match stats page

export default function Journal() {
  const { alarmTime, isAlarmActive } = useAlarm();
  const [sleepQuality, setSleepQuality] = useState(85);
  const [sleepDuration, setSleepDuration] = useState('7h 30m');
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(45);
  const [noise, setNoise] = useState(30);
  const [light, setLight] = useState(0);
  const [sleepCycles, setSleepCycles] = useState(4);
  const [sleepQualityData, setSleepQualityData] = useState({
    labels: ['22', '23', '0', '1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
      data: [30, 65, 85, 90, 95, 92, 88, 85, 80, 75],
    }],
  });
  const [sleepInsights, setSleepInsights] = useState([
    "Maintain a consistent sleep schedule by going to bed and waking up at the same time every day, even on weekends",
    "Keep your bedroom temperature between 18-22°C and ensure it's completely dark for optimal sleep conditions",
    "Avoid using electronic devices at least 1 hour before bedtime as blue light can disrupt your natural sleep cycle"
  ]);
  const [sleepData, setSleepData] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const slideUpAnim2 = useRef(new Animated.Value(100)).current;
  const slideUpAnim3 = useRef(new Animated.Value(100)).current;
  const slideUpAnim4 = useRef(new Animated.Value(100)).current;
  const slideUpAnim5 = useRef(new Animated.Value(100)).current;

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

    // Listen for sleep quality updates
    const handleSleepQualityUpdate = (data) => {
      // Convert scores object to arrays for the chart
      const times = Object.keys(data.scores);
      const scores = Object.values(data.scores);
      
      // Format time labels to show only hours
      const labels = times.map(time => {
        const [hours] = time.split(':');
        return hours;
      });

      // Update chart data
      setSleepQualityData({
        labels,
        datasets: [{
          data: scores,
        }],
      });

      // Calculate average sleep quality
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      setSleepQuality(Math.round(averageScore));

      // Update sleep duration (assuming 10-second intervals)
      const durationInMinutes = (scores.length * 10) / 60;
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = Math.round(durationInMinutes % 60);
      const formattedDuration = `${hours}h ${minutes}m`;
      setSleepDuration(formattedDuration);

      // Update sleep cycles (assuming 90-minute cycles)
      const cycles = Math.round(durationInMinutes / 90);
      setSleepCycles(cycles);

      // Update environment metrics based on average values
      if (data.environmental && data.environmental.length > 0) {
        const total = data.environmental.reduce((acc, curr) => ({
          temperature: acc.temperature + Number(curr.temperature),
          humidity: acc.humidity + Number(curr.humidity),
          noise: acc.noise + Number(curr.noise),
          light: acc.light + Number(curr.light)
        }), { temperature: 0, humidity: 0, noise: 0, light: 0 });

        const count = data.environmental.length;
        setTemperature(Math.round(total.temperature / count));
        setHumidity(Math.round(total.humidity / count));
        setNoise(Math.round(total.noise / count));
        setLight(Math.round(total.light / count));
      }

      // Update insights if available
      if (data.insights && data.insights.length > 0) {
        setSleepInsights(data.insights);
      }

      // Update Today's Sleep card with actual tracking data
      const today = new Date().toISOString().split('T')[0];
      const updatedSleepData = sleepData.map(entry => {
        if (entry.date === today) {
          return {
            ...entry,
            duration: formattedDuration,
            quality: Math.round(averageScore),
            isTracked: true
          };
        }
        return entry;
      });
      setSleepData(updatedSleepData);
    };

    sleepTrackingService.onSleepQualityUpdate(handleSleepQualityUpdate);

    return () => {
      sleepTrackingService.offSleepQualityUpdate(handleSleepQualityUpdate);
    };
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
      fontSize: Math.min(10, screenWidth / 40),
      fill: '#94A3B8',
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#E2E8F0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#334155',
    },
    paddingLeft: 15,
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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SleepyAI</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subtitle}>Your personal sleep companion</Text>
        </View>
        <View style={styles.headerBackground}>
          <View style={styles.headerGlow} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.todayCard, { transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.todayIconContainer}>
            <Moon size={28} color="#3B82F6" />
          </View>
          <View style={styles.todayHeaderContent}>
            <Text style={[styles.cardTitle, styles.todayTitle]}>Today's Sleep</Text>
            <Text style={styles.todayDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
        </View>
        <View style={styles.sleepStats}>
          <View style={styles.statItem}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{sleepDuration}</Text>
              <View style={styles.statValueUnderline} />
            </View>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{sleepQuality}%</Text>
              <View style={styles.statValueUnderline} />
            </View>
            <Text style={styles.statLabel}>Quality</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{sleepCycles}</Text>
              <View style={styles.statValueUnderline} />
            </View>
            <Text style={styles.statLabel}>Cycles</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.chartCard, { transform: [{ translateY: slideUpAnim2 }] }]}>
        <View style={styles.cardHeader}>
          <Activity size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.chartTitle]}>Sleep Quality Trend</Text>
        </View>
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
        <View style={styles.metricsContainer}>
          <View style={styles.metricsHeader}>
            <Text style={styles.metricsTitle}>Sleep Environment</Text>
          </View>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, styles.metricItemTemperature]}>
              <View style={styles.metricIconContainer}>
                <Thermometer size={20} color="#EF4444" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{temperature}°C</Text>
                <Text style={styles.metricLabel}>Temperature</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemHumidity]}>
              <View style={styles.metricIconContainer}>
                <Droplets size={20} color="#0EA5E9" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{humidity}%</Text>
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemNoise]}>
              <View style={styles.metricIconContainer}>
                <Volume2 size={20} color="#8B5CF6" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{noise}dB</Text>
                <Text style={styles.metricLabel}>Noise Level</Text>
              </View>
            </View>
            <View style={[styles.metricItem, styles.metricItemLight]}>
              <View style={styles.metricIconContainer}>
                <Sun size={20} color="#F59E0B" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>{light}%</Text>
                <Text style={styles.metricLabel}>Light Level</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cyclesCard, { transform: [{ translateY: slideUpAnim3 }] }]}>
        <View style={styles.cardHeader}>
          <Timer size={28} color="#3B82F6" />
          <Text style={[styles.cardTitle, styles.cyclesTitle]}>Today's Sleep Cycles</Text>
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
              <Text style={styles.cycleValue}>1.5</Text>
              <Text style={styles.cycleUnit}>hours</Text>
            </View>
            <Text style={styles.cycleLabel}>Avg Duration</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.insightsCard, { transform: [{ translateY: slideUpAnim4 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.insightsIconContainer}>
            <Brain size={28} color="#3B82F6" />
          </View>
          <View style={styles.insightsHeaderContent}>
            <Text style={[styles.cardTitle, styles.insightsTitle]}>Sleep Insights</Text>
            <Text style={styles.insightsSubtitle}>Personalized recommendations</Text>
          </View>
        </View>
        <View style={styles.insightsContainer}>
          {sleepInsights.length > 0 ? (
            sleepInsights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  {index === 0 ? (
                    <Timer size={20} color="#3B82F6" />
                  ) : index === 1 ? (
                    <Thermometer size={20} color="#3B82F6" />
                  ) : (
                    <Sun size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No insights available yet</Text>
          )}
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.alarmCard, { transform: [{ translateY: slideUpAnim5 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.alarmIconContainer}>
            <BellRing size={28} color="#3B82F6" />
          </View>
          <View style={styles.alarmHeaderContent}>
            <Text style={[styles.cardTitle, styles.alarmTitle]}>Next Alarm</Text>
            <TouchableOpacity onPress={() => router.push('/alarm')}>
              <Text style={styles.alarmEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.alarmContent}>
          <Text style={styles.alarmTime}>{alarmTime}</Text>
          <View style={styles.alarmInfo}>
            <Text style={styles.alarmStatus}>
              {isAlarmActive ? 'Alarm is set' : 'No alarm set'}
            </Text>
            <Text style={styles.timeUntilAlarm}>
              {isAlarmActive ? `in ${getTimeUntilAlarm()}` : ''}
            </Text>
          </View>
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
    paddingBottom: 50, // Reduced padding to prevent navbar clipping
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
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
    fontSize: 48,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 1,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleDecoration: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 60,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 12,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#E2E8F0',
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statValueContainer: {
    alignItems: 'center',
  },
  statValueUnderline: {
    width: 40,
    height: 1,
    backgroundColor: '#3B82F6',
    marginTop: 0,
    borderRadius: 1,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightContent: {
    flex: 1,
    paddingTop: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  alarmCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  alarmIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alarmHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  alarmEdit: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  alarmContent: {
    padding: 16,
    alignItems: 'center',
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  alarmInfo: {
    alignItems: 'center',
    gap: 4,
  },
  alarmStatus: {
    fontSize: 14,
    color: '#94A3B8',
  },
  timeUntilAlarm: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  chartCard: {
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  chartTitle: {
    fontSize: 22,
    color: '#E2E8F0',
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
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 4,
    marginLeft: -20,
    borderRadius: 16,
    alignSelf: 'center',
  },
  metricsContainer: {
    marginTop: 24,
  },
  metricsHeader: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  metricIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  metricItemTemperature: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderColor: '#EF4444',
  },
  metricItemHumidity: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderColor: '#0EA5E9',
  },
  metricItemNoise: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderColor: '#8B5CF6',
  },
  metricItemLight: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderColor: '#F59E0B',
  },
  metricContent: {
    flex: 1,
    paddingRight: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cyclesCard: {
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
  },
  cyclesTitle: {
    fontSize: 22,
    color: '#E2E8F0',
  },
  cyclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  cycleItem: {
    alignItems: 'center',
    flex: 1,
  },
  cycleValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cycleValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  cycleUnit: {
    fontSize: 16,
    color: '#94A3B8',
    marginLeft: 4,
  },
  cycleLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  cycleDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  insightsCard: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    padding: 24,
  },
  insightsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsHeaderContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightsTitle: {
    fontSize: 22,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 8,
  },
  insightsContainer: {
    marginTop: 16,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  todayCard: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    padding: 24,
  },
  todayHeaderContent: {
    marginLeft: 12,
    flex: 1,
  },
  todayTitle: {
    fontSize: 22,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  todayDate: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 8,
  },
  todayIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 